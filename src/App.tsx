import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorPage } from '@/components/shared/ErrorPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { PublicRoute } from '@/components/shared/PublicRoute';
import { Login } from '@/features/auth/Login';
import { Signup } from '@/features/auth/Signup';
import { ForgotPassword } from '@/features/auth/ForgotPassword';
import { ScoreManagement } from '@/features/score/ScoreManagement';

import { SubscriberDashboard } from '@/features/dashboard/SubscriberDashboard';
import { CharitySelection } from '@/features/charity/CharitySelection';

// Use createBrowserRouter for data router API support (errorElement)
const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <SubscriberDashboard />
          },
          {
            path: 'dashboard',
            element: <SubscriberDashboard />
          },
          {
            path: 'scores',
            element: <ScoreManagement />
          },
          {
            path: 'scores/add',
            element: <ScoreManagement />
          },
          {
            path: 'charities',
            element: <CharitySelection />
          }
        ]
      }
    ]
  },
  {
    element: <PublicRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/signup', element: <Signup /> },
          { path: '/forgot-password', element: <ForgotPassword /> },
        ]
      }
    ]
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
