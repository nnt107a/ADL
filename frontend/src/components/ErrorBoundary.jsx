import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section section-alt" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container state-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <h2 className="state-label" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0c2839' }}>
              Something went wrong
            </h2>
            <p className="state-copy" style={{ marginBottom: '1.5rem' }}>
              An unexpected display error occurred. Please refresh the page or try again.
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                backgroundColor: '#0c2839',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
