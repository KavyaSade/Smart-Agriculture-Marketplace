import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const QUICK_EMOJIS = ['😊', '😂', '👍', '❤️', '🌱', '🌾', '🤝', '😮'];

export default function Chat({ currentUser, initialPartner }) {
  // state variables
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // effect to scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // fetch conversations list
  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('error fetching conversations:', err);
    }
  };

  // fetch contacts list
  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/chat/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('error fetching contacts:', err);
    }
  };

  // fetch messages list
  const fetchMessages = async (isSilent = false) => {
    if (!activePartner) return;
    if (!isSilent && messages.length === 0) setLoading(true);
    const token = localStorage.getItem('token');
    const partnerId = activePartner._id || activePartner.id;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // load initial partner
  useEffect(() => {
    if (initialPartner) {
      setActivePartner(initialPartner);
    }
  }, [initialPartner]);

  // fetch history on partner change
  useEffect(() => {
    fetchMessages();
    fetchConversations();
  }, [activePartner]);

  // initialize socket client and events
  useEffect(() => {
    if (!currentUser) return;
    fetchConversations();
    fetchContacts();

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join', currentUser._id || currentUser.id);

    // socket listeners to trigger data refetch
    socketRef.current.on('newMessage', () => {
      fetchConversations();
      fetchMessages(true);
    });

    socketRef.current.on('messageDeleted', () => {
      fetchConversations();
      fetchMessages(true);
    });

    socketRef.current.on('conversationDeleted', ({ partnerId }) => {
      fetchConversations();
      const currentActiveId = activePartner ? (activePartner._id || activePartner.id) : null;
      if (currentActiveId && currentActiveId.toString() === partnerId.toString()) {
        setMessages([]);
        setActivePartner(null);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, activePartner]);

  // select contact handler
  const handleSelectContact = (contact) => {
    setActivePartner(contact);
  };

  // convert photo to base64 string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // remove photo attachment
  const handleClearImage = () => {
    setSelectedImage(null);
  };

  // append emoji to text input
  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  // delete single message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('are you sure you want to delete this message?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (socketRef.current && activePartner) {
          const senderId = currentUser._id || currentUser.id;
          const receiverId = activePartner._id || activePartner.id;
          socketRef.current.emit('deleteMessage', { messageId, senderId, receiverId });
        }
      }
    } catch (err) {
      console.error('error deleting message:', err);
    }
  };

  // delete conversation
  const handleDeleteConversation = async () => {
    if (!activePartner) return;
    if (!window.confirm('are you sure you want to delete this conversation?')) return;
    const token = localStorage.getItem('token');
    const partnerId = activePartner._id || activePartner.id;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${partnerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (socketRef.current) {
          const senderId = currentUser._id || currentUser.id;
          socketRef.current.emit('deleteConversation', { senderId, receiverId: partnerId });
        }
      }
    } catch (err) {
      console.error('error deleting conversation:', err);
    }
  };

  // send chat message
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;
    if (!activePartner) return;

    const senderId = currentUser._id || currentUser.id;
    const receiverId = activePartner._id || activePartner.id;

    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        senderId,
        receiverId,
        text: inputText,
        image: selectedImage
      });
    }

    setInputText('');
    setSelectedImage(null);
  };

  const displayConversations = [...conversations];
  if (activePartner) {
    const activePartnerId = (activePartner._id || activePartner.id).toString();
    const hasConversation = conversations.some(
      (c) => c.partner && (c.partner._id || c.partner.id).toString() === activePartnerId
    );
    if (!hasConversation) {
      displayConversations.unshift({
        partner: activePartner,
        lastMessage: ''
      });
    }
  }

  return (
    <div className="chat-container">
      {/* conversations sidebar list */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>recent chats</h3>
        </div>
        <div className="conversations-list">
          {displayConversations.length === 0 ? (
            <p className="no-chats">no active chats found</p>
          ) : (
            displayConversations.map((conv, idx) => {
              const partner = conv.partner;
              const isActive = activePartner && (activePartner._id === partner._id || activePartner.id === partner.id);
              return (
                <div 
                  key={partner._id || partner.id || idx}
                  className={`conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectContact(partner)}
                >
                  <div className="avatar">
                    {partner.profilePhoto ? (
                      <img src={partner.profilePhoto} alt="" />
                    ) : (
                      <span>{partner.fullName ? partner.fullName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="info">
                    <span className="name" style={{ fontWeight: conv.unreadCount > 0 ? '700' : '600' }}>
                      {partner.fullName}
                    </span>
                    <span className="role-tag">{partner.role}</span>
                    <p className="last-msg">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="chat-unread-badge" style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '50%', marginLeft: 'auto' }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* available contacts sidebar list */}
        <div className="sidebar-header" style={{ borderTop: '1px solid rgba(82, 183, 136, 0.15)' }}>
          <h3>available contacts</h3>
        </div>
        <div className="contacts-list" style={{ flexGrow: 0, maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
          {contacts.length === 0 ? (
            <p className="no-chats">no contacts found</p>
          ) : (
            contacts.map((contact, idx) => {
              const isActive = activePartner && (activePartner._id === contact._id || activePartner.id === contact.id);
              return (
                <div 
                  key={contact._id || contact.id || idx}
                  className={`conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="avatar">
                    {contact.profilePhoto ? (
                      <img src={contact.profilePhoto} alt="" />
                    ) : (
                      <span>{contact.fullName ? contact.fullName.charAt(0).toUpperCase() : 'C'}</span>
                    )}
                  </div>
                  <div className="info">
                    <span className="name">{contact.fullName}</span>
                    <span className="role-tag">{contact.role}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* chat window */}
      <div className="chat-window">
        {activePartner ? (
          <>
            {/* chat conversation header */}
            <div className="chat-header">
              <div className="avatar">
                {activePartner.profilePhoto ? (
                  <img src={activePartner.profilePhoto} alt="" />
                ) : (
                  <span>{activePartner.fullName ? activePartner.fullName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div className="info">
                <h4>{activePartner.fullName}</h4>
                <p>{activePartner.role} - {activePartner.email}</p>
              </div>
              <button 
                type="button" 
                className="delete-conversation-btn"
                onClick={handleDeleteConversation}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'lowercase' }}
              >
                <img src="/src/assets/icons/trash.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>delete chat</span>
              </button>
            </div>

            {/* chat messages history thread */}
            <div className="messages-panel">
              {loading && messages.length === 0 ? (
                <div className="chat-loading">loading history...</div>
              ) : (
                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="empty-chat">send a message to start conversation</div>
                  ) : (
                    messages.map((msg, index) => {
                      const currentUserId = (currentUser._id || currentUser.id).toString();
                      const isOutgoing = msg.sender.toString() === currentUserId;
                      return (
                        <div 
                          key={msg._id || index}
                          className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
                        >
                          <div className="message-bubble">
                            {msg.image && (
                              <img src={msg.image} className="message-image" alt="sent attachment" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '0.5rem', display: 'block' }} />
                            )}
                            {msg.text && <p className="text">{msg.text}</p>}
                            <div className="message-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                              {isOutgoing && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#e57373', fontSize: '0.7rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textTransform: 'lowercase' }}
                                >
                                  <img src="/src/assets/icons/trash.png" alt="" style={{ width: '12px', height: '12px', objectFit: 'contain', filter: 'opacity(0.8)' }} />
                                  <span>delete</span>
                                </button>
                              )}
                              <span className="time">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* selected photo preview */}
            {selectedImage && (
              <div className="image-preview-container" style={{ padding: '0.5rem 1.5rem', backgroundColor: '#ffffff', borderTop: '1px solid rgba(82, 183, 136, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={selectedImage} alt="preview" style={{ height: '50px', borderRadius: '6px' }} />
                <button type="button" onClick={handleClearImage} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', textTransform: 'lowercase' }}>
                  remove
                </button>
              </div>
            )}

            {/* quick emojis selector */}
            <div className="emojis-bar" style={{ padding: '0.35rem 1.5rem', backgroundColor: '#fcfdfe', borderTop: '1px solid rgba(82, 183, 136, 0.1)', display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '2px 6px' }}
                  className="emoji-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* chat input form */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <label 
                htmlFor="photo-upload" 
                style={{ cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(82, 183, 136, 0.1)', borderRadius: '50%', width: '36px', height: '36px' }}
                title="attach photo"
              >
                <img src="/src/assets/icons/pin.png" alt="attach photo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </label>
              <input 
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <input 
                type="text"
                placeholder="type your message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="send-btn">
                send
              </button>
            </form>
          </>
        ) : (
          <div className="no-active-chat">
            <p>select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
