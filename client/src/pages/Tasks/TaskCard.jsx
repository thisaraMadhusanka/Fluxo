import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, MoreHorizontal, Edit, UserPlus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Dropdown from '@/components/Dropdown';

const TaskCard = ({ task, index, onEdit, onReassign, onDelete }) => {
    const priorityColors = {
        'Low': 'bg-gray-100 text-gray-600',
        'Medium': 'bg-blue-50 text-blue-600',
        'High': 'bg-orange-50 text-orange-600',
        'Urgent': 'bg-red-50 text-red-600',
    };

    const menuItems = [
        {
            icon: Edit,
            label: 'Edit Task',
            action: () => onEdit?.(task),
        },
        {
            icon: UserPlus,
            label: 'Reassign',
            action: () => onReassign?.(task),
        },
        { divider: true },
        {
            icon: Trash2,
            label: 'Delete',
            action: () => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete?.(task);
                }
            },
            danger: true,
        },
    ];

    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={clsx(
                        "bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3 group transition-all",
                        snapshot.isDragging ? "shadow-lg rotate-2" : "hover:border-primary/30"
                    )}
                    style={{ ...provided.draggableProps.style }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", priorityColors[task.priority] || priorityColors['Medium'])}>
                            {task.priority}
                        </span>
                        <Dropdown
                            trigger={
                                <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors">
                                    <MoreHorizontal size={16} />
                                </button>
                            }
                            items={menuItems}
                        />
                    </div>

                    <h4
                        className="text-sm font-semibold text-text-primary mb-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onEdit?.(task)}
                    >
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="text-xs text-text-muted mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                        <div className="flex items-center space-x-3 text-gray-400">
                            {task.dueDate && (
                                <div className={clsx("flex items-center text-xs", new Date(task.dueDate) < new Date() && "text-danger")}>
                                    <Calendar size={12} className="mr-1" />
                                    {format(new Date(task.dueDate), 'MMM d')}
                                </div>
                            )}
                            {/* Placeholders for comments */}
                            <div className="flex items-center text-xs">
                                <MessageSquare size={12} className="mr-1" />
                                2
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="flex -space-x-1.5">
                            {task.assignees && task.assignees.length > 0 ? (
                                task.assignees.slice(0, 3).map((assignee, i) => (
                                    <div
                                        key={assignee._id || i}
                                        className="w-6 h-6 rounded-full bg-primary/80 border-2 border-white flex items-center justify-center text-white text-[10px] font-semibold"
                                        title={assignee.name}
                                    >
                                        {assignee.avatar ? (
                                            <img src={assignee.avatar} alt={assignee.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            assignee.name?.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <span className="text-[8px] text-gray-400">+</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
