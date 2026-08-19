import React, { useState, useEffect, useRef } from 'react';
import './bot.css';
import useSpeechRecognition from './useSpeechRecognition';

export default function Bot() {
  // Chat open/close and input states
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Store chat messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello, I am AgriBot, your smart agricultural assistant. How can I help you today?'
    }
  ]);

  const {
    status,
    transcript,
    error,
    startListening,
    stopListening,
    cancelListening,
    resetStatus,
    isSupported
  } = useSpeechRecognition();

  // Handle transcript population when ready
  useEffect(() => {
    if (status === 'Transcript Ready' && transcript) {
      setInputText(transcript);
      resetStatus();
    }
  }, [status, transcript, resetStatus]);

  // Handle SpeechRecognition error
  useEffect(() => {
    if (status === 'Error' && error) {
      const errorMsg = {
        id: Date.now() + 2,
        sender: 'bot',
        text: error
      };
      setMessages(prev => [...prev, errorMsg]);
      resetStatus();
    }
  }, [status, error, resetStatus]);

  const handleMicClick = () => {
    if (status === 'Listening' || status === 'Processing') {
      cancelListening();
    } else {
      startListening();
    }
  };

  // Used to scroll to the latest message
  const messagesEndRef = useRef(null);

  // Scroll down when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Quick suggestion buttons
  const chips = [
    'How to sell crops?',
    'Current market rates',
    'Weather advisory',
    'Secure payments'
  ];

  // Send a message to the backend bot
  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user's message to the chat
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/bot', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      
      // Add bot message to the chat
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error fetching bot reply:', error);
      
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to my backend right now. Please try again later.'
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle message form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <>
      {/* Button to open/close the chatbot */}
      <button 
        className="bot-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="Open AgriBot Help Chat"
      >
        <img 
          src="/src/assets/icons/chat.png" 
          alt="Chat Bot Icon" 
          className="bot-toggle-icon" 
        />
      </button>

      {/* Show chat window when opened */}
      {isOpen && (
        <div className="bot-window">
          
          {/* Chat header */}
          <div className="bot-header">
            <div className="bot-profile">
              <img 
                src="/src/assets/icons/sprout.png" 
                alt="AgriBot" 
                className="bot-avatar" 
              />
              <div className="bot-info">
                <span className="bot-name">AgriBot Assistant</span>
                <span className="bot-status">Online</span>
              </div>
            </div>

            {/* Close chat button */}
            <button 
              className="bot-close" 
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <img 
                src="/src/assets/icons/multiply.png" 
                alt="Close icon" 
                className="bot-close-icon" 
              />
            </button>
          </div>

          {/* Display chat messages */}
          <div className="bot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`bot-msg-row ${msg.sender}`}>
                <img 
                  src={msg.sender === 'bot' 
                    ? '/src/assets/icons/sprout.png' 
                    : '/src/assets/icons/add-user.png'} 
                  alt={msg.sender} 
                  className="bot-msg-avatar" 
                />

                <div className="bot-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Show typing message */}
            {isTyping && (
              <div className="bot-typing">
                AgriBot is typing...
              </div>
            )}
            
            {/* Reference for auto scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestion buttons */}
          <div className="bot-chips">
            {chips.map((chip, index) => (
              <button 
                key={index} 
                className="bot-chip"
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message input and send button */}
          <form className="bot-input-form" onSubmit={handleSubmit}>
            {isSupported && (
              <button 
                type="button" 
                className={`bot-mic-btn ${status === 'Listening' ? 'listening' : ''} ${status === 'Processing' ? 'processing' : ''}`}
                onClick={handleMicClick}
                title={status === 'Listening' || status === 'Processing' ? 'Cancel recording' : 'Speak your question'}
              >
                <img 
                  src={status === 'Listening' || status === 'Processing' ? '/src/assets/icons/multiply.png' : '/src/assets/icons/microphone.png'} 
                  alt={status === 'Listening' || status === 'Processing' ? 'Cancel' : 'Speak'} 
                  className="bot-mic-icon" 
                />
              </button>
            )}

            <input 
              type="text" 
              className={`bot-input ${status === 'Listening' ? 'listening' : ''}`} 
              placeholder={status === 'Listening' ? 'Listening...' : status === 'Processing' ? 'Processing...' : 'Type your message here...'}
              value={status === 'Listening' ? '' : status === 'Processing' ? '' : inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={status === 'Listening' || status === 'Processing'}
            />

            <button 
              type="submit" 
              className="bot-send" 
              title="Send Message"
              disabled={status === 'Listening' || status === 'Processing'}
            >
              <img 
                src="/src/assets/icons/paper-plane.png" 
                alt="Send" 
                className="bot-send-icon" 
              />
            </button>
          </form>

        </div>
      )}
    </>
  );
}