import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
    projects: [], // Changed from items to projects to match selector usage in other files
    currentProject: null,
    loading: false,
    error: null,
};

// Fetch all projects for workspace
export const fetchProjects = createAsyncThunk(
    'projects/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { currentWorkspace } = getState().workspaces;
            if (!currentWorkspace) return [];

            // The API interceptor attaches the workspace ID, so we just hit the endpoint
            const { data } = await api.get('/projects');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
        }
    }
);

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projects = Array.isArray(action.payload) ? action.payload : [];
        },
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        clearProjects: (state) => {
            state.projects = [];
            state.currentProject = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setProjects, setCurrentProject, clearProjects } = projectSlice.actions;
export default projectSlice.reducer;
