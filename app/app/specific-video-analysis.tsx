
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Define prompts for different video analysis types
const analysisPrompts: { [key: string]: string } = {
  ecg: "Analyze this ECG video for any abnormalities in heart rhythm, conduction, or electrical activity. Focus on identifying potential arrhythmias, conduction blocks, or other cardiac abnormalities. Provide detailed findings with confidence levels in user-friendly language.",
  ultrasound: "You are an expert sonographer. Analyze this ultrasound video to identify any anatomical abnormalities, organ irregularities, or pathological findings. Provide a detailed report with measurements if visible and confidence scores in user-friendly language.",
  endoscopy: "You are an expert gastroenterologist. Analyze this endoscopy video to identify any mucosal abnormalities, lesions, polyps, or signs of inflammation. Provide detailed findings with location specificity and confidence levels in user-friendly language.",
  xray_cine: "You are an expert radiologist. Analyze this dynamic X-ray/fluoroscopy video to assess organ movement, contrast flow, or functional abnormalities. Provide detailed temporal analysis with confidence scores in user-friendly language.",
  dermoscopy: "You are an expert dermatologist. Analyze this dermoscopy video of skin lesions to identify potential malignancies, color variations, or structural abnormalities. Provide detailed morphological analysis with confidence levels in user-friendly language.",
  ophthalmology: "You are an expert ophthalmologist. Analyze this eye examination video to identify retinal abnormalities, vascular changes, or signs of eye diseases. Provide detailed findings with anatomical locations and confidence scores in user-friendly language.",
};

const analysisTypes = [
  { key: 'ecg', label: 'ECG Video Analysis', icon: 'pulse-outline', color: '#EF4444' },
  { key: 'ultrasound', label: 'Ultrasound Video', icon: 'radio-outline', color: '#3B82F6' },
  { key: 'endoscopy', label: 'Endoscopy Video', icon: 'eye-outline', color: '#10B981' },
  { key: 'xray_cine', label: 'Dynamic X-Ray', icon: 'film-outline', color: '#F59E0B' },
  { key: 'dermoscopy', label: 'Dermoscopy Video', icon: 'scan-circle-outline', color: '#EC4899' },
  { key: 'ophthalmology', label: 'Eye Examination', icon: 'eye-outline', color: '#8B5CF6' },
];

interface User {
  name?: string;
}

interface MedicalVideoAnalysisProps {
  user?: User;
}

const MedicalVideoAnalysis: React.FC<MedicalVideoAnalysisProps> = ({ user }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('ecg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<any>({});

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

  const handleAnalyze = async (): Promise<void> => {
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
          prompt: analysisPrompts[selectedAnalysis],
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

  const resetAnalysis = (): void => {
    setSelectedVideo(null);
    setAnalysis(null);
    setCloudinaryUrl(null);
    setVideoStatus({});
  };

  const generatePDF = async (): Promise<void> => {
    if (!analysis) {
      Alert.alert('No Data', 'No analysis data available to generate PDF.');
      return;
    }

    try {
      const currentAnalysisType = analysisTypes.find(type => type.key === selectedAnalysis);
      const currentDate = new Date().toLocaleString();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medical Video Analysis Report</title>
          <style>
            body {
              font-family: 'Helvetica', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #333;
            }
            .container {
              background: white;
              border-radius: 15px;
              padding: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid ${currentAnalysisType?.color || '#EF4444'};
              padding-bottom: 20px;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: ${currentAnalysisType?.color || '#EF4444'};
              border-radius: 50%;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            .title {
              color: ${currentAnalysisType?.color || '#EF4444'};
              font-size: 28px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
              margin: 5px 0 0 0;
            }
            .info-section {
              background: #f8fafc;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid ${currentAnalysisType?.color || '#EF4444'};
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .info-label {
              font-weight: bold;
              color: #4a5568;
            }
            .info-value {
              color: #2d3748;
            }
            .analysis-section {
              margin: 30px 0;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: ${currentAnalysisType?.color || '#EF4444'};
              margin-bottom: 15px;
              display: flex;
              align-items: center;
            }
            .section-icon {
              width: 24px;
              height: 24px;
              background: ${currentAnalysisType?.color || '#EF4444'};
              border-radius: 50%;
              margin-right: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            }
            .analysis-content {
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 10px;
              padding: 20px;
              line-height: 1.6;
              white-space: pre-wrap;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
            }
            .video-info {
              background: #f0f4ff;
              border-radius: 10px;
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid ${currentAnalysisType?.color || '#EF4444'};
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              color: #666;
              font-size: 12px;
            }
            .footer-logo {
              width: 30px;
              height: 30px;
              background: ${currentAnalysisType?.color || '#EF4444'};
              border-radius: 50%;
              margin: 0 auto 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .disclaimer {
              background: #fef3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
              color: #856404;
            }
            .watermark {
              position: fixed;
              bottom: 20px;
              right: 20px;
              opacity: 0.1;
              font-size: 48px;
              font-weight: bold;
              color: ${currentAnalysisType?.color || '#EF4444'};
              transform: rotate(-45deg);
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="watermark">CureConnect</div>
          <div class="container">
            <div class="header">
              <div class="logo">🎥</div>
              <h1 class="title">CureConnect Video Analysis</h1>
              <p class="subtitle">${currentAnalysisType?.label || 'Medical Video Analysis'} Report</p>
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Patient Name:</span>
                <span class="info-value">${user?.name || 'Not Available'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Analysis Type:</span>
                <span class="info-value">${currentAnalysisType?.label || 'Medical Video Analysis'}</span>
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
              <h3 style="margin: 0 0 10px 0; color: ${currentAnalysisType?.color || '#EF4444'};">📹 Video Information</h3>
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

      const fileName = `${currentAnalysisType?.label.replace(/\s+/g, '_')}_Video_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
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

  const selectedAnalysisType = analysisTypes.find(type => type.key === selectedAnalysis);

  const renderDropdownItem = ({ item }: { item: typeof analysisTypes[0] }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { borderLeftColor: item.color }]}
      onPress={() => {
        setSelectedAnalysis(item.key);
        setShowDropdown(false);
      }}
    >
      <Ionicons name={item.icon as any} size={24} color={item.color} />
      <Text style={styles.dropdownText}>{item.label}</Text>
      {selectedAnalysis === item.key && (
        <Ionicons name="checkmark-circle" size={20} color={item.color} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Medical Video Analysis</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Medical Video Analysis</Text>
          </View>

          {/* Analysis Type Selector */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Analysis Type</Text>
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: selectedAnalysisType?.color }]}
              onPress={() => setShowDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons 
                  name={selectedAnalysisType?.icon as any} 
                  size={24} 
                  color={selectedAnalysisType?.color} 
                />
                <Text style={styles.dropdownSelectedText}>
                  {selectedAnalysisType?.label}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Video Upload Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upload Video</Text>
              {selectedVideo && (
                <TouchableOpacity onPress={resetAnalysis} style={styles.resetButton}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.uploadArea, selectedVideo && styles.uploadAreaWithVideo]}
              onPress={pickVideo}
            >
              {selectedVideo ? (
                <View style={styles.videoContainer}>
                  <Video
                    ref={videoRef}
                    style={styles.selectedVideo}
                    source={{ uri: selectedVideo }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
                  />
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="videocam-outline" size={48} color="#999" />
                  <Text style={styles.uploadText}>Tap to upload video</Text>
                  <Text style={styles.uploadSubtext}>MP4, MOV, or AVI (max 5 minutes)</Text>
                </View>
              )}
            </TouchableOpacity>

            {selectedVideo && !analysis && (
              <TouchableOpacity
                style={[styles.analyzeButton, { backgroundColor: selectedAnalysisType?.color }]}
                onPress={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="white" />
                    <Text style={styles.analyzeButtonText}>Uploading & Analyzing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonRow}>
                    <Ionicons name="analytics-outline" size={20} color="white" />
                    <Text style={styles.analyzeButtonText}>Analyze Video</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Results Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Analysis Results</Text>
              {analysis && (
                <TouchableOpacity 
                  onPress={generatePDF} 
                  style={[styles.pdfButton, { backgroundColor: selectedAnalysisType?.color }]}
                >
                  <Ionicons name="download-outline" size={16} color="white" />
                  <Text style={styles.pdfButtonText}>PDF</Text>
                </TouchableOpacity>
              )}
            </View>

            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={selectedAnalysisType?.color} />
                <Text style={styles.loadingText}>Analyzing video...</Text>
                <Text style={styles.loadingSubtext}>This may take a few moments</Text>
              </View>
            ) : analysis ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>{analysis}</Text>
              </View>
            ) : (
              <View style={styles.emptyResults}>
                <Ionicons name="videocam-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Upload and analyze a video to see results</Text>
              </View>
            )}
          </View>

          {/* Video Info Section */}
          {selectedVideo && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Video Information</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    Duration: {videoStatus.durationMillis ? 
                      `${Math.round(videoStatus.durationMillis / 1000)}s` : 'Loading...'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="resize-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>Format: Video (MP4/MOV)</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="cloud-upload-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    Status: {cloudinaryUrl ? 'Uploaded' : 'Ready to upload'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Dropdown Modal */}
        <Modal
          visible={showDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownModal}>
              <Text style={styles.dropdownTitle}>Select Video Analysis Type</Text>
              <FlatList
                data={analysisTypes}
                renderItem={renderDropdownItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#f6f8fc',
  },
  gradient: {
    flex: 1,
    minHeight: height,
    paddingTop: 0,
  },
  scrollView: {
    paddingHorizontal: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#22223b',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 22,
    marginVertical: 13,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  dropdown: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 2,
    backgroundColor: '#f9fafb',
    borderColor: '#6366f1',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#22223b',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderLeftWidth: 5,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginBottom: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#22223b',
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: width * 0.82,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 10,
    textAlign: 'center',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginBottom: 8,
    marginTop: 6,
    minHeight: 130,
    borderStyle: 'dashed',
  },
  uploadAreaWithVideo: {
    borderColor: '#6366f1',
    backgroundColor: '#e0e7ef',
    paddingVertical: 10,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  videoContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e0e7ef',
    position: 'relative',
    marginBottom: 0,
  },
  selectedVideo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#e0e7ef',
  },
  videoOverlay: {
    position: 'absolute',
    top: '40%',
    left: '42%',
    zIndex: 2,
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  resetText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 15,
  },
  analyzeButton: {
    marginTop: 15,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    marginLeft: 8,
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#6366f1',
    marginTop: 18,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  resultsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 18,
    marginTop: 10,
  },
  resultsText: {
    fontSize: 16,
    color: '#22223b',
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  infoText: {
    marginLeft: 10,
    color: '#22223b',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default MedicalVideoAnalysis;