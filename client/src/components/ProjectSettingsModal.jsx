import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import api from '@/services/api';
import { useToast } from '@/components/Toast';

const ProjectSettingsModal = ({ isOpen, onClose, project, onUpdate }) => {
    const toast = useToast();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '',
        color: '',
        status: ''
    });

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || '',
                description: project.description || '',
                icon: project.icon || '📁',
                color: project.color || '#3b82f6',
                status: project.status || 'Active'
            });
        }
    }, [project]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/projects/${project._id}`, formData);
            onUpdate(data);
            toast.success('Project updated successfully');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update project');
        }
    };

    const onEmojiClick = (emojiObject) => {
        setFormData({ ...formData, icon: emojiObject.emoji });
        setShowEmojiPicker(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="text-xl">{formData.icon || '📁'}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Edit Project</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter project name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Icon</label>
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center text-3xl bg-gray-50 hover:bg-white"
                            >
                                {formData.icon || '📁'}
                            </button>
                            {showEmojiPicker && (
                                <div ref={emojiPickerRef} className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-xl overflow-hidden">
                                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                            <div className="relative">
                                <input
                                    type="color"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                />
                                <div
                                    className="w-full h-[52px] rounded-xl border-2 border-gray-200 cursor-pointer flex items-center justify-center font-mono text-sm text-gray-600"
                                    style={{ backgroundColor: formData.color }}
                                >
                                    <span className="px-3 py-1 bg-white/90 rounded-lg shadow-sm">{formData.color}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your project..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white font-medium cursor-pointer transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deadline</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/90 transition-all"
                        >
                            Update Project
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProjectSettingsModal;
