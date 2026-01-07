import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarOpen: true,
    theme: 'light', // or 'dark'
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
    },
});

export const { toggleSidebar, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
