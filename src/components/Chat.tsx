import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Check,
  CheckCheck,
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  X,
  ArrowLeft
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: 'counselor' | 'student';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
  typing?: boolean;
}

interface ChatProps {
  userRole?: 'student' | 'counselor';
}

const Chat: React.FC<ChatProps> = ({ userRole = 'student' }) => {
  const studentConversations: Conversation[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'counselor',
      lastMessage: 'I reviewed your essay draft. Let\'s discuss the revisions.',
      lastMessageTime: new Date(Date.now() - 5 * 60000),
      unreadCount: 2,
      online: true,
      typing: false
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'counselor',
      lastMessage: 'Great progress on your Stanford application!',
      lastMessageTime: new Date(Date.now() - 2 * 3600000),
      unreadCount: 0,
      online: false
    },
    {
      id: '3',
      name: 'Emma Williams',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'counselor',
      lastMessage: 'Don\'t forget the scholarship deadline tomorrow',
      lastMessageTime: new Date(Date.now() - 24 * 3600000),
      unreadCount: 1,
      online: true
    }
  ];

  const counselorConversations: Conversation[] = [
    {
      id: 's1',
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'student',
      lastMessage: 'Thank you for the feedback on my essay!',
      lastMessageTime: new Date(Date.now() - 10 * 60000),
      unreadCount: 1,
      online: true,
      typing: false
    },
    {
      id: 's2',
      name: 'Sophie Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'student',
      lastMessage: 'When can we discuss my MIT application?',
      lastMessageTime: new Date(Date.now() - 45 * 60000),
      unreadCount: 2,
      online: true,
      typing: false
    },
    {
      id: 's3',
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'student',
      lastMessage: 'I submitted my Stanford application!',
      lastMessageTime: new Date(Date.now() - 3 * 3600000),
      unreadCount: 0,
      online: false
    },
    {
      id: 's4',
      name: 'Maria Garcia',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'student',
      lastMessage: 'Could you review my personal statement?',
      lastMessageTime: new Date(Date.now() - 5 * 3600000),
      unreadCount: 0,
      online: false
    },
    {
      id: 's5',
      name: 'James Kim',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'student',
      lastMessage: 'Thanks for helping with the scholarship application',
      lastMessageTime: new Date(Date.now() - 24 * 3600000),
      unreadCount: 0,
      online: true
    }
  ];

  const [conversations] = useState<Conversation[]>(
    userRole === 'counselor' ? counselorConversations : studentConversations
  );

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);

  const studentMessages: Message[] = [
    {
      id: '1',
      senderId: '1',
      senderName: 'Dr. Sarah Johnson',
      senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Hi! I hope you\'re doing well. I wanted to touch base about your college essays.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Hi Dr. Johnson! Yes, I\'ve been working on them. I finished my personal statement draft.',
      timestamp: new Date(Date.now() - 3500000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Personal Statement - Draft 1',
      timestamp: new Date(Date.now() - 3400000),
      type: 'document',
      mediaUrl: '#',
      fileName: 'Personal_Statement_Draft1.pdf',
      fileSize: '245 KB',
      status: 'read'
    },
    {
      id: '4',
      senderId: '1',
      senderName: 'Dr. Sarah Johnson',
      senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Excellent! I\'ll review it this evening and provide detailed feedback.',
      timestamp: new Date(Date.now() - 3200000),
      type: 'text',
      status: 'read'
    },
    {
      id: '5',
      senderId: '1',
      senderName: 'Dr. Sarah Johnson',
      senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'I\'ve reviewed your essay. Here are my detailed notes and suggestions.',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      status: 'read'
    },
    {
      id: '6',
      senderId: '1',
      senderName: 'Dr. Sarah Johnson',
      senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Essay Feedback - Detailed Comments',
      timestamp: new Date(Date.now() - 1700000),
      type: 'document',
      mediaUrl: '#',
      fileName: 'Essay_Feedback_Comments.pdf',
      fileSize: '892 KB',
      status: 'read'
    },
    {
      id: '7',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Thank you so much! I really appreciate the detailed feedback. I\'ll work on the revisions this weekend.',
      timestamp: new Date(Date.now() - 300000),
      type: 'text',
      status: 'delivered'
    },
    {
      id: '8',
      senderId: '1',
      senderName: 'Dr. Sarah Johnson',
      senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Perfect! Feel free to reach out if you have any questions while you\'re working on it.',
      timestamp: new Date(Date.now() - 60000),
      type: 'text',
      status: 'read'
    }
  ];

  const counselorMessages: Message[] = [
    {
      id: '1',
      senderId: 's1',
      senderName: 'Emma Wilson',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Hi Dr. Johnson! I just finished my Stanford supplemental essay. Would you mind taking a look?',
      timestamp: new Date(Date.now() - 7200000),
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/3782235/pexels-photo-3782235.jpeg?auto=compress&cs=tinysrgb&w=200',
      content: 'Of course! Please share it with me and I\'ll review it today.',
      timestamp: new Date(Date.now() - 7000000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: 's1',
      senderName: 'Emma Wilson',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Stanford Supplemental Essay - Draft',
      timestamp: new Date(Date.now() - 6800000),
      type: 'document',
      mediaUrl: '#',
      fileName: 'Stanford_Supplemental_Essay.pdf',
      fileSize: '178 KB',
      status: 'read'
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/3782235/pexels-photo-3782235.jpeg?auto=compress&cs=tinysrgb&w=200',
      content: 'I\'ve reviewed your essay! Overall, it\'s a strong piece. I\'ve added some comments for areas that could use more depth.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read'
    },
    {
      id: '5',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/3782235/pexels-photo-3782235.jpeg?auto=compress&cs=tinysrgb&w=200',
      content: 'Stanford Essay - Feedback and Comments',
      timestamp: new Date(Date.now() - 3500000),
      type: 'document',
      mediaUrl: '#',
      fileName: 'Stanford_Essay_Feedback.pdf',
      fileSize: '421 KB',
      status: 'read'
    },
    {
      id: '6',
      senderId: 's1',
      senderName: 'Emma Wilson',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Thank you for the feedback on my essay! This is really helpful. I\'ll work on incorporating your suggestions.',
      timestamp: new Date(Date.now() - 600000),
      type: 'text',
      status: 'delivered'
    }
  ];

  const [messages, setMessages] = useState<Message[]>(
    userRole === 'counselor' ? counselorMessages : studentMessages
  );

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: messageInput,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);
  };

  const handleFileAttach = (type: 'image' | 'document') => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />;
    }
  };

  const renderMessage = (message: Message) => {
    const isMe = message.senderId === 'me';

    return (
      <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%]`}>
          {!isMe && (
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}

          <div>
            {message.type === 'text' && (
              <div
                className={`px-4 py-2 rounded-2xl ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            {message.type === 'document' && (
              <div
                className={`px-4 py-3 rounded-2xl border ${
                  isMe
                    ? 'bg-blue-50 border-blue-200 rounded-br-sm'
                    : 'bg-gray-50 border-gray-200 rounded-bl-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.fileName}
                    </p>
                    <p className="text-xs text-gray-500">{message.fileSize}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {message.type === 'image' && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={message.mediaUrl}
                  alt="Shared image"
                  className="max-w-full h-auto"
                />
              </div>
            )}

            <div className={`flex items-center space-x-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-gray-500">{formatMessageTime(message.timestamp)}</span>
              {isMe && getStatusIcon(message.status)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations List */}
      <div className={`${showMobileConversations ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv);
                setShowMobileConversations(false);
              }}
              className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {conv.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conv.typing ? (
                      <span className="text-blue-600 italic">typing...</span>
                    ) : (
                      conv.lastMessage
                    )}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 capitalize">{conv.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className={`${showMobileConversations ? 'hidden' : 'flex'} lg:flex flex-1 flex-col`}>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMobileConversations(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.online ? (
                    isTyping ? (
                      <span className="text-blue-600">typing...</span>
                    ) : (
                      'Online'
                    )
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(renderMessage)}
            {isTyping && (
              <div className="flex items-end space-x-2">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-end space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48">
                    <button
                      onClick={() => handleFileAttach('image')}
                      className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Upload Image</span>
                    </button>
                    <button
                      onClick={() => handleFileAttach('document')}
                      className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Upload Document</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
