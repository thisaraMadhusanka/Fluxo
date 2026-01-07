import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';
import workspaceReducer from './slices/workspaceSlice';
import roleReducer from './slices/roleSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        projects: projectReducer,
        tasks: taskReducer,
        users: userReducer,
        notifications: notificationReducer,
        workspaces: workspaceReducer,
        roles: roleReducer,
    },
});
