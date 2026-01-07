import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTask } from '@/store/slices/taskSlice';
import KanbanColumn from './KanbanColumn';
import TaskModal from '@/components/TaskModal';

const columnsOrder = [
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'In Review', title: 'In Review' },
    { id: 'Done', title: 'Done' }
];


const KanbanBoard = ({ onTaskClick }) => {
    const dispatch = useDispatch();
    const { tasks: reduxTasks, loading } = useSelector(state => state.tasks);
    const [localTasks, setLocalTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState('To Do');

    // Sync local tasks with redux tasks
    useEffect(() => {
        setLocalTasks(reduxTasks || []);
    }, [reduxTasks]);

    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic update
        const updatedTasks = [...localTasks];
        const taskIndex = updatedTasks.findIndex(t => t._id === draggableId);
        if (taskIndex !== -1) {
            const updatedTask = { ...updatedTasks[taskIndex], status: destination.droppableId };
            updatedTasks[taskIndex] = updatedTask;
            setLocalTasks(updatedTasks);
        }

        // Update task status via Redux
        try {
            await dispatch(updateTask({
                taskId: draggableId,
                updates: { status: destination.droppableId }
            })).unwrap();
        } catch (error) {
            console.error("Failed to update task status");
            // Revert on failure
            setLocalTasks(reduxTasks);
        }
    };

    const handleAddTaskClick = (status) => {
        setTargetStatus(status);
        setIsModalOpen(true);
    };

    const handleTaskCreated = () => {
        // Refresh tasks from Redux after creation
        dispatch(fetchTasks());
    };

    return (
        <div className="h-full overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full min-h-[500px]">
                    {columnsOrder.map(col => {
                        const colTasks = localTasks.filter(t => t.status === col.id);
                        return (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                tasks={colTasks}
                                onAddTask={() => handleAddTaskClick(col.id)}
                                onEditTask={onTaskClick}
                            />
                        );
                    })}
                </div>
            </DragDropContext>
            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode="create"
                    initialStatus={targetStatus}
                    onUpdate={() => {
                        dispatch(fetchTasks());
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default KanbanBoard;
