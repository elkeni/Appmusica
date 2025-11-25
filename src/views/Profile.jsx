import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Heart, Music, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/useAnimations';
import { FadeInContainer, SlideInContainer, StaggerContainer } from '../components/shared';

export default function Profile() {
    const navigate = useNavigate();
    const { user, favorites, playlists, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');

    usePageTransition();

    const handleSave = async () => {
        // Save profile logic here
        setIsEditing(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const stats = [
        { icon: Heart, label: 'Favoritos', value: favorites?.length || 0, color: 'text-red-500' },
        { icon: Music, label: 'Playlists', value: playlists?.length || 0, color: 'text-green-500' },
        { icon: Calendar, label: 'Días activo', value: calculateDaysActive(user?.metadata?.creationTime), color: 'text-blue-500' },
    ];

    return (
        <div className="min-h-screen p-6 md:p-12">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <X size={20} />
                    <span>Volver</span>
                </button>

                {/* Profile Card */}
                <FadeInContainer delay={0.1}>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Profile Picture */}
                            <div className="relative">
                                <img
                                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&size=160&background=1DB954&color=fff&bold=true`}
                                    alt="Profile"
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-green-500/30 shadow-xl"
                                />
                                <button className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg">
                                    <Edit2 size={16} className="text-black" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="text-3xl md:text-4xl font-bold bg-white/10 rounded-lg px-4 py-2 border border-white/20 focus:border-green-500 focus:outline-none"
                                            placeholder="Tu nombre"
                                        />
                                    ) : (
                                        <h1 className="text-3xl md:text-4xl font-bold">
                                            {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                                        </h1>
                                    )}
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                                            >
                                                <Save size={14} className="text-black" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setDisplayName(user?.displayName || '');
                                                }}
                                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 text-gray-400">
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <Mail size={16} />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <User size={16} />
                                        <span className="text-sm">Miembro desde {formatDate(user?.metadata?.creationTime)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeInContainer>

                {/* Stats Grid */}
                <StaggerContainer staggerDelay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-gray-400">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </StaggerContainer>

                {/* Recent Activity */}
                <SlideInContainer direction="up" delay={0.4}>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Music size={20} className="text-green-500" />
                            Actividad Reciente
                        </h2>
                        <div className="space-y-3">
                            {favorites?.slice(0, 5).map((track, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <img
                                        src={track.image || track.cover}
                                        alt={track.title}
                                        className="w-12 h-12 rounded object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{track.title}</p>
                                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                                    </div>
                                    <Heart size={16} className="text-red-500" fill="currentColor" />
                                </div>
                            ))}
                            {(!favorites || favorites.length === 0) && (
                                <p className="text-center text-gray-400 py-8">
                                    Aún no tienes favoritos. ¡Empieza a explorar música!
                                </p>
                            )}
                        </div>
                    </div>
                </SlideInContainer>

                {/* Settings */}
                <FadeInContainer delay={0.5}>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold mb-4">Configuración</h2>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between">
                                <span>Preferencias de reproducción</span>
                                <span className="text-gray-400 text-sm">→</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between">
                                <span>Notificaciones</span>
                                <span className="text-gray-400 text-sm">→</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between">
                                <span>Privacidad</span>
                                <span className="text-gray-400 text-sm">→</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </FadeInContainer>
            </div>
        </div>
    );
}

function formatDate(timestamp) {
    if (!timestamp) return 'Recientemente';
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function calculateDaysActive(creationTime) {
    if (!creationTime) return 0;
    const created = new Date(creationTime);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
