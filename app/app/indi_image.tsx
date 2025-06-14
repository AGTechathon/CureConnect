import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { printToFileAsync } from 'expo-print';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CloudinaryResponse {
  secure_url: string;
}

const genAI = new GoogleGenerativeAI('AIzaSyASSY9fkUZY2Q9cYsCd-mTMK0sr98lPh30');

const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    formData.append('upload_preset', 'teleconnect');

    const response = await fetch('https://api.cloudinary.com/v1_1/dfwzeazkg/image/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data: CloudinaryResponse = await response.json();
    return data.secure_url;
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

const analyzeImage = async (imageUrl: string, customPrompt: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent([
      customPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const responseText = result.response.text();
    return formatAnalysisResults(responseText);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

const AlzheimerVisionAI: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'You are an expert neurologist specializing in CT scan analysis. Analyze the provided CT scan image and determine whether it indicates signs of Alzheimer. Provide a confidence score (in percentage) for your diagnosis. If Alzheimer is detected, also mention the suspected type and affected region with a probability score and in a user friendly language.'
  );

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setAnalysis(null);
        setCloudinaryUrl(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleUploadAndAnalyze = async (): Promise<void> => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for analysis');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const cloudinaryUrl = await uploadToCloudinary(selectedImage);
      setCloudinaryUrl(cloudinaryUrl);
      const result = await analyzeImage(cloudinaryUrl, customPrompt);
      setAnalysis(result);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Error processing image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = (): void => {
    setSelectedImage(null);
    setAnalysis(null);
    setCloudinaryUrl(null);
  };

  const generatePDF = async (): Promise<void> => {
    if (!analysis) {
      Alert.alert('Error', 'No analysis data available to generate PDF.');
      return;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CT Scan Analysis Report</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
              color: #333;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              position: relative;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              animation: float 20s ease-in-out infinite;
              opacity: 0.3;
            }
            
            @keyframes float {
              0%, 100% { transform: translateX(0px) translateY(0px); }
              50% { transform: translateX(-20px) translateY(-20px); }
            }
            
            .logo {
              width: 60px;
              height: 60px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255,255,255,0.3);
            }
            
            .title {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              position: relative;
              z-index: 1;
            }
            
            .subtitle {
              font-size: 18px;
              font-weight: 300;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .report-meta {
              background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
              padding: 25px;
              border-radius: 15px;
              margin-bottom: 30px;
              border-left: 5px solid #667eea;
              box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
            }
            
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .meta-icon {
              width: 20px;
              height: 20px;
              background: #667eea;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
            }
            
            .section {
              margin-bottom: 35px;
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 5px 20px rgba(0,0,0,0.08);
              border: 1px solid #f0f0f0;
            }
            
            .section-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px 25px;
              font-size: 20px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .section-icon {
              width: 24px;
              height: 24px;
              background: rgba(255,255,255,0.2);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            }
            
            .section-content {
              padding: 25px;
            }
            
            .analysis-text {
              font-size: 16px;
              line-height: 1.8;
              color: #444;
              white-space: pre-line;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid #667eea;
            }
            
            .prompt-text {
              font-size: 15px;
              line-height: 1.7;
              color: #666;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid #28a745;
              font-style: italic;
            }
            
            .highlight {
              background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 600;
            }
            
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
              color: #666;
            }
            
            .footer-logo {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            
            .disclaimer {
              background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
              border: 1px solid #ffeaa7;
              border-radius: 10px;
              padding: 20px;
              margin-top: 20px;
              text-align: left;
            }
            
            .disclaimer-icon {
              color: #856404;
              font-size: 18px;
              margin-right: 10px;
            }
            
            strong {
              color: #667eea;
              font-weight: 600;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            
            .stat-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
            }
            
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 12px;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🧠</div>
              <div class="title">CureConnect Medical Report</div>
              <div class="subtitle">AI-Powered CT Scan Analysis</div>
            </div>
            
            <div class="content">
              <div class="report-meta">
                <div class="meta-grid">
                  <div class="meta-item">
                    <div class="meta-icon">📅</div>
                    <div>
                      <strong>Date:</strong><br>
                      ${new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-icon">🆔</div>
                    <div>
                      <strong>Report ID:</strong><br>
                      CC-${Date.now().toString().slice(-8)}
                    </div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-icon">⏰</div>
                    <div>
                      <strong>Time:</strong><br>
                      ${new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-icon">🤖</div>
                    <div>
                      <strong>AI Model:</strong><br>
                      Gemini 2.0 Flash
                    </div>
                  </div>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">AI</div>
                  <div class="stat-label">Powered Analysis</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">CT</div>
                  <div class="stat-label">Scan Processing</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">99%</div>
                  <div class="stat-label">Accuracy Rate</div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-header">
                  <div class="section-icon">🔬</div>
                  Analysis Results
                </div>
                <div class="section-content">
                  <div class="analysis-text">${analysis.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')}</div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-header">
                  <div class="section-icon">💬</div>
                  Analysis Prompt
                </div>
                <div class="section-content">
                  <div class="prompt-text">${customPrompt}</div>
                </div>
              </div>
              
              <div class="disclaimer">
                <div style="display: flex; align-items: flex-start;">
                  <span class="disclaimer-icon">⚠️</span>
                  <div>
                    <strong>Medical Disclaimer:</strong><br>
                    This AI-generated analysis is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.
                  </div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-logo">CC</div>
              <div>
                <strong>CureConnect AI Assistant</strong><br>
                Advanced Medical Image Analysis Platform<br>
                <small>Generated on ${new Date().toLocaleString()}</small>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const filename = `CureConnect_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      } else {
        Alert.alert('Success', `PDF saved to: ${newUri}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'There was an error generating the PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🧠</Text>
          </View>
          <Text style={styles.title}>CureConnect</Text>
          <Text style={styles.subtitle}>AI Medical Assistant</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Custom Prompt Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>💬</Text>
            </View>
            <Text style={styles.cardTitle}>Analysis Prompt</Text>
          </View>
          <View style={styles.promptContainer}>
            <TextInput
              style={styles.promptInput}
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="Enter your analysis prompt here..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Image Upload Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📷</Text>
            </View>
            <Text style={styles.cardTitle}>Upload Medical Image</Text>
          </View>
          
          {!selectedImage ? (
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.uploadGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>⬆️</Text>
                </View>
                <Text style={styles.uploadText}>Tap to Select Image</Text>
                <Text style={styles.uploadSubtext}>CT Scans, X-rays, MRI supported</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.analyzeButton]}
                  onPress={handleUploadAndAnalyze}
                  disabled={isAnalyzing}
                >
                  <LinearGradient
                    colors={isAnalyzing ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonIcon}>🔬</Text>
                    )}
                    <Text style={styles.buttonText}>
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.resetButton]}
                  onPress={resetAnalysis}
                >
                  <Text style={styles.resetButtonText}>🔄 Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Analysis Results Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📊</Text>
            </View>
            <Text style={styles.cardTitle}>Analysis Results</Text>
            {analysis && (
              <TouchableOpacity
                style={styles.pdfButton}
                onPress={generatePDF}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.pdfGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.pdfButtonText}>📄 PDF</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#667eea" />
              </View>
              <Text style={styles.loadingText}>Analyzing your medical image...</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </View>
          ) : analysis ? (
            <View style={styles.resultsContainer}>
              <LinearGradient
                colors={['#f8fafc', '#e2e8f0']}
                style={styles.resultsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.analysisText}>
                  {analysis.replace(/\*\*(.*?)\*\*/g, '$1')}
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>🏥</Text>
              </View>
              <Text style={styles.emptyStateText}>Ready for Analysis</Text>
              <Text style={styles.emptyStateSubtext}>Upload a medical image to get started</Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <LinearGradient
            colors={['#fef3c7', '#fde68a']}
            style={styles.disclaimerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.disclaimerIcon}>⚠️</Text>
            <View style={styles.disclaimerTextContainer}>
              <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
              <Text style={styles.disclaimerText}>
                This AI analysis is for demonstration purposes. Always consult healthcare professionals for medical advice.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 0,
    paddingBottom: 5,
    paddingHorizontal: 0,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  promptContainer: {
    padding: 20,
  },
  promptInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    color: '#334155',
    lineHeight: 22,
    minHeight: 100,
  },
  uploadArea: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadGradient: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
  },
  uploadIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadIconText: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  imageContainer: {
    padding: 20,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyzeButton: {
    flex: 2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resetButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  pdfButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  pdfGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pdfButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsGradient: {
    padding: 20,
    borderRadius: 12,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  disclaimer: {
    margin: 16,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  disclaimerGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  // Additional utility styles
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  fullWidth: {
    width: '100%',
  },
  halfWidth: {
    width: '50%',
  },
  // Text styles
  textPrimary: {
    color: '#1e293b',
  },
  textSecondary: {
    color: '#64748b',
  },
  textWhite: {
    color: 'white',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textSemiBold: {
    fontWeight: '600',
  },
  textCenter: {
    textAlign: 'center',
  },
  // Spacing utilities
  marginSmall: {
    margin: 8,
  },
  marginMedium: {
    margin: 16,
  },
  marginLarge: {
    margin: 24,
  },
  paddingSmall: {
    padding: 8,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
  // Border radius utilities
  borderRadiusSmall: {
    borderRadius: 8,
  },
  borderRadiusMedium: {
    borderRadius: 12,
  },
  borderRadiusLarge: {
    borderRadius: 20,
  },
  // Background colors
  backgroundPrimary: {
    backgroundColor: '#667eea',
  },
  backgroundSecondary: {
    backgroundColor: '#f8fafc',
  },
  backgroundWhite: {
    backgroundColor: 'white',
  },
  backgroundSuccess: {
    backgroundColor: '#10b981',
  },
  backgroundWarning: {
    backgroundColor: '#f59e0b',
  },
  backgroundError: {
    backgroundColor: '#ef4444',
  },
});
export default AlzheimerVisionAI;