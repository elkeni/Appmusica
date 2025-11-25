import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary Component
 * Captura errores de React y muestra UI de fallback
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });

        // Aquí podrías enviar el error a un servicio de logging
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-black">
                    <div className="max-w-md w-full">
                        <div className="bg-gradient-to-br from-red-500/20 to-red-900/20 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-1">
                                        Algo salió mal
                                    </h1>
                                    <p className="text-gray-400 text-sm">
                                        La aplicación encontró un error
                                    </p>
                                </div>
                            </div>

                            <div className="bg-black/30 rounded-xl p-4 mb-6 max-h-40 overflow-auto">
                                <p className="text-red-400 text-sm font-mono break-all">
                                    {this.state.error?.toString()}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 h-12 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Reintentar
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
                                >
                                    Ir al inicio
                                </button>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                <details className="mt-6">
                                    <summary className="text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
                                        Ver detalles técnicos
                                    </summary>
                                    <pre className="mt-3 text-xs text-gray-500 bg-black/30 rounded-lg p-3 overflow-auto max-h-60">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
