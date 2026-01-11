import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MoreVertical, Edit, Archive, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Dropdown from '@/components/Dropdown';

const ProjectCard = ({ project, onEdit, onArchive, onDelete }) => {
    const statusColors = {
        'Active': 'bg-success/10 text-success',
        'Completed': 'bg-primary/10 text-primary',
        'On Hold': 'bg-warning/10 text-warning',
        'In Progress': 'bg-blue-100 text-blue-600',
        'Archived': 'bg-gray-200 text-gray-500'
    };

    const menuItems = [
        {
            icon: Edit,
            label: 'Edit Project',
            action: () => onEdit?.(project),
        },
        {
            icon: Archive,
            label: project.status === 'Archived' ? 'Unarchive' : 'Archive',
            action: () => onArchive?.(project),
        },
        { divider: true },
        {
            icon: Trash2,
            label: 'Delete',
            action: () => onDelete?.(project),
            danger: true,
        },
    ];

    // Filter to show only valid project members (exclude entries without proper user data)
    const validMembers = (project.members || []).filter(member => {
        const name = member.user?.name || member.name;
        const avatar = member.user?.avatar || member.avatar;
        // Only include members with valid name or avatar
        return name && name !== 'U' && name.trim() !== '';
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all group cursor-pointer border border-gray-100 overflow-hidden relative"
        >
            {/* Color Strip */}
            <div className="h-1.5 w-full absolute top-0 left-0" style={{ backgroundColor: project.color || '#3b82f6' }}></div>

            <div className="p-5 pt-6">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                            {project.icon || '📁'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{project.title}</h3>
                            <span className={clsx("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full", statusColors[project.status] || statusColors['Active'])}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <Dropdown
                            trigger={
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical size={18} />
                                </button>
                            }
                            items={menuItems}
                        />
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px] pl-1">{project.description}</p>

                {/* Progress Bar */}
                <div className="mb-6 px-1">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Progress</span>
                        <span className="text-[10px] font-black text-primary uppercase">
                            {project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]"
                            style={{
                                width: `${project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0}%`,
                                backgroundColor: project.color || 'var(--primary)'
                            }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-2">
                        {validMembers.slice(0, 4).map((member, idx) => (
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
                        {validMembers.length > 4 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm shrink-0">
                                +{validMembers.length - 4}
                            </div>
                        )}
                        {validMembers.length === 0 && (
                            <div className="text-xs text-gray-400 italic">No members</div>
                        )}
                    </div>

                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <Calendar size={12} className="mr-1.5" />
                        {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No Date'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
