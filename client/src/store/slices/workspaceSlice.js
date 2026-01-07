import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null,
};

// Fetch user's workspaces
export const fetchWorkspaces = createAsyncThunk(
    'workspaces/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/workspaces');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspaces');
        }
    }
);

// Create new workspace
export const createWorkspace = createAsyncThunk(
    'workspaces/create',
    async (workspaceData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/workspaces', workspaceData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create workspace');
        }
    }
);

// Join workspace
export const joinWorkspace = createAsyncThunk(
    'workspaces/join',
    async (inviteCode, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/workspaces/join', { inviteCode });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to join workspace');
        }
    }
);

// Switch active workspace
export const switchWorkspace = createAsyncThunk(
    'workspaces/switch',
    async (workspaceId, { rejectWithValue }) => {
        try {
            // Optimistically update local state or verify with backend
            await api.post('/workspaces/switch', { workspaceId });
            return workspaceId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to switch workspace');
        }
    }
);

// Invite member to workspace
export const inviteMember = createAsyncThunk(
    'workspaces/inviteMember',
    async (inviteData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/workspaces/invite', inviteData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to invite member');
        }
    }
);

// Delete workspace
export const deleteWorkspace = createAsyncThunk(
    'workspaces/delete',
    async (workspaceId, { rejectWithValue, getState }) => {
        try {
            await api.delete(`/workspaces/${workspaceId}`);
            return workspaceId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete workspace');
        }
    }
);

const workspaceSlice = createSlice({
    name: 'workspaces',
    initialState: {
        workspaces: [],
        currentWorkspace: JSON.parse(localStorage.getItem('currentWorkspace')) || null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentWorkspace: (state, action) => {
            const workspace = state.workspaces.find(w => w._id === action.payload) || null;
            state.currentWorkspace = workspace;
            if (workspace) {
                localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
            } else {
                localStorage.removeItem('currentWorkspace');
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch All
        builder.addCase(fetchWorkspaces.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
            state.loading = false;
            state.workspaces = action.payload;
            // If no current workspace, set first one
            if (!state.currentWorkspace && action.payload.length > 0) {
                state.currentWorkspace = action.payload[0];
                localStorage.setItem('currentWorkspace', JSON.stringify(action.payload[0]));
            }
        });
        builder.addCase(fetchWorkspaces.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Delete Workspace
        builder.addCase(deleteWorkspace.fulfilled, (state, action) => {
            state.workspaces = state.workspaces.filter(w => w._id !== action.payload);

            // If deleted workspace was active, switch to another
            if (state.currentWorkspace?._id === action.payload) {
                // Prefer private workspace first, then any other available
                const privateWorkspace = state.workspaces.find(w => w.isPrivate);
                const nextWorkspace = privateWorkspace || state.workspaces[0] || null;

                state.currentWorkspace = nextWorkspace;
                if (nextWorkspace) {
                    localStorage.setItem('currentWorkspace', JSON.stringify(nextWorkspace));
                } else {
                    localStorage.removeItem('currentWorkspace');
                }
            }
        });


        // Create
        builder.addCase(createWorkspace.fulfilled, (state, action) => {
            state.workspaces.push(action.payload.workspace);
            state.currentWorkspace = action.payload.workspace;
            localStorage.setItem('currentWorkspace', JSON.stringify(action.payload.workspace));
        });

        // Join
        builder.addCase(joinWorkspace.fulfilled, (state, action) => {
            state.workspaces.push(action.payload.workspace);
            state.currentWorkspace = action.payload.workspace;
            localStorage.setItem('currentWorkspace', JSON.stringify(action.payload.workspace));
        });

        // Switch
        builder.addCase(switchWorkspace.fulfilled, (state, action) => {
            const workspace = state.workspaces.find(w => w._id === action.payload) || state.currentWorkspace;
            state.currentWorkspace = workspace;
            if (workspace) {
                localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
            }
        });
    }
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
