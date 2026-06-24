import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const ErrorPage = () => {
  const error = useRouteError();
  
  let title = 'Oops!';
  let message = 'Sorry, an unexpected error has occurred.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = '404 - Page Not Found';
      message = "The page you're looking for doesn't exist or has been moved.";
    } else {
      title = `${error.status} Error`;
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center w-full bg-gray-900 text-text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
