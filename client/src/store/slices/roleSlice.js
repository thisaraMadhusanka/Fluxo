import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    roles: [],
    loading: false,
    error: null,
};

// Fetch roles for a workspace
export const fetchRoles = createAsyncThunk(
    'roles/fetchRoles',
    async (workspaceId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/roles`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
        }
    }
);

// Create a new role
export const createRole = createAsyncThunk(
    'roles/createRole',
    async ({ workspaceId, roleData }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/roles`, roleData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create role');
        }
    }
);

// Update a role
export const updateRole = createAsyncThunk(
    'roles/updateRole',
    async ({ workspaceId, roleId, roleData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/workspaces/${workspaceId}/roles/${roleId}`, roleData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update role');
        }
    }
);

// Delete a role
export const deleteRole = createAsyncThunk(
    'roles/deleteRole',
    async ({ workspaceId, roleId }, { rejectWithValue }) => {
        try {
            await api.delete(`/workspaces/${workspaceId}/roles/${roleId}`);
            return roleId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete role');
        }
    }
);

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Roles
        builder.addCase(fetchRoles.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchRoles.fulfilled, (state, action) => {
            state.loading = false;
            state.roles = action.payload;
        });
        builder.addCase(fetchRoles.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Create Role
        builder.addCase(createRole.fulfilled, (state, action) => {
            state.roles.push(action.payload);
        });

        // Update Role
        builder.addCase(updateRole.fulfilled, (state, action) => {
            const index = state.roles.findIndex(r => r._id === action.payload._id);
            if (index !== -1) {
                state.roles[index] = action.payload;
            }
        });

        // Delete Role
        builder.addCase(deleteRole.fulfilled, (state, action) => {
            state.roles = state.roles.filter(r => r._id !== action.payload);
        });
    }
});

export const { clearError } = roleSlice.actions;
export default roleSlice.reducer;
