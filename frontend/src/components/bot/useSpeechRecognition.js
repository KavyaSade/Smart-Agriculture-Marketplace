import { useState, useEffect, useRef } from 'react';

export default function useSpeechRecognition() {
  const [status, setStatus] = useState('Idle'); // 'Idle' | 'Listening' | 'Processing' | 'Transcript Ready' | 'Error'
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Browser does not support SpeechRecognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setStatus('Listening');
      setError(null);
    };

    recognition.onsoundstart = () => {
      setStatus('Processing');
    };

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setStatus('Transcript Ready');
      }
    };

    recognition.onerror = (event) => {
      let message = 'Unable to access your microphone. Please allow microphone permission or type your question.';
      if (event.error === 'no-speech') {
        message = 'No speech was detected. Please try again.';
      } else if (event.error === 'audio-capture') {
        message = 'Microphone unavailable. Please connect a microphone and try again.';
      } else if (event.error === 'not-allowed') {
        message = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      }
      setError(message);
      setStatus('Error');
    };

    recognition.onend = () => {
      setStatus((current) => {
        if (current === 'Listening' || current === 'Processing') {
          return 'Idle';
        }
        return current;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Browser does not support SpeechRecognition. Please type your question.');
      setStatus('Error');
      return;
    }

    if (recognitionRef.current) {
      try {
        setTranscript('');
        setError(null);
        setStatus('Listening');
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition start failed:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Speech recognition stop failed:', err);
      }
    }
  };

  const cancelListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        setStatus('Idle');
        setError(null);
        setTranscript('');
      } catch (err) {
        console.error('Speech recognition cancel failed:', err);
      }
    }
  };

  const resetStatus = () => {
    setStatus('Idle');
    setError(null);
    setTranscript('');
  };

  return {
    status,
    transcript,
    error,
    startListening,
    stopListening,
    cancelListening,
    resetStatus,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}
