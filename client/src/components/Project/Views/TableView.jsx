import React, { useState, useEffect } from 'react';
import { Columns, CheckCircle, Play, Square, Circle, Plus } from 'lucide-react';
import Dropdown from '@/components/Dropdown';
import { useDispatch } from 'react-redux';
import { startTimer, stopTimer, updateTask } from '@/store/slices/taskSlice';
import { useToast } from '@/components/Toast';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';

const TableView = ({ tasks = [], onTaskClick, onAddTaskClick, project }) => {
    const dispatch = useDispatch();
    const toast = useToast();

    const handleToggleTimer = async (e, task) => {
        e.stopPropagation(); // Prevent row click

        try {
            if (task.timerStartTime) {
                await dispatch(stopTimer(task._id)).unwrap();
                toast.success('Timer stopped');
            } else {
                await dispatch(startTimer(task._id)).unwrap();
                toast.success('Timer started');
            }
        } catch (error) {
            console.error(error);
            toast.error(error || 'Failed to toggle timer');
        }
    };

    const handleToggleComplete = async (e, task) => {
        e.stopPropagation();
        try {
            const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
            await dispatch(updateTask({ taskId: task._id, updates: { status: newStatus } })).unwrap();
            toast.success(`Task marked as ${newStatus}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update task status');
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0h 0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    // Initialize state from localStorage or default
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem('taskflow_table_columns');
        return saved ? JSON.parse(saved) : {
            name: true,
            role: true,
            status: true,
            priority: true,
            assignees: true,
            time: true,
            timeEstimate: false,
            timeSpent: false,
            startDate: true,
            dueDate: true
        };
    });

    // Persist column changes
    useEffect(() => {
        localStorage.setItem('taskflow_table_columns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const toggleColumn = (key) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Helper to get member role in project
    const getMemberRole = (userId) => {
        if (!project || !project.members) return 'Member';
        const member = project.members.find(m => (m.user?._id || m.user) === userId);
        return member?.role || 'Member';
    };

    const columns = [
        { key: 'name', label: 'Task Name' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'assignees', label: 'Assignees' },
        { key: 'time', label: 'Time' },
        { key: 'timeEstimate', label: 'Estimated (hrs)' },
        { key: 'timeSpent', label: 'Spent (hrs)' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'dueDate', label: 'Due Date' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                <h3 className="font-bold text-gray-700">Project Tasks</h3>
                <div className="relative">
                    <Dropdown
                        trigger={
                            <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <Columns size={16} className="mr-2 text-gray-400" />
                                Columns
                            </button>
                        }
                        items={columns.map(col => ({
                            label: col.label,
                            icon: visibleColumns[col.key] ? CheckCircle : undefined,
                            action: () => toggleColumn(col.key),
                            className: visibleColumns[col.key] ? 'text-primary font-medium' : 'text-gray-500'
                        }))}
                    />
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider sticky top-0 z-10 shadow-sm">
                        <tr>
                            {visibleColumns.name && <th className="px-6 py-4 border-b border-gray-100 w-1/3 min-w-[300px]">Task Name</th>}
                            {visibleColumns.role && <th className="px-6 py-4 border-b border-gray-100 w-32">Role</th>}
                            {visibleColumns.status && <th className="px-6 py-4 border-b border-gray-100 w-32">Status</th>}
                            {visibleColumns.priority && <th className="px-6 py-4 border-b border-gray-100 w-32">Priority</th>}
                            {visibleColumns.assignees && <th className="px-6 py-4 border-b border-gray-100 w-48">Assignees</th>}
                            {visibleColumns.time && <th className="px-6 py-4 border-b border-gray-100 w-32">Time</th>}
                            {visibleColumns.timeEstimate && <th className="px-6 py-4 border-b border-gray-100 w-28">Estimated (hrs)</th>}
                            {visibleColumns.timeSpent && <th className="px-6 py-4 border-b border-gray-100 w-28">Spent (hrs)</th>}
                            {visibleColumns.startDate && <th className="px-6 py-4 border-b border-gray-100 w-32">Start Date</th>}
                            {visibleColumns.dueDate && <th className="px-6 py-4 border-b border-gray-100 w-32">Due Date</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {/* Quick Add Row */}
                        <tr
                            onClick={onAddTaskClick}
                            className="hover:bg-gray-50 cursor-pointer group transition-colors border-b border-dashed border-gray-200"
                        >
                            <td className="px-6 py-3 text-gray-400 group-hover:text-primary font-medium flex items-center" colSpan={Object.values(visibleColumns).filter(Boolean).length}>
                                <span className="mr-2 text-lg">+</span> Click to add new task
                            </td>
                        </tr>

                        {tasks.length > 0 ? tasks.map(task => (
                            <tr
                                key={task._id}
                                onClick={() => onTaskClick(task)}
                                className={`cursor-pointer transition-all duration-300 group ${task.status === 'Done'
                                    ? 'bg-orange-100 opacity-80 hover:opacity-100 hover:bg-orange-200 border-l-4 border-l-orange-400'
                                    : 'hover:bg-blue-50/30 bg-white border-l-4 border-l-transparent hover:border-l-primary'
                                    }`}
                            >
                                {visibleColumns.name && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            {/* Modern Checkbox */}
                                            <button
                                                onClick={(e) => handleToggleComplete(e, task)}
                                                className={`mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${task.status === 'Done'
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'border-gray-300 hover:border-primary text-white hover:text-gray-200'
                                                    }`}
                                            >
                                                <CheckCircle size={14} className={task.status === 'Done' ? 'opacity-100' : 'opacity-0 hover:opacity-100 text-gray-300'} />
                                            </button>

                                            <div>
                                                <div className={`font-medium text-gray-800 group-hover:text-primary transition-colors ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
                                                    {task.title}
                                                </div>
                                                {task.description && <div className="text-xs text-gray-400 truncate max-w-[250px] mt-0.5">{task.description}</div>}
                                            </div>
                                        </div>
                                    </td>
                                )}

                                {visibleColumns.role && (
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {task.assignees && task.assignees.length > 0 ? (
                                                task.assignees.filter(a => a).map((assignee, i) => {
                                                    const role = getMemberRole(assignee._id);
                                                    const roleColors = {
                                                        'Leader': 'bg-purple-100 text-purple-700',
                                                        'Developer': 'bg-blue-100 text-blue-700',
                                                        'Designer': 'bg-pink-100 text-pink-700',
                                                        'QA': 'bg-orange-100 text-orange-700',
                                                        'Member': 'bg-gray-100 text-gray-700',
                                                        'Viewer': 'bg-gray-50 text-gray-500'
                                                    };
                                                    return (
                                                        <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${roleColors[role] || roleColors['Member']}`}>
                                                            {role}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">-</span>
                                            )}
                                        </div>
                                    </td>
                                )}

                                {visibleColumns.status && (
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${task.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                task.status === 'In Review' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                )}

                                {visibleColumns.priority && (
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center ${task.priority === 'High' || task.priority === 'Urgent' ? 'text-red-600 bg-red-50 px-2 py-1 rounded w-fit' :
                                            task.priority === 'Medium' ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit' :
                                                'text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                )}

                                {visibleColumns.assignees && (
                                    <td className="px-6 py-4">
                                        {task.assignees?.filter(a => a).length > 0 ? (
                                            <AnimatedTooltip
                                                items={task.assignees.filter(a => a).map(a => ({
                                                    id: a._id,
                                                    name: a.name,
                                                    designation: getMemberRole(a._id),
                                                    image: a.avatar || `https://ui-avatars.com/api/?name=${a.name.replace(' ', '+')}&background=random`
                                                }))}
                                                className="justify-start"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Unassigned</span>
                                        )}
                                    </td>
                                )}

                                {visibleColumns.time && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => handleToggleTimer(e, task)}
                                                className={`p-1.5 rounded-full transition-colors ${task.timerStartTime
                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'
                                                    }`}
                                            >
                                                {task.timerStartTime ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                                            </button>
                                            <span className={`text-xs font-mono font-medium ${task.timerStartTime ? 'text-green-600' : 'text-gray-500'}`}>
                                                {task.timerStartTime ? 'Tracking...' : formatDuration(task.totalTimeSpent)}
                                            </span>
                                        </div>
                                    </td>
                                )}

                                {visibleColumns.timeEstimate && (
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center">
                                        {task.timeEstimate ? `${Math.floor(task.timeEstimate)}h ${Math.round((task.timeEstimate % 1) * 60)}m` : '-'}
                                    </td>
                                )}

                                {visibleColumns.timeSpent && (
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center font-mono">
                                        {task.totalTimeSpent ? `${Math.floor(task.totalTimeSpent / 3600)}h ${Math.floor((task.totalTimeSpent % 3600) / 60)}m` : '-'}
                                    </td>
                                )}

                                {visibleColumns.startDate && (
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {task.startDate ? new Date(task.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                    </td>
                                )}

                                {visibleColumns.dueDate && (
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-24 text-center bg-gray-50/30">
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-3xl animate-bounce duration-[3000ms]">
                                            🚀
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">No tasks in this project</h3>
                                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                            This project is empty. Ready to launch? Add your first task and start the countdown to success!
                                        </p>
                                        <button
                                            onClick={onAddTaskClick}
                                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center"
                                        >
                                            <Plus size={18} className="mr-2" /> Create First Task
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableView;
