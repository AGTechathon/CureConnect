import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../utils/firebaseConfig';
import { changeLanguage, getStoredLanguage } from '../utils/i18n';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    const lang = await getStoredLanguage();
    setCurrentLang(lang);
  };

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userLoggedIn');
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageSelector}>
        <TouchableOpacity 
          style={[styles.langButton, currentLang === 'en' && styles.activeLang]} 
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={[styles.langText, currentLang === 'en' && styles.activeLangText]}>ENG</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.langButton, currentLang === 'hi' && styles.activeLang]} 
          onPress={() => handleLanguageChange('hi')}
        >
          <Text style={[styles.langText, currentLang === 'hi' && styles.activeLangText]}>हिंदी</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{t('welcome')}</Text>
      <Image 
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>{t('start')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeLang: {
    backgroundColor: '#007AFF',
  },
  langText: {
    fontSize: 14,
    color: '#333',
  },
  activeLangText: {
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
