import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../firebase';
import { Music } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContent = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      // const decoded = jwtDecode(credentialResponse.credential);
      const provider = new GoogleAuthProvider();

      // Usar signInWithPopup con Google
      // const result = await signInWithPopup(auth, provider);
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
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isNewUser ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h2>

          {/* Botón Google */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={() => setError('Error al iniciar sesión con Google')}
              text={isNewUser ? 'signup_with' : 'signin_with'}
              theme="dark"
              size="large"
            />
          </div>

          {/* Divisor */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">O continúa con email</span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
              />
            </div>

            {/* Recordarme */}
            {!isNewUser && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 accent-pink-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-400">Recuérdame</span>
              </label>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? 'Procesando...' : isNewUser ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Toggle entre login y registro */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isNewUser ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setIsNewUser(!isNewUser);
                  setError(null);
                  setEmail('');
                  setPassword('');
                }}
                className="text-pink-500 hover:text-pink-400 font-semibold transition-colors"
              >
                {isNewUser ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Al continuar, aceptas los términos de servicio y la política de privacidad</p>
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
