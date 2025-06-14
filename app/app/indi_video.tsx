import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface User {
  name?: string;
}

interface MedicalVideoAnalysisProps {
  user?: User;
}

const MedicalVideoAnalysis: React.FC<MedicalVideoAnalysisProps> = ({ user }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<any>({});
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const videoRef = useRef<Video>(null);

  const pickVideo = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      videoMaxDuration: 300, // 5 minutes max
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0].uri);
      setAnalysis(null);
      setCloudinaryUrl(null);
    }
  };

  const uploadToCloudinary = async (videoUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'medical_video.mp4',
    } as any);
    formData.append('upload_preset', 'teleconnect');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dfwzeazkg/video/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Updated: Accepts prompt as argument
  const handleAnalyze = async (prompt: string): Promise<void> => {
    if (!selectedVideo) return;
    setIsAnalyzing(true);
    try {
      const videoUrl = await uploadToCloudinary(selectedVideo);
      setCloudinaryUrl(videoUrl);

      const response = await fetch('http://192.168.213.167:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          prompt,
        }),
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysis('Error during analysis. Please try again.');
      Alert.alert('Error', 'Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handles upload and analysis, validates customPrompt
  const handleUploadAndAnalyze = async () => {
    if (!customPrompt.trim()) {
      Alert.alert('Prompt required', 'Please enter a prompt for analysis.');
      return;
    }
    await handleAnalyze(customPrompt.trim());
  };

  const resetAnalysis = (): void => {
    setSelectedVideo(null);
    setAnalysis(null);
    setCloudinaryUrl(null);
    setVideoStatus({});
    setCustomPrompt('');
  };

  const generatePDF = async (): Promise<void> => {
    if (!analysis) {
      Alert.alert('No Data', 'No analysis data available to generate PDF.');
      return;
    }
    try {
      const currentDate = new Date().toLocaleString();
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medical Video Analysis Report</title>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; }
            .container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #EF4444; padding-bottom: 20px; }
            .logo { width: 60px; height: 60px; background: #EF4444; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
            .title { color: #EF4444; font-size: 28px; font-weight: bold; margin: 0; }
            .subtitle { color: #666; font-size: 16px; margin: 5px 0 0 0; }
            .info-section { background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #EF4444; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .info-row:last-child { border-bottom: none; margin-bottom: 0; }
            .info-label { font-weight: bold; color: #4a5568; }
            .info-value { color: #2d3748; }
            .analysis-section { margin: 30px 0; }
            .section-title { font-size: 20px; font-weight: bold; color: #EF4444; margin-bottom: 15px; display: flex; align-items: center; }
            .section-icon { width: 24px; height: 24px; background: #EF4444; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
            .analysis-content { background: white; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; line-height: 1.6; white-space: pre-wrap; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
            .video-info { background: #f0f4ff; border-radius: 10px; padding: 15px; margin: 15px 0; border-left: 4px solid #EF4444; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #666; font-size: 12px; }
            .footer-logo { width: 30px; height: 30px; background: #EF4444; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
            .disclaimer { background: #fef3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; color: #856404; }
            .watermark { position: fixed; bottom: 20px; right: 20px; opacity: 0.1; font-size: 48px; font-weight: bold; color: #EF4444; transform: rotate(-45deg); pointer-events: none; }
          </style>
        </head>
        <body>
          <div class="watermark">CureConnect</div>
          <div class="container">
            <div class="header">
              <div class="logo">🎥</div>
              <h1 class="title">CureConnect Video Analysis</h1>
              <p class="subtitle">Medical Video Analysis Report</p>
            </div>
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Patient Name:</span>
                <span class="info-value">${user?.name || 'Not Available'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Report Date:</span>
                <span class="info-value">${currentDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Report ID:</span>
                <span class="info-value">#${Math.random().toString(36).substring(2, 15).toUpperCase()}</span>
              </div>
            </div>
            <div class="video-info">
              <h3 style="margin: 0 0 10px 0; color: #EF4444;">📹 Video Information</h3>
              <p style="margin: 5px 0;"><strong>Video URL:</strong> ${cloudinaryUrl || 'Processing...'}</p>
              <p style="margin: 5px 0;"><strong>Analysis Timestamp:</strong> ${currentDate}</p>
            </div>
            <div class="analysis-section">
              <h2 class="section-title">
                <div class="section-icon">📋</div>
                Video Analysis Results
              </h2>
              <div class="analysis-content">${analysis}</div>
            </div>
            <div class="disclaimer">
              <strong>⚠️ Medical Disclaimer:</strong> This video analysis is generated by AI and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions. Video quality and lighting conditions may affect analysis accuracy.
            </div>
            <div class="footer">
              <div class="footer-logo">🎥</div>
              <p><strong>Generated by CureConnect</strong></p>
              <p>Advanced AI-Powered Medical Video Analysis Platform</p>
              <p>Report generated on ${currentDate}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const fileName = `Medical_Video_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  // Simple bold/italic parser for demonstration
  const renderBoldText = (text: string) => {
    // Replace **bold** and *italic* with respective styles
    // For production, use a markdown parser
    const boldPattern = /\*\*(.*?)\*\*/g;
    const italicPattern = /\*(.*?)\*/g;

    let elements: any[] = [];
    let lastIndex = 0;
    let match;

    // Handle bold
    while ((match = boldPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(<Text key={lastIndex}>{text.substring(lastIndex, match.index)}</Text>);
      }
      elements.push(<Text key={match.index} style={{ fontWeight: 'bold' }}>{match[1]}</Text>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      elements.push(<Text key={lastIndex}>{text.substring(lastIndex)}</Text>);
    }
    // Now handle italic inside each element
    elements = elements.map((el, idx) => {
      if (typeof el === 'string' || el.props?.children) {
        const str = typeof el === 'string' ? el : el.props.children;
        if (typeof str === 'string' && italicPattern.test(str)) {
          const parts = str.split(italicPattern);
          return parts.map((part, i) =>
            i % 2 === 1
              ? <Text key={i} style={{ fontStyle: 'italic' }}>{part}</Text>
              : <Text key={i}>{part}</Text>
          );
        }
        return el;
      }
      return el;
    });
    return elements;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#e0e7ff', '#f3e8ff']} style={styles.gradient}>
          <View style={styles.mainBox}>
            <Text style={styles.title}>Medical Video Analysis</Text>
            
            <View style={styles.uploadBox}>
              <TouchableOpacity style={styles.pickButton} onPress={pickVideo}>
                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.pickButtonText}>Pick a Video</Text>
              </TouchableOpacity>
            </View>

            {selectedVideo && (
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  source={{ uri: selectedVideo }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  onPlaybackStatusUpdate={setVideoStatus}
                />
              </View>
            )}

            <View style={styles.inputBox}>
              <TextInput
                style={styles.promptInput}
                placeholder="Enter your analysis prompt here"
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleUploadAndAnalyze}
              disabled={isAnalyzing || !selectedVideo}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze Video</Text>
              )}
            </TouchableOpacity>

            {analysis && (
              <View style={styles.analysisContainer}>
                <Text style={styles.analysisTitle}>Analysis Result:</Text>
                <Text style={styles.analysisText}>{renderBoldText(analysis)}</Text>
                <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
                  <Ionicons name="document-outline" size={20} color="#fff" />
                  <Text style={styles.pdfButtonText}>Export as PDF</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedVideo && (
              <TouchableOpacity style={styles.resetButton} onPress={resetAnalysis}>
                <Ionicons name="refresh-outline" size={20} color="#fff" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  gradient: { 
    flex: 1, 
    width: '100%', 
    alignItems: 'center', 
    paddingVertical: 20 
  },
  mainBox: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1E90FF', 
    marginVertical: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  uploadBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#1E90FF',
    borderStyle: 'dashed',
  },
  pickButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#1E90FF', 
    padding: 10, 
    borderRadius: 8, 
    marginVertical: 5,
    width: '60%',
    alignSelf: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pickButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    marginLeft: 8,
    fontWeight: '600',
  },
  videoContainer: { 
    width: '100%', 
    height: 220, 
    marginVertical: 12, 
    borderRadius: 15, 
    overflow: 'hidden', 
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#1E90FF',
  },
  video: { 
    width: '100%', 
    height: '100%' 
  },
  inputBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    padding: 5,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E90FF',
  },
  promptInput: { 
    width: '100%', 
    minHeight: 60, 
    borderColor: '#1E90FF', 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 12, 
    backgroundColor: '#fff', 
    fontSize: 16,
    color: '#333',
  },
  analyzeButton: { 
    backgroundColor: '#1E90FF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginVertical: 15,
    shadowColor: '#1E90FF',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  analyzeButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  analysisContainer: { 
    backgroundColor: '#F0F8FF', 
    borderRadius: 15, 
    padding: 20, 
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#1E90FF',
  },
  analysisTitle: { 
    fontWeight: 'bold', 
    fontSize: 20, 
    color: '#1E90FF', 
    marginBottom: 12 
  },
  analysisText: { 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 16,
    lineHeight: 24,
  },
  pdfButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E90FF', 
    padding: 12, 
    borderRadius: 10, 
    alignSelf: 'flex-start',
    shadowColor: '#1E90FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pdfButtonText: { 
    color: '#fff', 
    marginLeft: 8, 
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FF6B6B', 
    padding: 12, 
    borderRadius: 10, 
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonText: { 
    color: '#fff', 
    marginLeft: 8, 
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MedicalVideoAnalysis;
