import React from 'react';
import { Button } from './ui';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">😕</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-6">
                            We're sorry, but an unexpected error occurred. Please try refreshing the page.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>
                            <Button variant="secondary" onClick={() => window.location.href = '/'}>
                                Go Home
                            </Button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg text-left text-xs overflow-auto max-h-48">
                                {this.state.error && this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
