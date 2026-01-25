import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Image, PlusCircle, X, Loader2 } from 'lucide-react';
import { chatService } from '@/services/chatService';
import EmojiPicker from '@/components/EmojiPicker';
import api from '@/services/api';

const MessageInput = ({ conversationId }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const typingTimeoutRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle typing indicator
    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketService.startTyping(conversationId);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.stopTyping(conversationId);
        }, 2000);
    };

    // Handle input change
    const handleChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    // Handle file attachment
    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const attachments = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                const response = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                attachments.push({
                    name: response.data.originalName,
                    url: response.data.url,
                    type: response.data.mimetype,
                    size: response.data.size
                });
            }

            // Send message with attachments
            socketService.sendMessage({
                conversationId,
                content: message.trim() || 'Sent an attachment',
                type: 'file',
                attachments
            });

            setMessage('');
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle send message
    const handleSend = async () => {
        if (!message.trim()) return;

        const content = message.trim();
        console.log('Sending message:', { conversationId, content });

        // ... inside handleSend ...
        try {
            await chatService.sendMessage(conversationId, {
                content,
                type: 'text'
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        }

        setMessage('');

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            socketService.stopTyping(conversationId);
        }

        // Clear timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };


    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white px-3 md:px-6 py-4 md:py-6 border-t border-gray-100">
            <div className="w-full flex items-center gap-2 md:gap-4">
                {/* Input Container */}
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-[30px] px-2 md:px-4 py-1 transition-all duration-300 focus-within:border-gray-300 focus-within:shadow-sm">
                    {/* Attachment Button */}
                    <button
                        onClick={handleFileClick}
                        className="p-2 text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                        title="Add Attachment"
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <Paperclip size={20} className="stroke-[1.5]" />}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type something..."
                        className="flex-1 px-2 md:px-3 py-3 bg-transparent resize-none outline-none text-[15px] font-medium text-gray-700 placeholder:text-gray-400 max-h-[120px]"
                        rows={1}
                    />

                    {/* Emoji Button */}
                    <div className="relative" ref={emojiPickerRef}>
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                            title="Add Emoji"
                        >
                            <Smile size={20} className="stroke-[1.5]" />
                        </button>

                        {/* Advanced Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 z-50">
                                <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className={`p-3 md:p-4 rounded-full transition-all duration-300 transform active:scale-95 flex-shrink-0 flex items-center justify-center ${message.trim()
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                    title="Send Message"
                >
                    <Send size={20} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
