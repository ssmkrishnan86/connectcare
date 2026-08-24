import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
  searchQuery: string;
  notificationsCount: number;
  messagesCount: number;
}

const initialState: UiState = {
  sidebarOpen: true,
  activeModal: null,
  searchQuery: '',
  notificationsCount: 0,
  messagesCount: 0,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setNotificationsCount: (state, action: PayloadAction<number>) => {
      state.notificationsCount = action.payload;
    },
    setMessagesCount: (state, action: PayloadAction<number>) => {
      state.messagesCount = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  setSearchQuery,
  setNotificationsCount,
  setMessagesCount,
} = uiSlice.actions;

export default uiSlice.reducer;
