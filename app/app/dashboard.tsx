import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { changeLanguage } from '../utils/i18n';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');
// const CARD_WIDTH = width - 40; // Defined card width (screen width - 2*padding)

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  
  const carouselItems = [
    {
      id: '1',
      title: t('aiHealthAnalysis'),
      description: t('uploadDescription'),
      image: require('../assets/quick_checkup.jpeg'),
      buttonText: t('analyzeNow'),
      onPress: () => router.push('/models'),
      bgColor: '#D4EDDA',
      textColor: '#333',
      buttonBg: '#212121',
    },
    {
      id: '2',
      title: t('telemedicineServices'),
      description: t('telemedicineDescription'),
      image: require('../assets/drug_info.jpeg'),
      buttonText: t('consultNow'),
      onPress:async () => {
        const url = 'https://video-call-final-git-main-orthodox-64s-projects.vercel.app/?roomID=emergency';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(`Can't open this URL: ${url}`);
        }
      },
      bgColor: '#BBDEFB',
      textColor: '#333',
      buttonBg: '#1976D2',
    },
    {
      id: '3',
      title: t('healthTips'),
      description: t('healthTipsDescription'),
      image: require('../assets/lab_results.jpeg'),
      buttonText: t('viewTips'),
      onPress: () => console.log('Health Tips pressed'),
      bgColor: '#FFECB3',
      textColor: '#333',
      buttonBg: '#FFA000',
    },
  ];

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselItems.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (width - 40),
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    await changeLanguage(lang);
    setCurrentLang(lang);
    setLanguageModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/logo.png')}
            style={styles.headerLogo}
          />
          <Text style={styles.companyName}>CureConnect</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconContainer} onPress={() => console.log('Notification Icon Pressed')}>
            <Ionicons name="notifications-outline" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconContainer} onPress={() => router.push('/emergency')}>
            <Entypo name="location-pin" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconContainer} 
            onPress={() => setLanguageModalVisible(true)}
          >
            <Entypo name="globe" size={24} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language')}</Text>
            <TouchableOpacity 
              style={[styles.languageButton, currentLang === 'en' && styles.activeLanguageButton]} 
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageButtonText, currentLang === 'en' && styles.activeLanguageButtonText]}>
                {t('english')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.languageButton, currentLang === 'hi' && styles.activeLanguageButton]} 
              onPress={() => handleLanguageChange('hi')}
            >
              <Text style={[styles.languageButtonText, currentLang === 'hi' && styles.activeLanguageButtonText]}>
                {t('hindi')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Horizontal Scrollable Cards (Carousel) */}
        <Text style={styles.featuredSectionTitle}>{t('featuredServices')}</Text>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          pagingEnabled 
          snapToInterval={width - 40}
          decelerationRate="fast"
          style={styles.horizontalCardContainer}
        >
          {carouselItems.map((item) => (
            <View 
              key={item.id} 
              style={[styles.carouselCard, { backgroundColor: item.bgColor }]} 
            >
              <View style={styles.carouselCardContent}>
                <View style={styles.carouselCardLeft}>
                  <Image source={item.image} style={styles.carouselCardImage} />
                </View>
                <View style={styles.carouselCardRight}>
                  <Text style={[styles.carouselCardTitle, { color: item.textColor }]}>{item.title}</Text>
                  <Text style={[styles.carouselCardDescription, { color: item.textColor }]}>{item.description}</Text>
                  <TouchableOpacity 
                    style={[styles.carouselButton, { backgroundColor: item.buttonBg }]} 
                    onPress={item.onPress}
                  >
                    <Text style={styles.carouselButtonText}>{item.buttonText}</Text>
                    {item.id === '1' && <MaterialCommunityIcons name="magnify" size={20} color="#fff" style={styles.analyzeNowIcon} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('ourServices')}</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={ async () => {
              const url = 'https://video-call-final-git-main-orthodox-64s-projects.vercel.app/?roomID=emergency';
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                Linking.openURL(url);
              } else {
                Alert.alert(`Can't open this URL: ${url}`);
              }
            }}
          >
            <View style={styles.serviceIconCircle}>
              <Feather name="phone" size={30} color="#555" />
            </View>
            <Text style={styles.serviceCardTitle}>{t('telemedicine')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => router.push('/models')}
          >
            <View style={styles.serviceIconCircle}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={30} color="#555" />
            </View>
            <Text style={styles.serviceCardTitle}>{t('analysis')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => router.push('/healthtips')}
          >
            <View style={styles.serviceIconCircle}>
              <MaterialCommunityIcons name="emoticon-sick-outline" size={30} color="#555" />
            </View>
            <Text style={styles.serviceCardTitle}>{t('healthTipsTitle')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={async () => {
              const url = 'https://tinyurl.com/4jdnrr5b';
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                Linking.openURL(url);
              } else {
                Alert.alert(`Can't open this URL: ${url}`);
              }
            }}
          >
            <View style={styles.serviceIconCircle}>
              <MaterialCommunityIcons name="watch" size={30} color="#555" />
            </View>
            <Text style={styles.serviceCardTitle}>{t('healthMonitoring')}</Text>
          </TouchableOpacity>
        </View>

        {/* Health Overview Section */}
        <Text style={styles.sectionTitle}>{t('healthOverview')}</Text>
        
        {/* Health Metrics */}
        <View style={styles.healthMetricsContainer}>
          <View style={styles.healthMetricCard}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color="#FF6B6B" />
            <Text style={styles.healthMetricValue}>72</Text>
            <Text style={styles.healthMetricLabel}>{t('heartRate')}</Text>
          </View>
          <View style={styles.healthMetricCard}>
            <MaterialCommunityIcons name="shoe-print" size={24} color="#4CAF50" />
            <Text style={styles.healthMetricValue}>8,432</Text>
            <Text style={styles.healthMetricLabel}>{t('steps')}</Text>
          </View>
          <View style={styles.healthMetricCard}>
            <MaterialCommunityIcons name="sleep" size={24} color="#2196F3" />
            <Text style={styles.healthMetricValue}>7.5h</Text>
            <Text style={styles.healthMetricLabel}>{t('sleep')}</Text>
          </View>
        </View>

        {/* Recent Activities */}
        <Text style={styles.subsectionTitle}>{t('recentActivities')}</Text>
        <View style={styles.activitiesContainer}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="pill" size={20} color="#1976D2" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{t('morningMedication')}</Text>
              <Text style={styles.activityTime}>2 {t('hoursAgo')}</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="water" size={20} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{t('waterIntake')}</Text>
              <Text style={styles.activityTime}>4 {t('hoursAgo')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Health Tips */}
        <Text style={styles.subsectionTitle}>{t('healthTipsTitle')}</Text>
        <TouchableOpacity 
          style={styles.tipsContainer}
          onPress={() => router.push('/healthtips')}
        >
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#FFA000" />
            <Text style={styles.tipText}>{t('stayHydrated')}</Text>
          </View>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#FFA000" />
            <Text style={styles.tipText}>{t('screenTime')}</Text>
          </View>
          <View style={styles.viewMoreContainer}>
            <Text style={styles.viewMoreText}>{t('viewMoreHealthTips')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#1E90FF" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 0,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIconContainer: {
    marginLeft: 15,
  },
  featuredSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
    alignSelf: 'flex-start',
    marginLeft: 0, // Remove explicit left margin, padding from scrollContent will handle
  },
  horizontalCardContainer: {
    marginBottom: 20,
    width: width - 40, // Account for parent padding
    height: 190,
    marginHorizontal: 0, // Remove margin as padding from scrollContent will handle
  },
  carouselCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40, // Each card takes full width of its container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    height:250,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 0,
    paddingBottom:100, // No margin between cards when snapping
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  carouselCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselCardLeft: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselCardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  carouselCardRight: {
    width: '60%',
    paddingLeft: 10,
  },
  carouselCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop:25
  },
  carouselCardDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  carouselButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  carouselButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  analyzeNowIcon: {
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 0,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0, // This will be handled by scrollContent padding
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%', // Approx half width for two columns
    aspectRatio: 1, // Make cards square
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  serviceIconCircle: {
    backgroundColor: '#F0F8FF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  healthMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  healthMetricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  healthMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  healthMetricLabel: {
    fontSize: 12,
    color: '#666',
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  activitiesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tipsContainer: {
    gap: 10,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    marginTop: 10,
  },
  viewMoreText: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '60%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  languageButton: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: '#007AFF',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeLanguageButtonText: {
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
}); 