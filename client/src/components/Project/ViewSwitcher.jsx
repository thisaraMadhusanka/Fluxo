import React from 'react';
import {
    Table, KanbanSquare, Calendar, GanttChart, ListTodo, Plus, BarChart2, Users
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const views = [
    { id: 'table', name: 'Table', icon: Table },
    { id: 'board', name: 'Board', icon: KanbanSquare },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'gantt', name: 'Gantt', icon: GanttChart },
    { id: 'analytics', name: 'Analytics', icon: BarChart2 },
    { id: 'team', name: 'Team', icon: Users },
];

const ViewSwitcher = ({ currentView, onViewChange, onAddView }) => {
    return (
        <div className="flex items-center space-x-2 pb-1 overflow-x-auto">
            {views.map((view) => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={clsx(
                        "flex items-center px-3 py-2 rounded-t-lg transition-colors relative min-w-max",
                        currentView === view.id
                            ? "text-primary font-medium"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    )}
                >
                    <view.icon size={16} className="mr-2" />
                    {view.name}
                    {currentView === view.id && (
                        <motion.div
                            layoutId="activeViewTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                    )}
                </button>
            ))}


        </div>
    );
};

export default ViewSwitcher;
