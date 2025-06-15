import { Fontisto } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Models() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <Text style={styles.pageTitle}>AI Models for Health</Text>

      <Text style={styles.sectionHeader}>General Diseases Section</Text>
      <TouchableOpacity 
        style={styles.sectionCard} 
        onPress={() => setModalVisible(true)}
      >
        <Fontisto name="doctor" size={60} color="#1E90FF"  />
        <Text style={styles.sectionCardText}>Analyze common health conditions using our comprehensive models.</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Analysis Type</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.push('/indi_image');
              }}
            >
              <Text style={styles.modalButtonText}>Image Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.push('/indi_video');
              }}
            >
              <Text style={styles.modalButtonText}>Video Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionHeader}>Specific Diseases Section</Text>
      <TouchableOpacity 
        style={styles.sectionCard}
        onPress={() => router.push('/specific-diseases')}
      >
        <FontAwesome6 name="brain" size={60} color="#1E90FF" />
        <Text style={styles.sectionCardText}>Dive deeper into specialized models for specific disease analysis.</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#005662',
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005662',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'left',
    width: '100%',
    paddingLeft: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    maxWidth: 450,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#ADD8E6',
  },
  sectionCardText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005662',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
}); 