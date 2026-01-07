import React, { useState } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

const GanttView = ({ tasks = [], onTaskClick }) => {
    const [viewMode, setViewMode] = useState(ViewMode.Day);

    // Transform tasks to Gantt format
    const ganttTasks = tasks
        .filter(t => t.startDate || t.dueDate || t.createdAt) // Only tasks with some date info
        .map(task => {
            const startDate = task.startDate ? new Date(task.startDate) : (task.createdAt ? new Date(task.createdAt) : new Date());
            let endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate);

            // Gantt requires end date > start date
            if (endDate <= startDate) {
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
            }

            return {
                start: startDate,
                end: endDate,
                name: task.title,
                id: task._id,
                type: 'task',
                progress: task.status === 'Done' ? 100 : task.status === 'In Progress' ? 50 : 0,
                isDisabled: false,
                styles: { progressColor: '#3b82f6', progressSelectedColor: '#2563eb' }
            };
        });

    // If no tasks, show placeholder or the Gantt will crash
    if (ganttTasks.length === 0) {
        return <div className="p-8 text-center text-gray-400">No tasks to display</div>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="mb-4 flex justify-end space-x-2">
                <button onClick={() => setViewMode(ViewMode.Day)} className={`px-3 py-1 text-sm rounded ${viewMode === ViewMode.Day ? 'bg-primary text-white' : 'bg-gray-100'}`}>Day</button>
                <button onClick={() => setViewMode(ViewMode.Week)} className={`px-3 py-1 text-sm rounded ${viewMode === ViewMode.Week ? 'bg-primary text-white' : 'bg-gray-100'}`}>Week</button>
                <button onClick={() => setViewMode(ViewMode.Month)} className={`px-3 py-1 text-sm rounded ${viewMode === ViewMode.Month ? 'bg-primary text-white' : 'bg-gray-100'}`}>Month</button>
            </div>
            <div className="overflow-x-auto">
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    columnWidth={60}
                    listCellWidth="155px"
                    barBackgroundColor="#e5e7eb"
                    rowHeight={50}
                    fontSize={12}
                    onSelect={(task) => {
                        const projectTask = tasks.find(t => t._id === task.id);
                        if (projectTask) onTaskClick(projectTask);
                    }}
                    onClick={(task) => {
                        const projectTask = tasks.find(t => t._id === task.id);
                        if (projectTask) onTaskClick(projectTask);
                    }}
                />
            </div>
        </div>
    );
};

export default GanttView;
