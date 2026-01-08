import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import ViewSwitcher from '@/components/Project/ViewSwitcher';
import BoardView from '@/components/Project/Views/BoardView';
import TableView from '@/components/Project/Views/TableView';
import CalendarView from '@/components/Project/Views/CalendarView';
import GanttView from '@/components/Project/Views/GanttView';
import { Filter, Users, MoreHorizontal, ChevronDown, Settings as SettingsIcon, Archive, Trash2 } from 'lucide-react';
import TaskModal from '@/components/TaskModal';
import Dropdown from '@/components/Dropdown';
import { fetchTasksByProject, clearTasks } from '@/store/slices/taskSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import ProjectAnalytics from './ProjectAnalytics';
import ProjectTeam from './ProjectTeam';
import ProjectSettingsModal from '@/components/ProjectSettingsModal';
import api from '@/services/api';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip.jsx';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);

    // UI State
    const [currentView, setCurrentView] = useState('table');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskModalMode, setTaskModalMode] = useState('edit');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    // Data State
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data - Optimized to load in parallel
    useEffect(() => {
        if (id) {
            const loadProjectData = async () => {
                try {
                    setLoading(true);
                    // Make all API calls in parallel for faster loading
                    const [projectResponse] = await Promise.all([
                        api.get(`/projects/${id}`),
                        dispatch(fetchTasksByProject(id)),
                        dispatch(fetchUsers())
                    ]);
                    setProject(projectResponse.data);
                } catch (error) {
                    console.error("Failed to load project", error);
                    toast.error("Failed to load project");
                } finally {
                    setLoading(false);
                }
            };
            loadProjectData();
        }

        // Cleanup tasks on unmount to prevent leakage to other views
        return () => {
            dispatch(clearTasks());
        }
    }, [id, dispatch, toast]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setTaskModalMode('edit');
        setIsTaskModalOpen(true);
    };

    const handleAddTaskClick = () => {
        setSelectedTask(null);
        setTaskModalMode('create');
        setIsTaskModalOpen(true);
    };

    const handleArchiveProject = async () => {
        if (!project) return;
        try {
            const newStatus = project.status === 'Archived' ? 'Active' : 'Archived';
            const { data } = await api.put(`/projects/${project._id}`, { status: newStatus });
            setProject(data);
            toast.success(`Project ${newStatus === 'Archived' ? 'archived' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update project status');
        }
    };

    const handleDeleteProject = async () => {
        try {
            await api.delete(`/projects/${project._id}`);
            toast.success('Project deleted');
            navigate('/projects');
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex-1 flex items-center justify-center h-full text-gray-500">
                Project not found
            </div>
        );
    }

    // Filter Logic: Strictly filter by project ID to ensure no leakage
    const filteredTasks = tasks.filter(task => {
        const isCorrectProject = task.project?._id === id || task.project === id;
        if (!isCorrectProject) return false;

        if (filterStatus === 'All') return true;
        return task.status === filterStatus;
    });

    const renderView = () => {
        const props = {
            tasks: filteredTasks,
            onTaskClick: handleTaskClick,
            onAddTaskClick: handleAddTaskClick
        };
        switch (currentView) {
            case 'board': return <BoardView {...props} />;
            case 'table': return <TableView {...props} project={project} />;
            case 'calendar': return <CalendarView {...props} />;
            case 'gantt': return <GanttView {...props} />;
            case 'analytics': return <ProjectAnalytics tasks={tasks} members={project.members || []} />;
            case 'team': return <ProjectTeam project={project} onUpdate={setProject} />;
            case 'timeline': return <GanttView {...props} />;
            default: return <BoardView {...props} />;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden -m-6">
            {/* Project Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500 mb-1 overflow-hidden">
                            <span className="whitespace-nowrap">Projects</span>
                            <span>/</span>
                            <span className="truncate">{project.title}</span>
                        </div>
                        <div className="flex items-center group">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                                {project.title}
                            </h1>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSettingsModalOpen(true);
                                }}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                            >
                                <ChevronDown size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {/* Members Stack */}
                        <div className="flex items-center gap-2 mr-1">
                            <div className="flex w-full items-center justify-center">
                                <AnimatedTooltip
                                    items={(project.members || [])
                                        .filter(m => m.user && m.status !== 'removed' && m.status !== 'banned')
                                        .map(m => ({
                                            id: m.user._id,
                                            name: m.user.name,
                                            designation: m.role || 'Member',
                                            image: m.user.avatar || `https://ui-avatars.com/api/?name=${m.user.name}&background=random`
                                        }))}
                                />
                            </div>
                            <button
                                onClick={() => setCurrentView('team')}
                                className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 ml-4 transition-colors shrink-0"
                            >
                                <Users size={12} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto md:ml-0">
                            <Dropdown
                                trigger={
                                    <button className="flex items-center px-2 md:px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                                        <Filter size={14} className="mr-1.5 md:mr-2" />
                                        <span className="hidden sm:inline">{filterStatus === 'All' ? 'Filter' : filterStatus}</span>
                                        <span className="sm:hidden">{filterStatus === 'All' ? 'All' : filterStatus}</span>
                                    </button>
                                }
                                items={[
                                    { label: 'All Tasks', action: () => setFilterStatus('All') },
                                    { divider: true },
                                    { label: 'To Do', action: () => setFilterStatus('To Do') },
                                    { label: 'In Progress', action: () => setFilterStatus('In Progress') },
                                    { label: 'In Review', action: () => setFilterStatus('In Review') },
                                    { label: 'Done', action: () => setFilterStatus('Done') }
                                ]}
                            />

                            <Dropdown
                                trigger={
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                }
                                items={[
                                    {
                                        label: 'Project Settings',
                                        icon: SettingsIcon,
                                        action: () => setIsSettingsModalOpen(true)
                                    },
                                    {
                                        label: project.status === 'Archived' ? 'Unarchive Project' : 'Archive Project',
                                        icon: Archive,
                                        action: handleArchiveProject
                                    },
                                    {
                                        label: 'Delete Project',
                                        icon: Trash2,
                                        danger: true,
                                        action: () => setIsDeleteProjectOpen(true)
                                    }
                                ]}
                            />

                            <button
                                onClick={handleAddTaskClick}
                                className="px-3 md:px-4 py-2 bg-primary text-white rounded-lg text-xs md:text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap"
                            >
                                New Task
                            </button>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <ViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    onAddView={() => alert('Add View Modal Logic')}
                />
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
                {renderView()}
            </div>

            {isTaskModalOpen && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    task={selectedTask}
                    projectId={id}
                    mode={taskModalMode}
                    onUpdate={(updated) => {
                        setSelectedTask(updated);
                        dispatch(fetchTasksByProject(id));
                    }}
                />
            )}

            {/* Project Settings Modal */}
            <AnimatePresence>
                {isSettingsModalOpen && (
                    <ProjectSettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        project={project}
                        onUpdate={(updatedProject) => {
                            setProject(updatedProject);
                            // Force refresh tasks if status changed
                            if (updatedProject.status !== project.status) {
                                dispatch(fetchTasksByProject(id));
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Confirm Delete Project */}
            <ConfirmDialog
                isOpen={isDeleteProjectOpen}
                onClose={() => setIsDeleteProjectOpen(false)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                message={`Are you sure you want to delete "${project.title}"? This action cannot be undone and will remove all associated tasks.`}
                danger={true}
                confirmText="Delete Project"
            />
        </div>
    );
};

export default ProjectDetails;
