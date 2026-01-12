import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    users: [], // Workspace-scoped users
    adminUsers: [], // Global system users for Admin Dashboard
    loading: false,
    error: null,
};

// ... (existing thunks) ...

// Fetch all users (Workspace Scoped)
export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/users');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Fetch ALL users (Admin)
export const fetchAllSystemUsers = createAsyncThunk(
    'users/fetchAllSystem',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/users/admin/all');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

// ... (existing exports) ...

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch users (Workspace)
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch System Users (Admin)
        builder.addCase(fetchAllSystemUsers.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllSystemUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.adminUsers = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchAllSystemUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Invite user
        builder.addCase(inviteUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(inviteUser.fulfilled, (state, action) => {
            state.loading = false;
            state.users = [action.payload.user, ...state.users]; // Add to workspace list
            state.adminUsers = [action.payload.user, ...state.adminUsers]; // Add to admin list too
        });
        builder.addCase(inviteUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Update user role
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            // Update in workspace list
            const index = state.users.findIndex(u => u._id === action.payload._id);
            if (index !== -1) state.users[index] = action.payload;

            // Update in admin list
            const adminIndex = state.adminUsers.findIndex(u => u._id === action.payload._id);
            if (adminIndex !== -1) state.adminUsers[adminIndex] = action.payload;
        });

        // Approve user
        builder.addCase(approveUser.fulfilled, (state, action) => {
            // Update in workspace list
            const index = state.users.findIndex(u => u._id === action.payload.user._id);
            if (index !== -1) state.users[index] = action.payload.user;

            // Update in admin list (Crucial for Dashboard)
            const adminIndex = state.adminUsers.findIndex(u => u._id === action.payload.user._id);
            if (adminIndex !== -1) state.adminUsers[adminIndex] = action.payload.user;
        });

        // Delete user
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.users = state.users.filter(u => u._id !== action.payload);
            state.adminUsers = state.adminUsers.filter(u => u._id !== action.payload);
        });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
