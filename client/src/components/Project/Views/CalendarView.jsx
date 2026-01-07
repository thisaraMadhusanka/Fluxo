import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = ({ tasks = [], onTaskClick }) => {
    // Map tasks to calendar events
    const events = tasks.map(task => ({
        id: task._id,
        title: task.title,
        start: new Date(task.dueDate), // Assuming dueDate is the "event" day
        end: new Date(task.dueDate),
        allDay: true,
        resource: task
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day']}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: event.resource.priority === 'High' || event.resource.priority === 'Urgent' ? '#ef4444' : event.resource.priority === 'Medium' ? '#f59e0b' : '#3b82f6',
                        borderRadius: '4px',
                        opacity: 1,
                        color: 'white',
                        border: '0px',
                        display: 'block',
                        fontSize: '0.85rem'
                    }
                })}
                onSelectEvent={(event) => onTaskClick(event.resource)}
            />
        </div>
    );
};

export default CalendarView;
