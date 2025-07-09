import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#191919',
          color: '#cccccc',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #cc4444',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{color: '#cc4444', marginBottom: '16px'}}>
              ⚠️ Something went wrong
            </h2>
            <p style={{marginBottom: '16px'}}>
              The calculator encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4a7c59',
                border: '1px solid #6b9b7a',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              🔄 Refresh Page
            </button>
            {this.state.error && (
              <details style={{marginTop: '16px', textAlign: 'left'}}>
                <summary style={{cursor: 'pointer', color: '#999999'}}>
                  Technical Details
                </summary>
                <pre style={{
                  backgroundColor: '#1a1a1a',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  overflow: 'auto',
                  marginTop: '8px'
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
