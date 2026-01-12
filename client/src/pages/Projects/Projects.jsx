import React, { useState, useEffect } from 'react';
import { Plus, Filter, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProjectCard from './ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import Dropdown from '@/components/Dropdown';
import { MoreVertical, Edit, Archive, Trash2 } from 'lucide-react';
import api from '@/services/api';

const Projects = () => {
    const { currentWorkspace } = useSelector((state) => state.workspaces);
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', status: 'Active', deadline: '', icon: '📁', color: '#3b82f6' });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Mock data for initial display if fetch fails or is empty
    const mockProjects = [
        { _id: '1', title: 'Website Redesign', description: 'Revamp the corporate website with new branding.', status: 'Active', deadline: new Date() },
        { _id: '2', title: 'Mobile App Launch', description: 'Prepare for the Q3 launch of the mobile application.', status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 5) },
        { _id: '3', title: 'Internal Audit', description: 'Yearly financial and security audit.', status: 'On Hold', deadline: new Date(Date.now() + 86400000 * 10) },
    ];

    useEffect(() => {
        if (currentWorkspace) {
            fetchProjects();
        }
    }, [currentWorkspace?._id]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/projects');
            // Check if we actually got projects, if empty array it's fine (just no projects in this workspace)
            // But if we want to show mock data ONLY on error, we should separate logic
            // For now, let's show real data if successful
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects, using mock", error);
            // setProjects(mockProjects); // Optional: keep mock data on error? Or show error state?
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProject = async (projectData) => {
        try {
            if (isEditing) {
                const { data } = await api.put(`/projects/${projectData._id}`, projectData);
                setProjects(projects.map(p => p._id === data._id ? data : p));
            } else {
                const { data } = await api.post('/projects', projectData);
                setProjects([...projects, data]);
            }

            setIsModalOpen(false);
            setIsEditing(false);
            setNewProject({ title: '', description: '', status: 'Active', deadline: '', icon: '📁', color: '#3b82f6' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProject = async (project) => {
        if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be permanently removed.')) return;
        try {
            await api.delete(`/projects/${project._id}`);
            setProjects(projects.filter(p => p._id !== project._id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleArchiveProject = async (project) => {
        try {
            const newStatus = project.status === 'Archived' ? 'Active' : 'Archived';
            const { data } = await api.put(`/projects/${project._id}`, { status: newStatus });
            setProjects(projects.map(p => p._id === project._id ? data : p));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-gray-500">Manage and track all your ongoing projects</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                    </div>

                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center shadow-sm flex-1 md:flex-none justify-center">
                        <Filter size={18} className="mr-2" />
                        Filter
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setNewProject({ title: '', description: '', status: 'Active', deadline: '', icon: '📁', color: '#3b82f6' });
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center shadow-lg shadow-orange-500/20 flex-1 md:flex-none justify-center whitespace-nowrap"
                    >
                        <Plus size={20} className="mr-2" />
                        New Project
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">
                        📁
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No projects yet</h2>
                    <p className="text-gray-500 text-center max-w-sm mb-8 px-4">
                        Every great achievement starts with a single step. Start your first project to begin tracking your tasks and team progress.
                    </p>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setNewProject({ title: '', description: '', status: 'Active', deadline: '', icon: '📁', color: '#3b82f6' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                    >
                        <Plus size={20} className="mr-2" /> Start New Project
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Array.isArray(projects) ? projects : []).map((project) => (
                        <div key={project._id} className="cursor-pointer block relative">
                            <Link to={`/projects/${project._id}`}>
                                <ProjectCard
                                    project={project}
                                    onDelete={handleDeleteProject}
                                    onArchive={handleArchiveProject}
                                    onEdit={(p) => {
                                        setNewProject(p);
                                        setIsEditing(true);
                                        setIsModalOpen(true);
                                    }}
                                />
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Deadline</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr >
                            </thead >
                            <tbody className="divide-y divide-gray-100">
                                {(Array.isArray(projects) ? projects : []).map((project) => (
                                    <tr key={project._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link to={`/projects/${project._id}`} className="flex items-center group">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-3 shadow-sm border border-gray-100 transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: `${project.color || '#3b82f6'}20` }}
                                                >
                                                    {project.icon || '📁'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 group-hover:text-primary transition-colors">{project.title}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{project.description}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${project.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                                project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                            {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2">
                                                {(() => {
                                                    const validMembers = (project.members || []).filter(member => {
                                                        const name = member.user?.name || member.name;
                                                        return name && name !== 'U' && name.trim() !== '';
                                                    });
                                                    return (
                                                        <>
                                                            {validMembers.slice(0, 3).map((member, idx) => (
                                                                <div
                                                                    key={member._id || idx}
                                                                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 overflow-hidden shadow-sm"
                                                                    title={member.user?.name || member.name}
                                                                >
                                                                    {member.user?.avatar || member.avatar ? (
                                                                        <img src={member.user?.avatar || member.avatar} alt={member.user?.name || member.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        (member.user?.name || member.name || 'U')[0].toUpperCase()
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {validMembers.length > 3 && (
                                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm shrink-0">
                                                                    +{validMembers.length - 3}
                                                                </div>
                                                            )}
                                                            {validMembers.length === 0 && (
                                                                <div className="text-xs text-gray-400 italic">No members</div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[150px]">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
                                                        style={{
                                                            width: `${project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0}%`,
                                                            backgroundColor: project.color || 'var(--primary)'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-black text-gray-500">
                                                    {project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <Dropdown
                                                trigger={
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-gray-600 transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                }
                                                items={[
                                                    { icon: Edit, label: 'Edit', action: () => { setNewProject(project); setIsEditing(true); setIsModalOpen(true); } },
                                                    { icon: Archive, label: project.status === 'Archived' ? 'Unarchive' : 'Archive', action: () => handleArchiveProject(project) },
                                                    { divider: true },
                                                    { icon: Trash2, label: 'Delete', action: () => handleDeleteProject(project), danger: true }
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table >
                    </div >
                </div >
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={newProject}
                isEditing={isEditing}
                onUpdate={handleUpdateProject}
            />
        </div >
    );
};

export default Projects;
