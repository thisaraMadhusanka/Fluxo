import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async ({ limit = 20, unreadOnly = false }, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/notifications?limit=${limit}&unreadOnly=${unreadOnly}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

// Mark as read
export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/notifications/${id}/read`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
        }
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.put('/notifications/read-all');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
        }
    }
);

//Delete notification
export const deleteNotification = createAsyncThunk(
    'notifications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
        }
    }
);

// Clear all notifications
export const clearAllNotifications = createAsyncThunk(
    'notifications/clearAll',
    async (_, { rejectWithValue }) => {
        try {
            await api.delete('/notifications/delete-all');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        // Fetch notifications
        builder.addCase(fetchNotifications.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.loading = false;
            // Defensive check: ensure notifications is an array
            state.notifications = Array.isArray(action.payload?.notifications)
                ? action.payload.notifications
                : [];
            state.unreadCount = action.payload?.unreadCount || 0;
        });
        builder.addCase(fetchNotifications.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            // Keep existing notifications instead of clearing
            console.error('Failed to fetch notifications:', action.payload);
        });

        // Mark as read
        builder.addCase(markAsRead.fulfilled, (state, action) => {
            const index = state.notifications.findIndex(n => n._id === action.payload._id);
            if (index !== -1) {
                state.notifications[index] = action.payload;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        });

        // Mark all as read
        builder.addCase(markAllAsRead.fulfilled, (state) => {
            // Defensive check before .map()
            if (Array.isArray(state.notifications)) {
                state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
            }
            state.unreadCount = 0;
        });

        // Delete notification
        builder.addCase(deleteNotification.fulfilled, (state, action) => {
            // Defensive check before .filter()
            if (Array.isArray(state.notifications)) {
                state.notifications = state.notifications.filter(n => n._id !== action.payload);
            }
            // Recalculate unread count if we deleted an unread one
            // Ideally backend returns count, but we can approximate or refetch
        });

        // Clear all notifications
        builder.addCase(clearAllNotifications.fulfilled, (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        });
    },
});

export const { clearError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
