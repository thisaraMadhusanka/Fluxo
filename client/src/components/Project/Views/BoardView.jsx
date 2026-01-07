import { Calendar, MoreHorizontal, Plus } from 'lucide-react';
import Dropdown from '@/components/Dropdown';

const BoardView = ({ tasks = [], onTaskClick, onAddTaskClick }) => {
    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return 'bg-red-100 text-red-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Low': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg min-h-[400px] flex space-x-4 overflow-x-auto items-start">
            {['To Do', 'In Progress', 'In Review', 'Done'].map(status => (
                <div key={status} className="w-80 flex-shrink-0 bg-gray-100/50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">{status}</h3>
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </div>
                        <Dropdown
                            trigger={
                                <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded">
                                    <MoreHorizontal size={16} />
                                </button>
                            }
                            items={[
                                { label: 'Sort by Date', action: () => alert('Sort Logic') },
                                { label: 'Move All', action: () => alert('Move All Logic') },
                                { label: 'Clear Tasks', danger: true, action: () => alert('Clear Logic') }
                            ]}
                        />
                    </div>

                    <div className="space-y-3 min-h-[50px]">
                        {tasks.filter(t => t.status === status).map(task => (
                            <div
                                key={task._id}
                                onClick={() => onTaskClick(task)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    {task.assignees && task.assignees.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {task.assignees.filter(u => u).slice(0, 3).map((u, i) => (
                                                <div key={u._id || i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden" title={u.name}>
                                                    {u.avatar ? (
                                                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-gray-500">{u.name?.[0]}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {task.assignees.filter(u => u).length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[9px] text-gray-500 font-bold">
                                                    +{task.assignees.filter(u => u).length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <h4 className="font-medium text-gray-800 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">{task.title}</h4>

                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                                    <div className="flex items-center">
                                        <Calendar size={12} className="mr-1.5" />
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                                    </div>
                                    {task.subtasks && task.subtasks.length > 0 && (
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 mr-1">
                                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                                            </span>
                                            <span>subtasks</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onAddTaskClick}
                        className="w-full mt-3 py-2 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Plus size={16} className="mr-1.5" /> Add Task
                    </button>
                </div>
            ))}
        </div>
    );
};

export default BoardView;
