import React, { useState, useEffect } from 'react';
import { X, CheckSquare, MessageSquare, Clock, Calendar, Flag, User, Trash2, Plus, Send, Play, Pause, StopCircle, ChevronDown, Check, Briefcase, Hash } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/Toast';
import api from '@/services/api';
import { fetchUsers } from '@/store/slices/userSlice';
import { fetchProjects } from '@/store/slices/projectSlice';
import { fetchTasks, createTask, updateTask, deleteTask, startTimer, stopTimer } from '@/store/slices/taskSlice';
import { format, isValid } from 'date-fns';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const TaskModal = ({ isOpen, onClose, task, projectId, mode = 'edit', onUpdate }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { users } = useSelector((state) => state.users);
    const { projects } = useSelector((state) => state.projects);
    const { currentWorkspace } = useSelector((state) => state.workspaces);

    // Find project to get member roles
    const [selectedProjectId, setSelectedProjectId] = useState(projectId || task?.project?._id || task?.project || '');
    const project = projects.find(p => p._id === selectedProjectId);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
        startDate: '',
        assignees: [],
        timeEstimate: 0,
        timeSpent: 0
    });

    const [subtasks, setSubtasks] = useState([]);
    const [subtaskInput, setSubtaskInput] = useState('');
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [timeLogs, setTimeLogs] = useState([]);
    const [totalTime, setTotalTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

    // Timer state
    const isTracking = !!task?.timerStartTime;
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Fetch data if missing
    useEffect(() => {
        if (isOpen) {
            if (users.length === 0) dispatch(fetchUsers());
            if (projects.length === 0) dispatch(fetchProjects());
        }
    }, [isOpen, dispatch, users.length, projects.length]);

    // Initialize/Sync form data
    useEffect(() => {
        if (isOpen) {
            const initialProjectId = projectId || task?.project?._id || task?.project || '';
            setSelectedProjectId(initialProjectId);

            if (mode === 'edit' && task) {
                setFormData({
                    title: task.title || '',
                    description: task.description || '',
                    status: task.status || 'To Do',
                    priority: task.priority || 'Medium',
                    dueDate: task.dueDate || '',
                    startDate: task.startDate || '',
                    assignees: task.assignees?.map(a => typeof a === 'object' ? a._id : a) || [],
                    timeEstimate: task.timeEstimate || 0,
                    timeSpent: task.timeSpent || 0
                });
                setSubtasks(task.subtasks || []);
                setComments(task.comments || []);
                setTimeLogs(task.timeLogs || []);
                setTotalTime(task.totalTimeSpent || 0);
            } else {
                // Reset for Create mode
                setFormData({
                    title: '',
                    description: '',
                    status: 'To Do',
                    priority: 'Medium',
                    dueDate: '',
                    startDate: '',
                    assignees: [],
                    timeEstimate: 0,
                    timeSpent: 0
                });
                setSubtasks([]);
                setComments([]);
                setTimeLogs([]);
                setTotalTime(0);
            }
        }
    }, [isOpen, mode, task, projectId]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTracking && task?.timerStartTime) {
            const startTime = new Date(task.timerStartTime).getTime();
            const now = Date.now();
            setElapsedSeconds(Math.floor((now - startTime) / 1000));

            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isTracking, task?.timerStartTime]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            if (!isValid(d)) return '';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch { return ''; }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSubtask = (index) => {
        const updated = [...subtasks];
        updated[index].completed = !updated[index].completed;
        setSubtasks(updated);
    };

    const addSubtask = (e) => {
        e.preventDefault();
        if (!subtaskInput.trim()) return;
        setSubtasks([...subtasks, { title: subtaskInput, completed: false }]);
        setSubtaskInput('');
    };

    const deleteSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleAssigneeToggle = (userId) => {
        const isSelected = formData.assignees.includes(userId);
        setFormData(prev => ({
            ...prev,
            assignees: isSelected
                ? prev.assignees.filter(id => id !== userId)
                : [...prev.assignees, userId]
        }));
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        try {
            setLoading(true);
            const taskData = {
                ...formData,
                subtasks,
                // If selectedProjectId is empty, send null/undefined or implicit handling in backend
                project: selectedProjectId || null
            };

            if (mode === 'edit') {
                await dispatch(updateTask({ taskId: task._id, updates: taskData })).unwrap();
                toast.success('Task updated successfully');
            } else {
                await dispatch(createTask(taskData)).unwrap();
                toast.success('Task created successfully');
            }
            onUpdate?.(taskData);
            onClose();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${task._id}`);
            dispatch(deleteTask(task._id));
            toast.success('Task deleted successfully!');
            onClose();
        } catch (error) { toast.error('Failed to delete task'); }
    };

    const handleStartTracking = async () => {
        try {
            const result = await dispatch(startTimer(task._id)).unwrap();
            onUpdate?.(result);
        } catch (error) { toast.error('Failed to start timer'); }
    };

    const handleStopTracking = async () => {
        try {
            const result = await dispatch(stopTimer(task._id)).unwrap();
            setTimeLogs([...result.timeLogs]);
            setTotalTime(result.totalTimeSpent);
            setElapsedSeconds(0);
            onUpdate?.(result);
            toast.success('Time logged successfully!');
        } catch (error) { toast.error('Failed to stop timer'); }
    };

    const addComment = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        try {
            const { data } = await api.post(`/tasks/${task._id}/comments`, { text: commentInput });
            setComments([...comments, data]);
            setCommentInput('');
            toast.success('Comment added!');
        } catch (error) { toast.error('Failed to add comment'); }
    };

    // Helper to get user role in project (safe handling for no project)
    const getUserRole = (userId) => {
        if (!project) return 'Member';
        const member = project.members?.find(m => (m.user?._id || m.user) === userId);
        return member?.role || 'Member';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0F1115]/60 backdrop-blur-sm"
                onClick={onClose}
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden ring-1 ring-gray-900/5"
            >
                {/* Main Content (Left) */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                        <div className="flex-1 mr-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Hash size={12} className="text-gray-400" />
                                    <span>{mode === 'edit' && task?._id ? `TASK-${task._id.slice(-4).toUpperCase()}` : 'NEW TASK'}</span>
                                </div>
                                {/* Project Selector/Badge */}
                                <div className="relative group min-w-[140px]">
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="w-full appearance-none bg-transparent text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer pr-4 focus:outline-none"
                                    >
                                        <option value="">Personal Task (No Project)</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Task Title"
                                className="text-3xl md:text-4xl font-extrabold text-gray-900 w-full border-none focus:ring-0 p-0 placeholder-gray-300 bg-transparent tracking-tight leading-tight"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-8">
                        {/* Description */}
                        <div className="group">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full min-h-[120px] text-gray-600 text-lg leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none placeholder-gray-300"
                                placeholder="Add a more detailed description..."
                            />
                        </div>

                        {/* Subtasks */}
                        <section className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckSquare size={14} /> Subtasks
                            </h3>
                            <div className="space-y-2 mb-4">
                                {subtasks.map((st, index) => (
                                    <div key={index} className="flex items-center group bg-white p-2 pr-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                                        <button
                                            onClick={() => toggleSubtask(index)}
                                            className={clsx(
                                                "flex-shrink-0 w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all mr-3",
                                                st.completed ? "bg-primary border-primary text-white" : "border-gray-300 hover:border-primary text-transparent"
                                            )}
                                        >
                                            <Check size={12} strokeWidth={4} />
                                        </button>
                                        <span className={clsx("flex-1 text-sm font-medium transition-colors", st.completed ? "text-gray-400 line-through" : "text-gray-700")}>
                                            {st.title}
                                        </span>
                                        <button onClick={() => deleteSubtask(index)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={addSubtask} className="relative">
                                <Plus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={subtaskInput}
                                    onChange={(e) => setSubtaskInput(e.target.value)}
                                    placeholder="Add new subtask"
                                    className="w-full text-sm font-medium pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder-gray-400"
                                />
                            </form>
                        </section>

                        {/* Comments */}
                        {mode === 'edit' && (
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MessageSquare size={14} /> Activity
                                </h3>
                                <div className="space-y-6 mb-6">
                                    {comments.map((comment, index) => (
                                        <div key={index} className="flex gap-4 group">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-white shadow-sm ring-1 ring-gray-100">
                                                {comment.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-gray-900">{comment.user?.name}</span>
                                                    <span className="text-xs text-gray-400">{comment.createdAt && isValid(new Date(comment.createdAt)) ? format(new Date(comment.createdAt), 'MMM d, h:mm a') : 'Just now'}</span>
                                                </div>
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl rounded-tl-sm border border-gray-100 group-hover:border-gray-200 transition-colors">
                                                    {comment.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                                    <form onSubmit={addComment} className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="w-full text-sm py-3 px-4 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentInput.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-lg disabled:text-gray-300 disabled:hover:bg-transparent transition-all"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </form>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center">
                        {mode === 'edit' && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-rose-600 px-4 py-2 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="w-full md:w-[320px] bg-gray-50 border-l border-gray-100 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        {/* Status */}
                        <section>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Status</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full appearance-none bg-white font-bold text-gray-700 text-sm p-3.5 pr-10 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                >
                                    <option>To Do</option>
                                    <option>In Progress</option>
                                    <option>In Review</option>
                                    <option>Done</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </section>

                        {/* Priority */}
                        <section>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Priority</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={clsx(
                                            "py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center",
                                            formData.priority === p
                                                ? "bg-[#1A1D23] border-[#1A1D23] text-white shadow-lg shadow-gray-200"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Assignees */}
                        <section>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Assignees</label>
                            <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
                                <button
                                    onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors mb-2"
                                >
                                    <span className="text-sm font-bold text-gray-500 pl-1">
                                        {formData.assignees.length ? `${formData.assignees.length} Assigned` : 'Add People'}
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                        <Plus size={16} />
                                    </div>
                                </button>

                                {isAssigneeOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="border-t border-gray-100 pt-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        {users.map(user => {
                                            const isSelected = formData.assignees.includes(user._id);
                                            return (
                                                <div
                                                    key={user._id}
                                                    onClick={() => handleAssigneeToggle(user._id)}
                                                    className={clsx(
                                                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                                        isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <span className={clsx("text-sm font-medium flex-1 truncate", isSelected ? "text-primary" : "text-gray-700")}>{user.name}</span>
                                                    {isSelected && <Check size={14} className="text-primary" />}
                                                </div>
                                            )
                                        })}
                                    </motion.div>
                                )}

                                {formData.assignees.length > 0 && (
                                    <div className="flex flex-wrap gap-2 px-1 pb-1">
                                        {formData.assignees.map(id => {
                                            const u = users.find(x => x._id === id);
                                            if (!u) return null;
                                            return (
                                                <div key={id} className="relative group">
                                                    <img
                                                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`}
                                                        className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                                                        title={u.name}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Dates */}
                        <section className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formatDateForInput(formData.startDate)}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl p-3 outline-none focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formatDateForInput(formData.dueDate)}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl p-3 outline-none focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </section>

                        {/* Time Timer */}
                        {mode === 'edit' && task && (
                            <section className="bg-[#1A1D23] rounded-2xl p-5 text-white shadow-lg overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Clock size={80} />
                                </div>
                                <div className="relative z-10">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Time Tracker</label>
                                    <div className="font-mono text-3xl font-bold tracking-tight mb-4">
                                        {formatTime(isTracking ? elapsedSeconds : totalTime)}
                                    </div>

                                    <div className="flex gap-2">
                                        {isTracking ? (
                                            <button
                                                onClick={handleStopTracking}
                                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <StopCircle size={14} /> Stop
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleStartTracking}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <Play size={14} /> Start Timer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskModal;
