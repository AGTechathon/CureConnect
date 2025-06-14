import * as SpeechRecognition from 'expo-speech-recognition';
import { useCallback, useEffect, useState } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await SpeechRecognition.getPermissionsAsync();
        if (!granted) {
          const { granted: newGranted } = await SpeechRecognition.requestPermissionsAsync();
          setHasPermission(newGranted);
        } else {
          setHasPermission(true);
        }
      } catch (err) {
        setError('Failed to get microphone permission');
        setHasPermission(false);
      }
    })();
  }, []);

  const toggleListening = useCallback(async () => {
    try {
      if (!hasPermission) {
        setError('Microphone permission not granted');
        return;
      }

      if (isListening) {
        await SpeechRecognition.stopListeningAsync();
        setIsListening(false);
      } else {
        setIsListening(true);
        await SpeechRecognition.startListeningAsync({
          onResult: (result) => {
            if (result && result.value) {
              setTranscript(result.value);
            }
          },
          onError: (error) => {
            setError(error.message || 'Failed to recognize speech');
            setIsListening(false);
          },
          onEnd: () => {
            setIsListening(false);
          }
        });
      }
    } catch (error) {
      setError('Failed to toggle speech recognition');
      setIsListening(false);
    }
  }, [isListening, hasPermission]);

  const stopListening = useCallback(async () => {
    try {
      if (isListening) {
        await SpeechRecognition.stopListeningAsync();
        setIsListening(false);
      }
    } catch (error) {
      setError('Failed to stop speech recognition');
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    toggleListening,
    stopListening,
  };
}; 