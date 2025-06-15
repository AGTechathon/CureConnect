import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

// Initialize Google AI
const genAI = new GoogleGenerativeAI('AIzaSyASSY9fkUZY2Q9cYsCd-mTMK0sr98lPh30');

interface CloudinaryResponse {
  secure_url: string;
  error?: {
    message: string;
  };
}

// Define prompts for different analysis types
const analysisPrompts: { [key: string]: string } = {
  xray: "You are an expert radiologist. Analyze the provided X-ray image and determine if there are any abnormalities. Provide a detailed report including findings, potential diagnoses, and a confidence score. If any issue is detected, also mention the suspected type and affected region with a probability score and in a user-friendly language.",
  ecg: "You are an expert cardiologist. Analyze the provided ECG image (assuming a visual representation of an ECG). Identify any arrhythmias, conduction abnormalities, or signs of ischemia/infarction. Provide a detailed interpretation with confidence levels and in a user-friendly language.",
  pet: "You are an expert oncologist specializing in PET scan analysis. Analyze the provided PET scan image to identify any metabolic abnormalities or signs of malignancy. Provide a detailed report on tumor activity, location, and a confidence score. If cancer is detected, also mention the suspected type and affected region with a probability score and in a user-friendly language.",
  alzheimer: "You are an expert neurologist specializing in CT scan analysis. Analyze the provided CT scan image and determine whether it indicates signs of Alzheimer. Provide a confidence score (in percentage) for your diagnosis. If Alzheimer is detected, also mention the suspected type and affected region with a probability score and in a user friendly language.",
  skin: "You are an expert dermatologist. Analyze the provided image of skin and determine if there are any signs of common skin diseases (e.g., eczema, psoriasis, acne, melanoma). Provide a likely diagnosis, severity, and a confidence score. If any issue is detected, also mention the suspected type and affected region with a probability score and in a user-friendly language.",
  retinopathy: "You are an expert ophthalmologist. Analyze the provided retinal image and determine if there are any signs of diabetic retinopathy or other retinal abnormalities. Provide a detailed report on the presence and severity of retinopathy, confidence score, and in a user-friendly language.",
};

const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('upload_preset', 'teleconnect');

    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dfwzeazkg/image/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data: CloudinaryResponse = await cloudinaryResponse.json();
    if (cloudinaryResponse.ok) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const formatAnalysisResults = (rawResult: string): string => {
  const lines = rawResult.split('\n').filter(line => line.trim() !== '');
  
  const formattedLines = lines.map(line => {
    if (line.toLowerCase().includes('alzheimer')) {
      return `**${line}**`;
    }
    if (line.includes('Confidence') || line.includes('Probability')) {
      return `**${line}**`;
    }
    if (line.includes('Type') || line.includes('Region')) {
      return `**${line}**`;
    }
    return line;
  });

  return formattedLines.join('\n');
};

const analyzeImage = async (imageUrl: string, analysisType: string): Promise<string> => {
  try {
    const prompt = analysisPrompts[analysisType] || analysisPrompts.alzheimer; // Default to Alzheimer if type not found
    const fetchResponse = await fetch(imageUrl);
    const blob = await fetchResponse.blob();
    
    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const modelResponse = await result.response;
    return formatAnalysisResults(modelResponse.text());
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

const generatePDF = async (analysis: string, imageUrl?: string): Promise<boolean> => {
  try {
    const currentDate = new Date().toLocaleString();
    const reportId = `RPT-${Date.now()}`;
    
    // Enhanced HTML template with beautiful styling
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CT Scan Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.15"/><circle cx="20" cy="80" r="0.5" fill="white" opacity="0.15"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
            z-index: 1;
        }
        
        .report-meta {
            background: #f8fafc;
            padding: 25px 30px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .meta-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .meta-value {
            color: #2d3748;
            font-weight: 500;
        }
        
        .content-section {
            padding: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: inline-block;
        }
        
        .analysis-card {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 15px;
            padding: 25px;
            border-left: 5px solid #667eea;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .analysis-content {
            font-size: 15px;
            line-height: 1.8;
            white-space: pre-line;
        }
        
        .highlight {
            background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
            padding: 2px 0;
        }
        
        .image-section {
            text-align: center;
            margin: 25px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 15px;
        }
        
        .scan-image {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            margin-bottom: 15px;
        }
        
        .image-caption {
            font-size: 14px;
            color: #718096;
            font-style: italic;
        }
        
        .disclaimer {
            background: #fff5f5;
            border: 1px solid #feb2b2;
            border-radius: 15px;
            padding: 20px;
            margin-top: 25px;
        }
        
        .disclaimer-title {
            font-weight: 600;
            color: #c53030;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .disclaimer-text {
            color: #744210;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .footer {
            background: #2d3748;
            color: white;
            padding: 25px 30px;
            text-align: center;
        }
        
        .footer-text {
            font-size: 13px;
            opacity: 0.8;
            margin-bottom: 8px;
        }
        
        .footer-logo {
            font-weight: 600;
            font-size: 16px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            margin: 10px 0;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .report-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🏥 CureConnect</div>
            <div class="subtitle">AI-Powered Medical Image Analysis Report</div>
        </div>
        
        <!-- Report Metadata -->
        <div class="report-meta">
            <div class="meta-grid">
                <div class="meta-item">
                    <span class="meta-label">Report ID:</span>
                    <span class="meta-value">${reportId}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Generated:</span>
                    <span class="meta-value">${currentDate}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Analysis Type:</span>
                    <span class="meta-value">CT Scan - Neurological</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Status:</span>
                    <span class="status-badge">Completed</span>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content-section">
            ${imageUrl ? `
            <div class="image-section">
                <img src="${imageUrl}" alt="CT Scan Image" class="scan-image">
                <div class="image-caption">Analyzed CT Scan Image</div>
            </div>
            ` : ''}
            
            <h2 class="section-title">🧠 Analysis Results</h2>
            <div class="analysis-card">
                <div class="analysis-content">${analysis.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')}</div>
            </div>
            
            <h2 class="section-title">📋 Clinical Notes</h2>
            <div class="analysis-card">
                <div class="analysis-content">
• This analysis was performed using advanced AI technology
• Results are based on image pattern recognition and machine learning algorithms
• Multiple diagnostic markers were evaluated for comprehensive assessment
• Confidence scores reflect the AI model's certainty in the analysis
                </div>
            </div>
            
            <!-- Disclaimer -->
            <div class="disclaimer">
                <div class="disclaimer-title">⚠️ Important Medical Disclaimer</div>
                <div class="disclaimer-text">
                    This report is generated by an AI system for demonstration purposes only. 
                    It should not be used as a substitute for professional medical diagnosis or treatment. 
                    Always consult with qualified healthcare professionals for medical decisions. 
                    The AI analysis is intended to assist healthcare providers and should be validated by medical experts.
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">Report generated on ${currentDate}</div>
            <div class="footer-logo">CureConnect - Advancing Healthcare with AI</div>
        </div>
    </div>
</body>
</html>`;

    // Generate PDF using expo-print
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 612,  // Standard letter width in points
      height: 792, // Standard letter height in points
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    });

    // Directly share the PDF URI
    Alert.alert(
      '✅ PDF Report Generated Successfully!',
      'Your medical analysis report has been prepared. Would you like to share it?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share Report',
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share Medical Analysis Report',
              });
            }
          },
        },
      ]
    );

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert(
      '❌ PDF Generation Failed', 
      'Unable to generate the report. Please check your device storage and try again.'
    );
    return false;
  }
};

const CureConnectApp: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('alzheimer'); // Default to Alzheimer
  const [items, setItems] = useState([
    { label: 'X-ray Analysis', value: 'xray' },
    { label: 'ECG Analysis', value: 'ecg' },
    { label: 'PET Analysis', value: 'pet' },
    { label: 'Alzheimer Analysis', value: 'alzheimer' },
    { label: 'Skin Diseases', value: 'skin' },
    { label: 'Retinopathy Detection', value: 'retinopathy' },
  ]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async (): Promise<void> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permission needed', 'Camera and media library permissions are required.');
    }
  };

  const pickImage = async (): Promise<void> => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysis(null);
      setCloudinaryUrl(null);
    }
  };

  const handleUploadAndAnalyze = async (): Promise<void> => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const cloudinaryUrl = await uploadToCloudinary(selectedImage);
      setCloudinaryUrl(cloudinaryUrl);
      const result = await analyzeImage(cloudinaryUrl, value); // Pass selected analysis type
      setAnalysis(result);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setAnalysis('Error processing image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = (): void => {
    setSelectedImage(null);
    setAnalysis(null);
    setCloudinaryUrl(null);
  };

  const handleGeneratePDF = (): void => {
    if (!analysis) {
      Alert.alert('No Data', 'No analysis data available to generate report.');
      return;
    }
    generatePDF(analysis, cloudinaryUrl || undefined);
  };

  const renderBoldText = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*(.*?)\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="medical" size={32} color="#2563eb" />
          <Text style={styles.headerTitle}>CureConnect AI Assistant</Text>
        </View>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            containerStyle={styles.dropdownStyle}
            style={styles.dropdown}
            itemSeparator={true}
            itemSeparatorStyle={{
              backgroundColor: "#d1d5db",
            }}
            textStyle={{
              fontSize: 16,
              color: "#374151",
            }}
            selectedItemContainerStyle={{
              backgroundColor: "#e0f2fe",
            }}
            dropDownContainerStyle={{
              borderColor: "#d1d5db",
              borderRadius: 12,
              backgroundColor: "#f9fafb",
            }}
            labelStyle={{
              fontWeight: "bold"
            }}
            ArrowDownIconComponent={({ style }) => <Ionicons name="chevron-down" size={20} color="#6b7280" style={style as any} />}
            ArrowUpIconComponent={({ style }) => <Ionicons name="chevron-up" size={20} color="#6b7280" style={style as any} />}
            tickIconStyle={{
              width: 20,
              height: 20,
            }}
            zIndex={1000}
            onSelectItem={() => setOpen(false)}
          />
        </View>
      </View>

      <KeyboardAwareScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
      >
        {/* Main Container */}
        <View style={styles.mainContainer}>
          {/* Image Upload Section */}
          <View style={styles.uploadSection}>
            {!selectedImage ? (
              <View style={styles.uploadArea}>
                <Ionicons name="cloud-upload-outline" size={64} color="#9ca3af" />
                <Text style={styles.uploadTitle}>Upload an image for analysis</Text>
                <Text style={styles.uploadSubtitle}>Tap to select from camera or gallery</Text>
                <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                  <Text style={styles.selectButtonText}>Select Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.analyzeButton]}
                    onPress={handleUploadAndAnalyze}
                    disabled={isAnalyzing}
                  >
                    <Text style={styles.buttonText}>
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resetButton]}
                    onPress={resetAnalysis}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Analysis Results Section */}
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsHeaderLeft}>
                <Ionicons name="information-circle" size={24} color="#2563eb" />
                <Text style={styles.resultsTitle}>Analysis Results</Text>
              </View>
            </View>

            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Processing your image...</Text>
              </View>
            ) : analysis ? (
              <View style={styles.analysisContainer}>
                <Text style={styles.analysisText}>
                  {renderBoldText(analysis)}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="image-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>Upload an image to receive analysis</Text>
              </View>
            )}
          </View>
          
          {analysis && (
            <TouchableOpacity
              style={styles.bottomPdfButton}
              onPress={handleGeneratePDF}
            >
              <Ionicons name="download" size={24} color="white" />
              <Text style={styles.bottomPdfButtonText}>Download PDF Report</Text>
            </TouchableOpacity>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This is a demonstration of AI-powered medical image analysis.
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  header: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  dropdownContainer: {
    width: '100%',
    zIndex: 1000,
  },
  dropdownStyle: {
    height: 50,
    width: '100%',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mainContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  uploadSection: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    marginBottom: 24,
  },
  uploadArea: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzeButton: {
    backgroundColor: '#3b82f6',
  },
  resetButton: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 16,
  },
  analysisContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  analysisText: {
    color: '#374151',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  disclaimer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disclaimerText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 30,
    width: '90%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  bottomPdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default CureConnectApp;
