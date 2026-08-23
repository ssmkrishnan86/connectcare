import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { LocalizationProvider } from '@/features/localization/context/LocalizationContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocalizationProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </LocalizationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};

