import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { PageError } from './PageError';

/**
 * Error component for React Router's errorElement prop
 * Handles routing errors and displays them using PageError component
 */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let message = 'Something went wrong';
  let description = 'An unexpected error occurred';

  // Handle different types of errors
  if (isRouteErrorResponse(error)) {
    // This is a response error (404, 500, etc.)
    message = `${error.status} ${error.statusText}`;
    description = error.data?.message || error.data || 'Page not found';
  } else if (error instanceof Error) {
    // This is a regular JavaScript error
    message = error.name || 'Error';
    description = error.message;
  } else if (typeof error === 'string') {
    description = error;
  }

  const handleRetry = () => {
    // Navigate to home page on retry
    navigate('/');
  };

  return <PageError description={description} message={message} onRetry={handleRetry} />;
}
