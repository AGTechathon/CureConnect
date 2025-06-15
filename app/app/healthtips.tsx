import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HealthTips() {
  const healthTips = [
    {
      category: 'Oxygen Importance',
      icon: 'air-filter',
      tips: [
        'Oxygen is essential for cellular respiration and energy production',
        'Proper oxygen levels help maintain brain function and mental clarity',
        'Deep breathing exercises can improve oxygen intake and reduce stress',
        'Regular exercise increases oxygen efficiency in the body',
        'Fresh air and proper ventilation are crucial for good health'
      ]
    },
    {
      category: 'Blood Health',
      icon: 'blood-bag',
      tips: [
        'Regular blood donation can help maintain healthy iron levels',
        'Stay hydrated to maintain proper blood volume and circulation',
        'Iron-rich foods help prevent anemia and maintain blood health',
        'Regular exercise improves blood circulation and heart health',
        'Monitor blood pressure regularly for early detection of issues'
      ]
    },
    {
      category: 'Daily Health Tips',
      icon: 'heart-pulse',
      tips: [
        'Drink 8 glasses of water daily for optimal hydration',
        'Get 7-8 hours of quality sleep each night',
        'Take regular breaks from screen time to reduce eye strain',
        'Practice stress management techniques daily',
        'Maintain a balanced diet with plenty of fruits and vegetables'
      ]
    },
    {
      category: 'Exercise & Fitness',
      icon: 'run',
      tips: [
        'Aim for 30 minutes of moderate exercise daily',
        'Include both cardio and strength training in your routine',
        'Stretch before and after exercise to prevent injuries',
        'Stay active throughout the day, not just during workouts',
        'Listen to your body and rest when needed'
      ]
    },
    {
      category: 'Mental Health',
      icon: 'brain',
      tips: [
        'Practice mindfulness and meditation regularly',
        'Maintain social connections for emotional well-being',
        'Take time for hobbies and activities you enjoy',
        'Get adequate sleep for mental clarity and mood regulation',
        'Seek professional help if experiencing persistent stress or anxiety'
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Tips</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../assets/quick_checkup.jpeg')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Text style={styles.heroTitle}>Your Daily Health Guide</Text>
          <Text style={styles.heroSubtitle}>Essential tips for a healthier lifestyle</Text>
        </View>

        {/* Health Tips Categories */}
        {healthTips.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <MaterialCommunityIcons name={category.icon} size={24} color="#1E90FF" />
              <Text style={styles.categoryTitle}>{category.category}</Text>
            </View>
            <View style={styles.tipsList}>
              {category.tips.map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.tipItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          <View style={styles.resourceCards}>
            <TouchableOpacity style={styles.resourceCard}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#1E90FF" />
              <Text style={styles.resourceText}>Health Articles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceCard}>
              <MaterialCommunityIcons name="video" size={24} color="#1E90FF" />
              <Text style={styles.resourceText}>Video Guides</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceCard}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#1E90FF" />
              <Text style={styles.resourceText}>Health Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  resourcesSection: {
    padding: 20,
  },
  resourcesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resourceCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  resourceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resourceText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
}); 