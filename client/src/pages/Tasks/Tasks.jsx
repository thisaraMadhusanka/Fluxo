import React, { useState, useEffect } from 'react';
import { Filter, Plus, X } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import TaskListView from './TaskListView';
import TaskModal from '@/components/TaskModal';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '@/store/slices/taskSlice';

const Tasks = () => {
    const dispatch = useDispatch();
    const [view, setView] = useState('board'); // board, list
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const { tasks } = useSelector(state => state.tasks);
    const { currentWorkspace } = useSelector(state => state.workspaces);

    // Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    useEffect(() => {
        if (currentWorkspace) {
            dispatch(fetchTasks());
        }
    }, [dispatch, currentWorkspace?._id]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskModal = () => {
        setSelectedTask(null);
    };

    const handleTaskUpdate = (updatedTask) => {
        // Task updates will be handled via Redux
        setSelectedTask(null);
    };

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        if (statusFilter !== 'All' && task.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
        return true;
    });

    const clearFilters = () => {
        setStatusFilter('All');
        setPriorityFilter('All');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="flex flex-col mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
                        <p className="text-gray-500 text-sm">Manage tasks across all projects</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={16} className="mr-2" />
                            Filters
                            {(statusFilter !== 'All' || priorityFilter !== 'All') && (
                                <span className="ml-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
                            )}
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setView('board')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'board' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Board
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                List
                            </button>
                        </div>
                        <button
                            onClick={() => setIsNewTaskModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                        >
                            <Plus size={16} className="mr-2" /> New Task
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="All">All Statuses</option>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-500 mb-1">Priority</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="All">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {(statusFilter !== 'All' || priorityFilter !== 'All') && (
                            <button
                                onClick={clearFilters}
                                className="mt-auto mb-0.5 ml-2 text-xs text-red-500 hover:text-red-700 font-medium flex items-center"
                            >
                                <X size={12} className="mr-1" /> Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden">
                {view === 'board' ? (
                    <KanbanBoard onTaskClick={handleTaskClick} tasks={filteredTasks} />
                ) : (
                    <TaskListView
                        tasks={filteredTasks}
                        onTaskClick={handleTaskClick}
                        onAddTask={() => setIsNewTaskModalOpen(true)}
                    />
                )}
            </div>

            {/* Unified Task Modal (Create & Edit) */}
            {(isNewTaskModalOpen || selectedTask) && (
                <TaskModal
                    isOpen={isNewTaskModalOpen || !!selectedTask}
                    onClose={() => {
                        setIsNewTaskModalOpen(false);
                        setSelectedTask(null);
                    }}
                    task={selectedTask}
                    mode={selectedTask ? 'edit' : 'create'}
                    projectId={null}
                    onUpdate={(updated) => {
                        setSelectedTask(updated);
                        dispatch(fetchTasks());
                    }}
                />
            )}
        </div>
    );
};

export default Tasks;
