import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../firebase';
import { Music } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const AuthContent = ({ onAuthSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Request YouTube scope to access user's liked videos
      provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
      provider.setCustomParameters({ 'prompt': 'consent' });

      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (error) {
      setError('Error al iniciar sesión con Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-xl">
              <Music size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CloudTune</h1>
          <p className="text-slate-400">Tu plataforma de música en la nube</p>
        </div>

        {/* Tarjeta de autenticación */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Inicia sesión con Google
          </h2>

          {/* Error Message */}
          {error && (
            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Botón Google */}
          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={() => setError('Error al iniciar sesión con Google')}
              text="signin_with"
              theme="dark"
              size="large"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-300">Autenticando...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Al continuar, aceptas los términos de servicio y la política de privacidad</p>
          <p className="mt-2 text-slate-600">Necesitamos acceso a tu cuenta de YouTube para recomendaciones personalizadas</p>
        </div>
      </div>
    </div>
  );
};

const Auth = ({ onAuthSuccess }) => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Error de configuración</p>
          <p className="text-slate-400 mt-2">Por favor, configura REACT_APP_GOOGLE_CLIENT_ID en tu archivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContent onAuthSuccess={onAuthSuccess} />
    </GoogleOAuthProvider>
  );
};

export default Auth;
