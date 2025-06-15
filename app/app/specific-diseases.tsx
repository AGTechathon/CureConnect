import { Entypo, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SpecificDiseases() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState('');

  const handleBoxPress = (diseaseName: string) => {
    setSelectedDisease(diseaseName);
    setModalVisible(true);
  };

  const handleImagePress = () => {
    setModalVisible(false);
    router.push('/specific-image-analysis');
  };

  const handleVideoPress = () => {
    setModalVisible(false);
    router.push('/specific-video-analysis');
  };

  const analysisOptions = [
    { name: 'X-ray Analysis', icon: 'radiology-box' }, // MaterialCommunityIcons
    { name: 'ECG Analysis', icon: 'heart-pulse' }, // FontAwesome5
    { name: 'PET Analysis', icon: 'brain' }, // FontAwesome5
    { name: 'Alzheimer Analysis', icon: 'brain' }, // FontAwesome5
    { name: 'Skin Diseases', icon: 'medical-bag' }, // MaterialCommunityIcons
    { name: 'Retinopathy Detection', icon: 'eye' }, // Entypo
  ];

  const renderItem = ({ item }: { item: typeof analysisOptions[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleBoxPress(item.name)}
    >
      {item.name === 'X-ray Analysis' && <MaterialCommunityIcons name="radiology-box" size={50} color="#1E90FF" />}
      {item.name === 'ECG Analysis' && <FontAwesome5 name="heartbeat" size={50} color="#1E90FF" />}
      {item.name === 'PET Analysis' && <FontAwesome5 name="brain" size={50} color="#1E90FF" />}
      {item.name === 'Alzheimer Analysis' && <FontAwesome5 name="brain" size={50} color="#1E90FF" />}
      {item.name === 'Skin Diseases' && <MaterialCommunityIcons name="medical-bag" size={50} color="#1E90FF" />}
      {item.name === 'Retinopathy Detection' && <Entypo name="eye" size={50} color="#1E90FF" />}
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Specific Diseases Analysis</Text>
      <FlatList
        data={analysisOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choose analysis type for {selectedDisease}</Text>
            <View style={styles.modalButtonsContainer}>
              <Pressable
                style={[styles.button, styles.buttonImage]}
                onPress={handleImagePress}
              >
                <Text style={styles.textStyle}>Image Analysis</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonVideo]}
                onPress={handleVideoPress}
              >
                <Text style={styles.textStyle}>Video Analysis</Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 30,
    textAlign: 'center',
  },
  gridContainer: {
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%', // Two cards per row
    aspectRatio: 1, 
    margin: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0F8FF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4682B4',
    marginTop: 10,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonImage: {
    backgroundColor: '#1E90FF',
  },
  buttonVideo: {
    backgroundColor: '#32CD32', // Green for video
  },
  buttonClose: {
    backgroundColor: '#FF6347', // Red for close
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 