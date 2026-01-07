import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

const ProjectAnalytics = ({ tasks = [], members = [] }) => {
    // 1. Task Status Distribution
    const statusData = useMemo(() => {
        const counts = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0 };
        tasks.forEach(task => {
            if (counts[task.status] !== undefined) counts[task.status]++;
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [tasks]);

    const statusColors = {
        'To Do': '#94a3b8',       // Gray
        'In Progress': '#3b82f6', // Blue
        'In Review': '#f59e0b',   // Amber
        'Done': '#22c55e'         // Green
    };

    // 2. Time vs Actual (Top 5 tasks with highest variance or just total?)
    // Let's do Total Project Time vs Estimate
    const timeStats = useMemo(() => {
        let totalEst = 0;
        let totalSpent = 0;
        tasks.forEach(task => {
            totalEst += Number(task.timeEstimate) || 0;
            totalSpent += Number(task.timeSpent) || Number(task.totalTimeSpent / 3600) || 0; // handle legacy seconds
        });
        return [
            { name: 'Estimated', hours: parseFloat(totalEst.toFixed(1)) },
            { name: 'Actual', hours: parseFloat(totalSpent.toFixed(1)) }
        ];
    }, [tasks]);

    // 3. Workload per Member
    const workloadData = useMemo(() => {
        const memberStats = {};
        tasks.forEach(task => {
            task.assignees.forEach(assignee => {
                const name = assignee.name || 'Unknown';
                if (!memberStats[name]) memberStats[name] = 0;
                memberStats[name]++;
            });
        });
        return Object.keys(memberStats).map(name => ({ name, tasks: memberStats[name] }));
    }, [tasks]);

    // Summary Cards Helper
    const completionRate = useMemo(() => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'Done').length;
        return Math.round((completed / tasks.length) * 100);
    }, [tasks]);

    return (
        <div className="space-y-6 pb-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Completion Rate</p>
                        <h3 className="text-2xl font-bold text-gray-800">{completionRate}%</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Hours Spent</p>
                        <h3 className="text-2xl font-bold text-gray-800">{timeStats[1].hours}h</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Overdue Tasks</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length}
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Tasks</p>
                        <h3 className="text-2xl font-bold text-gray-800">{tasks.length}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Task Status Distribution</h3>
                    <div className="h-64 cursor-pointer">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Time Analysis */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Estimated vs Actual Hours</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Workload */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Team Workload (Tasks Assigned)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workloadData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="tasks" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;
