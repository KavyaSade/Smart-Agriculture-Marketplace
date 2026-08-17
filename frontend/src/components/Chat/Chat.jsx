import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

export default function Chat({ currentUser, initialPartner }) {
  // state variables
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);

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
    } finally {
      setConversationsLoading(false);
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
      if (initialPartner._id || initialPartner.id) {
        setActivePartner(initialPartner);
      } else if (initialPartner.email && contacts.length > 0) {
        const match = contacts.find(c => c.email === initialPartner.email);
        if (match) {
          setActivePartner(match);
        }
      }
    }
  }, [initialPartner, contacts]);

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

  // convert file to base64 string
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isImage = file.type ? file.type.startsWith('image/') : false;
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setSelectedFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          data: reader.result,
          name: file.name,
          type: file.type || 'application/octet-stream'
        });
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // remove file attachment
  const handleClearFile = () => {
    setSelectedFile(null);
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
    if (!inputText.trim() && !selectedImage && !selectedFile) return;
    if (!activePartner) return;

    const senderId = currentUser._id || currentUser.id;
    const receiverId = activePartner._id || activePartner.id;

    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        senderId,
        receiverId,
        text: inputText,
        image: selectedImage,
        file: selectedFile ? selectedFile.data : null,
        fileName: selectedFile ? selectedFile.name : null,
        fileType: selectedFile ? selectedFile.type : null
      });
    }

    setInputText('');
    setSelectedImage(null);
    setSelectedFile(null);
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
          {conversationsLoading ? (
            <p className="no-chats">loading chats...</p>
          ) : displayConversations.length === 0 ? (
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
                            {msg.file && (
                              <div className="message-file-card" style={{ marginBottom: '0.5rem' }}>
                                <a 
                                  href={msg.file} 
                                  download={msg.fileName} 
                                  className="file-download-link"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.15)' : '#f1f5f9', borderRadius: '8px', textDecoration: 'none', border: isOutgoing ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #cbd5e1', color: isOutgoing ? '#ffffff' : '#1e293b' }}
                                >
                                  <img src="/src/assets/icons/pin.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', filter: isOutgoing ? 'invert(1)' : 'none' }} />
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                      {msg.fileName}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                      {msg.fileType ? msg.fileType.split('/')[1]?.toUpperCase() : 'FILE'}
                                    </span>
                                  </div>
                                </a>
                              </div>
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

            {/* selected file preview */}
            {selectedFile && (
              <div className="image-preview-container" style={{ padding: '0.5rem 1.5rem', backgroundColor: '#ffffff', borderTop: '1px solid rgba(82, 183, 136, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <img src="/src/assets/icons/pin.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                </div>
                <button type="button" onClick={handleClearFile} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', textTransform: 'lowercase' }}>
                  remove
                </button>
              </div>
            )}
            {/* chat input form */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <label 
                htmlFor="file-upload" 
                style={{ cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(82, 183, 136, 0.1)', borderRadius: '50%', width: '36px', height: '36px' }}
                title="attach image or document"
              >
                <img src="/src/assets/icons/pin.png" alt="attach file" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </label>
              <input 
                id="file-upload"
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={handleFileChange}
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
            <h4>your messages</h4>
            <p>select a contact from the sidebar to start chatting about crop listings, negotiations, or delivery details securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
