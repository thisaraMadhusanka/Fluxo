import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { Smile, Paperclip, Trash2 } from 'lucide-react';
import socketService from '@/services/socket';
import api from '@/services/api';
import ConfirmationModal from '@/components/ConfirmationModal';

const MessageList = ({ messages, conversationId }) => {
    const messagesEndRef = useRef(null);
    const { user } = useSelector((state) => state.auth);
    const { typingUsers } = useSelector((state) => state.messages);
    const [showEmojiPicker, setShowEmojiPicker] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Helper: Check if date separator is needed
    const needsDateSeparator = (current, previous) => {
        if (!previous) return true;
        const currentDate = new Date(current.createdAt);
        const previousDate = new Date(previous.createdAt);
        return !isSameDay(currentDate, previousDate);
    };

    // Format date for separator
    const formatDateSeparator = (dateString) => {
        const date = new Date(dateString);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    // Check if message is consecutive from same user (for grouping)
    const isConsecutive = (current, previous) => {
        if (!previous) return false;
        const sameSender = (current.sender?._id || current.sender) === (previous.sender?._id || previous.sender);

        // Also check time difference (e.g., within 5 mins)
        const timeDiff = new Date(current.createdAt) - new Date(previous.createdAt);
        const withinTime = timeDiff < 5 * 60 * 1000;

        return sameSender && withinTime;
    };

    const handleReaction = (messageId, emoji) => {
        const currentUserId = user._id || user.id;
        const message = messages.find(m => m._id === messageId);
        if (!message) return;

        const userReacted = message.reactions?.some(r =>
            r.emoji === emoji && r.users.some(u => (u._id || u) === currentUserId)
        );

        socketService.reactToMessage(messageId, emoji, userReacted ? 'remove' : 'add');
    };

    // Handle delete message
    const handleDeleteMessage = (messageId) => {
        setMessageToDelete(messageId);
        setDeleteModalOpen(true);
    };

    const confirmDeleteMessage = async () => {
        if (!messageToDelete) return;
        try {
            await api.delete(`/messages/${messageToDelete}`);
        } catch (error) {
            console.error('Failed to delete message:', error);
        } finally {
            setMessageToDelete(null);
        }
    };

    // Get typing indicator
    const typingUsersList = typingUsers[conversationId] || [];
    const showTypingIndicator = typingUsersList.length > 0;

    // Get conversation type
    const { conversations } = useSelector((state) => state.messages);
    const activeConversation = conversations.find(c => c._id === conversationId);

    // Ensure messages is always an array
    const messageList = Array.isArray(messages) ? messages : [];
    const hasMessages = messageList.length > 0;

    if (!hasMessages) {
        return (
            <>
                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDeleteMessage}
                    title="Delete Message?"
                    message="This message will be permanently deleted. This action cannot be undone."
                    confirmText="Delete"
                    isDangerous={true}
                />
                <div className="flex-1 flex items-center justify-center h-full w-full">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">No messages</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteMessage}
                title="Delete Message?"
                message="This message will be permanently deleted. This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                <style>
                    {`
                @keyframes messageEntry {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .message-animate {
                    animation: messageEntry 0.3s ease-out forwards;
                }
                `}
                </style>

                {messageList.map((message, index) => {
                    const currentUserId = user._id || user.id;
                    const senderId = message.sender?._id || message.sender;
                    const isOwnMessage = senderId?.toString() === currentUserId?.toString();

                    const previousMsg = messageList[index - 1];
                    const showDateSeparator = needsDateSeparator(message, previousMsg);
                    const grouped = isConsecutive(message, previousMsg);

                    return (
                        <React.Fragment key={message._id || index}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                                <div className="flex items-center gap-4 my-8">
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-white px-2">
                                        {formatDateSeparator(message.createdAt)}
                                    </span>
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div
                                className={`group flex w-full message-animate ${isOwnMessage ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-1' : 'mt-4'}`}
                            >
                                <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar (only for non-own messages and if not grouped or first in group) */}
                                    {!isOwnMessage && (
                                        <div className={`flex-shrink-0 w-8 mr-3 ${grouped ? 'invisible' : ''}`}>
                                            {message.sender?.avatar ? (
                                                <img
                                                    src={message.sender.avatar}
                                                    alt={message.sender.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {message.sender?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Message Content */}
                                    <div className={`relative px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md
                                        ${isOwnMessage
                                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                                        }
                                    `}>
                                        {/* Sender Name (only in group chats, not own message) */}
                                        {!isOwnMessage && activeConversation?.type !== 'direct' && !grouped && (
                                            <p className="text-[10px] font-bold text-gray-400 mb-1">
                                                {message.sender?.name}
                                            </p>
                                        )}

                                        {/* Attachments */}
                                        {message.attachments?.map((attachment, i) => (
                                            <div key={i} className="mb-2">
                                                {attachment.type?.startsWith('image/') ? (
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                        style={{ maxHeight: '200px' }}
                                                        onClick={() => window.open(attachment.url, '_blank')}
                                                    />
                                                ) : (
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-2 p-2 rounded-lg ${isOwnMessage ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'}`}
                                                    >
                                                        <Paperclip size={16} />
                                                        <span className="text-sm underline break-all">{attachment.name}</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}

                                        {/* Text Content */}
                                        {message.content && (
                                            <p className={`text-[14px] leading-relaxed whitespace-pre-wrap break-words`}>
                                                {message.content}
                                            </p>
                                        )}

                                        {/* Message Info (Time & Status) */}
                                        <div className={`flex items-center justify-end gap-1.5 mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                            <span className="text-[10px]">
                                                {format(new Date(message.createdAt), 'h:mm a')}
                                            </span>
                                            {isOwnMessage && (
                                                <span className="text-[10px]">
                                                    {/* WhatsApp-style read receipts */}
                                                    {message.readBy && message.readBy.length > 0 ? (
                                                        // Read by others (double check)
                                                        <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 16 15">
                                                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                                                        </svg>
                                                    ) : (
                                                        // Sent (single check)
                                                        <svg className="w-3.5 h-3.5 inline opacity-70" fill="currentColor" viewBox="0 0 16 15">
                                                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z" />
                                                        </svg>
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions (Delete) */}
                                        {isOwnMessage && (
                                            <button
                                                onClick={() => handleDeleteMessage(message._id)}
                                                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full"
                                                title="Delete message"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* Typing Indicator */}
                {showTypingIndicator && (
                    <div className="flex items-center gap-2 mt-2 ml-14 animate-fade-in">
                        <div className="flex gap-1 bg-gray-100 px-3 py-2 rounded-full">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Someone is typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </>
    );
};

export default MessageList;
