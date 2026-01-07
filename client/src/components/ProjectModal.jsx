import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Type, AlignLeft, Palette, CheckSquare, ChevronDown } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Dropdown from './Dropdown';

const ProjectModal = ({ isOpen, onClose, project, onUpdate, isEditing }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const dateInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Active',
        deadline: '',
        icon: '📁',
        color: '#3b82f6'
    });

    useEffect(() => {
        if (project && isEditing) {
            setFormData({
                _id: project._id,
                title: project.title || '',
                description: project.description || '',
                status: project.status || 'Active',
                deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
                icon: project.icon || '📁',
                color: project.color || '#3b82f6'
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'Active',
                deadline: '',
                icon: '📁',
                color: '#3b82f6'
            });
        }
    }, [project, isEditing, isOpen]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (status) => {
        setFormData(prev => ({ ...prev, status }));
    };

    const onEmojiClick = (emojiObject) => {
        setFormData(prev => ({ ...prev, icon: emojiObject.emoji }));
        setShowEmojiPicker(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    const handleDateClick = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <span className="text-xl">{formData.icon || '📁'}</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#1A1D23] uppercase tracking-tight">
                                {isEditing ? 'Edit Project' : 'New Project'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">PROJECT NAME</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Type size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Q4 Marketing Campaign"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-gray-800"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Icon & Color Row */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">ICON</label>
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent hover:border-primary/20 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all text-center text-3xl"
                                >
                                    {formData.icon || '📁'}
                                </button>
                                {showEmojiPicker && (
                                    <div ref={emojiPickerRef} className="absolute top-full left-0 mt-2 z-[100] shadow-2xl rounded-2xl overflow-hidden">
                                        <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">COLOR</label>
                                <div className="relative h-[72px] group">
                                    <div className="absolute inset-0 bg-gray-50 rounded-2xl group-focus-within:bg-white border-2 border-transparent group-focus-within:border-primary/20 transition-all"></div>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-3 w-full">
                                        <input
                                            type="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleChange}
                                            className="h-10 w-10 rounded-xl cursor-pointer border-2 border-white shadow-sm flex-shrink-0"
                                        />
                                        <span className="text-sm font-mono font-bold text-gray-500 uppercase">{formData.color}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">DESCRIPTION</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <AlignLeft size={18} />
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the project goals..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all h-32 resize-none font-medium text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Status & Deadline */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">STATUS</label>
                                <Dropdown
                                    align="left"
                                    trigger={
                                        <button
                                            type="button"
                                            className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent hover:border-primary/20 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-gray-800 flex items-center justify-between"
                                        >
                                            {formData.status}
                                            <ChevronDown size={18} className="text-gray-400" />
                                        </button>
                                    }
                                    items={[
                                        { label: 'Active', action: () => handleStatusChange('Active') },
                                        { label: 'On Hold', action: () => handleStatusChange('On Hold') },
                                        { label: 'Completed', action: () => handleStatusChange('Completed') },
                                        { label: 'Archived', action: () => handleStatusChange('Archived') }
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">DEADLINE</label>
                                <div
                                    onClick={handleDateClick}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="date"
                                        name="deadline"
                                        ref={dateInputRef}
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent group-hover:border-primary/20 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-gray-800 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-4 gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[2px] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                {isEditing ? 'Update Project' : 'Launch Project'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProjectModal;

