import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppBootstrap } from '@/components/shared/AppBootstrap';
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
import { WinnerDashboard } from '@/features/winners/WinnerDashboard';
import { SubscriptionManagement } from '@/features/subscription/SubscriptionManagement';
import { CheckoutSuccess } from '@/features/subscription/CheckoutSuccess';
import { CheckoutCancel } from '@/features/subscription/CheckoutCancel';

import { AdminRoute } from '@/components/shared/AdminRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { UserManagement } from '@/features/admin/UserManagement';
import { CharityManagement } from '@/features/admin/CharityManagement';
import { DrawManagement } from '@/features/admin/DrawManagement';
import { WinnerManagement } from '@/features/admin/WinnerManagement';

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
          },
          {
            path: 'winnings',
            element: <WinnerDashboard />
          },
          {
            path: 'upgrade',
            element: <SubscriptionManagement />
          },
          {
            path: 'checkout/success',
            element: <CheckoutSuccess />
          },
          {
            path: 'checkout/cancel',
            element: <CheckoutCancel />
          }
        ]
      },
      {
        path: '/admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboard />
              },
              {
                path: 'users',
                element: <UserManagement />
              },
              {
                path: 'charities',
                element: <CharityManagement />
              },
              {
                path: 'draws',
                element: <DrawManagement />
              },
              {
                path: 'winners',
                element: <WinnerManagement />
              }
            ]
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
            <AppBootstrap>
              <RouterProvider router={router} />
            </AppBootstrap>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
