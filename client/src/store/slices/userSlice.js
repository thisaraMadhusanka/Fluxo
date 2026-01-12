import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    users: [],
    loading: false,
    error: null,
};

// Fetch all users
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

// Invite new user
export const inviteUser = createAsyncThunk(
    'users/invite',
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/users/invite', userData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to invite user');
        }
    }
);

// Update user role
export const updateUserRole = createAsyncThunk(
    'users/updateRole',
    async ({ id, role }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/users/${id}/role`, { role });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
        }
    }
);

// Approve user
export const approveUser = createAsyncThunk(
    'users/approve',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/users/${id}/approve`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve user');
        }
    }
);

// Delete user
export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch users
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            // Defensive: Ensure users is always an array
            state.users = Array.isArray(action.payload) ? action.payload : [];
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
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
            state.users = [action.payload.user, ...state.users];
        });
        builder.addCase(inviteUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Update user role
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            const index = state.users.findIndex(u => u._id === action.payload._id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        });

        // Approve user
        builder.addCase(approveUser.fulfilled, (state, action) => {
            const index = state.users.findIndex(u => u._id === action.payload.user._id);
            if (index !== -1) {
                state.users[index] = action.payload.user;
            }
        });

        // Delete user
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.users = state.users.filter(u => u._id !== action.payload);
        });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
