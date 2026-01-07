import React, { useState } from 'react';
import { Calendar, Users, Clock, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const TaskListView = ({ tasks = [], onTaskClick, onDeleteTask, onAddTask }) => {
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    const priorityColors = {
        'Low': 'bg-gray-100 text-gray-600',
        'Medium': 'bg-blue-100 text-blue-700',
        'High': 'bg-orange-100 text-orange-700',
        'Urgent': 'bg-red-100 text-red-700',
    };

    const statusColors = {
        'To Do': 'bg-gray-100 text-gray-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'In Review': 'bg-purple-100 text-purple-700',
        'Done': 'text-orange-700',
    };

    // Format time
    const formatTime = (seconds) => {
        if (!seconds) return '0h';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filterStatus !== 'all' && task.status !== filterStatus) return false;
        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
        return true;
    });

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'dueDate') {
            aValue = aValue ? new Date(aValue).getTime() : Infinity;
            bValue = bValue ? new Date(bValue).getTime() : Infinity;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <div>
                    <label className="text-xs text-gray-500 mr-2">Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Done">Done</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-500 mr-2">Priority:</label>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>

                <div className="ml-auto text-sm text-gray-500">
                    {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50 border-b">
                        <tr>
                            <th
                                className="text-left py-3 px-4 text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('title')}
                            >
                                Task {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="text-left py-3 px-4 text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('status')}
                            >
                                Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="text-left py-3 px-4 text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('priority')}
                            >
                                Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                                Assignees
                            </th>
                            <th
                                className="text-left py-3 px-4 text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('dueDate')}
                            >
                                Due Date {sortField === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                                Time
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-24 text-center bg-gray-50/30">
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                                            📋
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">No tasks in sight</h3>
                                        <p className="text-sm text-gray-400 mb-6">
                                            It's a clean slate! Create your first task to start organizing your work and hitting your goals.
                                        </p>
                                        <button
                                            onClick={onAddTask}
                                            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                        // Note: In global view, this would need to open a modal where project can be selected
                                        // The parent component Tasks.jsx already has this modal logic.
                                        // We usually pass a prop to trigger it or use a global modal.
                                        // Since this is a list view component, we can use a callback if provided.
                                        >
                                            Add New Task
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedTasks.map((task) => (
                                <tr
                                    key={task._id}
                                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => onTaskClick?.(task)}
                                    style={task.status === 'Done' ? { backgroundColor: '#fce2d7' } : {}}
                                >
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-sm text-gray-900">{task.title}</div>
                                        {task.description && (
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {task.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={clsx(
                                            "inline-block px-2 py-1 rounded-full text-xs font-medium",
                                            statusColors[task.status]
                                        )}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={clsx(
                                            "inline-block px-2 py-1 rounded-full text-xs font-medium",
                                            priorityColors[task.priority]
                                        )}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex -space-x-1.5">
                                            {task.assignees && task.assignees.length > 0 ? (
                                                task.assignees.slice(0, 3).map((assignee, i) => (
                                                    <div
                                                        key={assignee._id || i}
                                                        className="w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                                                        title={assignee.name}
                                                    >
                                                        {assignee.avatar ? (
                                                            <img
                                                                src={assignee.avatar}
                                                                alt={assignee.name}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            assignee.name?.substring(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <Users size={14} className="mr-1" />
                                                    Unassigned
                                                </div>
                                            )}
                                            {task.assignees && task.assignees.length > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold">
                                                    +{task.assignees.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {task.dueDate ? (
                                            <div className={clsx(
                                                "flex items-center text-xs",
                                                new Date(task.dueDate) < new Date() && task.status !== 'Done'
                                                    ? "text-red-600 font-semibold"
                                                    : "text-gray-600"
                                            )}>
                                                <Calendar size={12} className="mr-1" />
                                                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">No due date</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Clock size={12} className="mr-1" />
                                            {formatTime(task.totalTimeSpent)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTaskClick?.(task);
                                            }}
                                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors mr-1"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete this task?')) {
                                                    onDeleteTask?.(task._id);
                                                }
                                            }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskListView;
