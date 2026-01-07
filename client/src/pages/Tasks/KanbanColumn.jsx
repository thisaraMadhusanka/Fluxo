import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ column, tasks = [], onAddTask, onEditTask }) => {
    return (
        <div className="min-w-[280px] w-[280px] flex flex-col h-full mx-2">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-gray-700 flex items-center">
                    {column.title}
                    <span className="ml-2 bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full">{tasks.length}</span>
                </h3>
                <button
                    onClick={() => onAddTask && onAddTask(column.id)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>

            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 rounded-xl p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-gray-50/50'}`}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard key={task._id} task={task} index={index} onEdit={onEditTask} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;
