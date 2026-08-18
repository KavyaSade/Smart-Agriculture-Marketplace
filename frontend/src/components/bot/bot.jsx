import React, { useState, useEffect, useRef } from 'react';
import './bot.css';

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

  // Generate bot reply based on the user's message
  const getBotResponse = (text) => {
    const query = text.toLowerCase();
    
    if (query.includes('sell') || query.includes('crop') || query.includes('list')) {
      return 'To sell your crops, register as a farmer, go to your dashboard, and click on Add Product. You can list grains, vegetables, and fruits.';
    }
    
    if (query.includes('price') || query.includes('rate') || query.includes('cost') || query.includes('market')) {
      return 'Current market rates are updated daily. Wheat is trading around 2100 per quintal, chili at 7500, and grapes at 4500. Check the market trends on your dashboard.';
    }
    
    if (query.includes('weather') || query.includes('rain') || query.includes('forecast') || query.includes('sky')) {
      return 'Our weather advisory tool shows clear skies for the next three days. Ideal for harvesting grains. You can check detailed forecasts in the dashboard.';
    }
    
    if (query.includes('pay') || query.includes('payment') || query.includes('secure') || query.includes('money')) {
      return 'Payments are processed securely through our verified gateway system. Funds are released to sellers once the buyer confirms delivery.';
    }
    
    // Reply when no matching keyword is found
    return 'Thank you for asking. I am analyzing your query. Please refer to your dashboard user guide or contact support at support@agrimarket.com for detailed assistance.';
  };

  // Send a message
  const handleSendMessage = (textToSend) => {
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

    // Show bot reply after 1 second
    setTimeout(() => {
      const responseText = getBotResponse(textToSend);
      
      // Add bot message to the chat
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
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
            <input 
              type="text" 
              className="bot-input" 
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button type="submit" className="bot-send" title="Send Message">
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