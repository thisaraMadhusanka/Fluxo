import React, { useState } from 'react';
import { Search, Clock, Smile, Heart, Coffee, Flag, Lightbulb, X } from 'lucide-react';

const EmojiPicker = ({ onSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('smileys');

    const emojiCategories = {
        recent: {
            icon: Clock,
            label: 'Recent',
            emojis: ['😊', '❤️', '👍', '🎉', '🔥']
        },
        smileys: {
            icon: Smile,
            label: 'Smileys & People',
            emojis: [
                '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
                '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
                '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
                '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
                '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
                '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕'
            ]
        },
        gestures: {
            icon: Heart,
            label: 'Gestures',
            emojis: [
                '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️',
                '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
                '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
                '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾'
            ]
        },
        objects: {
            icon: Coffee,
            label: 'Objects',
            emojis: [
                '⌚', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲',
                '🕹', '🗜', '💾', '💿', '📀', '📼', '📷', '📸',
                '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠',
                '📺', '📻', '🎙', '🎚', '🎛', '⏱', '⏲', '⏰'
            ]
        },
        symbols: {
            icon: Flag,
            label: 'Symbols',
            emojis: [
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
                '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
                '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️',
                '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈'
            ]
        },
        other: {
            icon: Lightbulb,
            label: 'Activities',
            emojis: [
                '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
                '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
                '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊',
                '🎯', '🪃', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌'
            ]
        }
    };

    const categories = Object.keys(emojiCategories);

    const filteredEmojis = searchQuery
        ? Object.values(emojiCategories)
            .flatMap(cat => cat.emojis)
            .filter(emoji => emoji.includes(searchQuery))
        : emojiCategories[activeCategory].emojis;

    return (
        <div className="w-80 bg-white rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header with Search */}
            <div className="p-3 border-b border-gray-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search emoji..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-2 py-3 border-b border-gray-100 overflow-x-auto">
                {categories.map((category) => {
                    const CategoryIcon = emojiCategories[category].icon;
                    return (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category);
                                setSearchQuery('');
                            }}
                            className={`p-2 rounded-lg transition-all ${activeCategory === category && !searchQuery
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                            title={emojiCategories[category].label}
                        >
                            <CategoryIcon size={20} />
                        </button>
                    );
                })}
                <button
                    onClick={onClose}
                    className="ml-auto p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Category Label */}
            {!searchQuery && (
                <div className="px-4 py-2 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {emojiCategories[activeCategory].label}
                    </h3>
                </div>
            )}

            {/* Emoji Grid */}
            <div className="p-3 max-h-64 overflow-y-auto">
                {filteredEmojis.length > 0 ? (
                    <div className="grid grid-cols-8 gap-1">
                        {filteredEmojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelect(emoji)}
                                className="p-2 text-2xl hover:bg-primary/10 rounded-lg transition-all transform hover:scale-125 active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No emojis found
                    </div>
                )}
            </div>

            {/* Footer Hint */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <Smile size={18} className="text-gray-400" />
                <span className="text-xs text-gray-500 italic">What's your mood?</span>
            </div>
        </div>
    );
};

export default EmojiPicker;
