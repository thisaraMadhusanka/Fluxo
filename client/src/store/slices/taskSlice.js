import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
};

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/tasks');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
        }
    }
);

// Fetch tasks by project
export const fetchTasksByProject = createAsyncThunk(
    'tasks/fetchByProject',
    async (projectId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/projects/${projectId}/tasks`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
        }
    }
);

// Create task
export const createTask = createAsyncThunk(
    'tasks/create',
    async (taskData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/tasks', taskData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create task');
        }
    }
);

// Update task
export const updateTask = createAsyncThunk(
    'tasks/update',
    async ({ taskId, updates }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/tasks/${taskId}`, updates);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task');
        }
    }
);

// Delete task
export const deleteTask = createAsyncThunk(
    'tasks/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/tasks/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
        }
    }
);

// Toggle task completion
export const toggleTaskComplete = createAsyncThunk(
    'tasks/toggleComplete',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/tasks/${id}/complete`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle task');
        }
    }
);

// Add subtask
export const addSubtask = createAsyncThunk(
    'tasks/addSubtask',
    async ({ taskId, title }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add subtask');
        }
    }
);

// Toggle subtask
export const toggleSubtask = createAsyncThunk(
    'tasks/toggleSubtask',
    async ({ taskId, subtaskId }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle subtask');
        }
    }
);

// Delete subtask
export const deleteSubtask = createAsyncThunk(
    'tasks/deleteSubtask',
    async ({ taskId, subtaskId }, { rejectWithValue }) => {
        try {
            const { data } = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subtask');
        }
    }
);

// Start timer
export const startTimer = createAsyncThunk(
    'tasks/startTimer',
    async (taskId, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/tasks/${taskId}/start-timer`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to start timer');
        }
    }
);

// Stop timer
export const stopTimer = createAsyncThunk(
    'tasks/stopTimer',
    async (taskId, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/tasks/${taskId}/stop-timer`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to stop timer');
        }
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentTask: (state, action) => {
            state.currentTask = action.payload;
        },
        clearTasks: (state) => {
            state.tasks = [];
        }
    },
    extraReducers: (builder) => {
        // Fetch all tasks
        builder.addCase(fetchTasks.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTasks.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
        });
        builder.addCase(fetchTasks.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch tasks by project
        builder.addCase(fetchTasksByProject.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTasksByProject.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
        });
        builder.addCase(fetchTasksByProject.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Create task
        builder.addCase(createTask.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createTask.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks.unshift(action.payload);
        });
        builder.addCase(createTask.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Update task
        builder.addCase(updateTask.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });

        // Delete task
        builder.addCase(deleteTask.fulfilled, (state, action) => {
            state.tasks = state.tasks.filter(t => t._id !== action.payload);
        });

        // Toggle complete
        builder.addCase(toggleTaskComplete.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });

        // Subtasks
        builder.addCase(addSubtask.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });
        builder.addCase(toggleSubtask.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });
        builder.addCase(deleteSubtask.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });

        // Timer
        builder.addCase(startTimer.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });
        builder.addCase(stopTimer.fulfilled, (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        });
    },
});

export const { clearError, setCurrentTask, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
