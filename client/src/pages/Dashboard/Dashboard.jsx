import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckCircle, Clock, Folder, Briefcase, Plus, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '@/store/slices/taskSlice';
import KPICard from '@/components/KPICard';
import TaskModal from '@/components/TaskModal';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/services/api';
import { MiniChart } from '@/components/ui/MiniChart';

const Dashboard = () => {
    const { currentWorkspace, loading: workspaceLoading } = useSelector((state) => state.workspaces);
    const dispatch = useDispatch();
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Stats State
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [activityPeriod, setActivityPeriod] = useState('weekly');

    useEffect(() => {
        if (currentWorkspace) {
            dispatch(fetchTasks());
            fetchStats();
        }
    }, [dispatch, currentWorkspace?._id]);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const { data } = await api.get('/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
            if (error.response && error.response.status === 403) {
                // If forbidden, it implies access lost to this workspace. 
                // We could trigger a workspace refresh or deselect it, but for now just log it.
                // Ideally we dispatch an action to clear invalid workspace if needed.
            }
        } finally {
            setStatsLoading(false);
        }
    };

    if (!currentWorkspace && !workspaceLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Briefcase className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to TaskFlow</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    To get started, you need to create or join a workspace. Workspaces allow you to organize your team and projects.
                </p>
                <button
                    onClick={() => setIsCreateWorkspaceModalOpen(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Create Your First Workspace
                </button>
                <CreateWorkspaceModal
                    isOpen={isCreateWorkspaceModalOpen}
                    onClose={() => setIsCreateWorkspaceModalOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <div className="text-sm text-gray-500">Overview for workspace: {currentWorkspace?.name}</div>
                </div>
                <button onClick={fetchStats} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Refresh Data">
                    <RefreshCw size={18} className={statsLoading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Projects"
                    value={stats?.kpi?.totalProjects || 0}
                    icon={Folder}
                    color="primary"
                />
                <KPICard
                    title="Completed Tasks"
                    value={stats?.kpi?.completedTasks || 0}
                    icon={CheckCircle}
                    color="success"
                />
                <KPICard
                    title="Hours Logged"
                    value={stats?.kpi?.hoursLogged || 0}
                    icon={Clock}
                    color="warning"
                />
                <KPICard
                    title="Total Tasks"
                    value={stats?.kpi?.totalTasks || 0}
                    icon={LayoutDashboard}
                    color="secondary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Summary / Charts */}
                <div className="lg:col-span-2">
                    <MiniChart
                        data={stats?.weeklyActivity?.map(d => ({ label: d.name, value: d.tasks }))}
                        onPeriodChange={setActivityPeriod}
                    />
                </div>
                <div className="bg-card p-6 rounded-2xl border border-gray-100 min-h-[400px]">
                    <h2 className="text-lg font-bold mb-4">Today's Pending Tasks</h2>
                    <div className="space-y-4">
                        {stats?.todaysTasks && stats.todaysTasks.length > 0 ? (
                            stats.todaysTasks.map(task => (
                                <div
                                    key={task._id}
                                    onClick={() => setSelectedTask(task)}
                                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                                >
                                    <div className={`w-3 h-3 rounded-full mr-3 ${task.priority === 'High' || task.priority === 'Urgent' ? 'bg-red-500' :
                                        task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}></div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 text-center py-8">No pending tasks for today! 🎉</div>
                        )}
                        <button
                            onClick={() => setIsNewTaskModalOpen(true)}
                            className="w-full py-2 text-primary text-sm font-medium hover:bg-primary/5 rounded-lg transition-colors"
                        >
                            + Add New Task
                        </button>
                    </div>
                </div>
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

export default Dashboard;
