import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/useAnimations';
import { FadeInContainer } from '../components/shared';

// Sample data matching the design
const recentlyPlaysData = [
    { id: 1, title: 'Music of the Spheres', artist: 'Coldplay', image: 'https://i.scdn.co/image/ab67616d0000b2732d0705ff38f7813ace4bd99d' },
    { id: 2, title: 'Native', artist: 'OneRepublic', image: 'https://i.scdn.co/image/ab67616d0000b273dd2a8b5f1fa67e90b7e1e754' },
    { id: 3, title: 'Evolve', artist: 'Imagine Dragons', image: 'https://i.scdn.co/image/ab67616d0000b273da6f73a25f4c79d0e6b4a8bd' },
    { id: 4, title: 'Starboy', artist: 'The Weeknd', image: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' },
];

const trendingData = [
    { id: 't1', title: 'Rodrigo', artist: 'Trolaz Olivia', duration: '3:48', image: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' },
    { id: 't2', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', image: 'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856' },
    { id: 't3', title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', duration: '3:23', image: 'https://i.scdn.co/image/ab67616d0000b273be841ba4bc24340152e3a79a' },
    { id: 't4', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', image: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' },
    { id: 't5', title: 'Higher Power', artist: 'Coldplay', duration: '3:29', image: 'https://i.scdn.co/image/ab67616d0000b2732d0705ff38f7813ace4bd99d' },
];

const topPlaylistsData = [
    { id: 'p1', title: 'LO-FI Beats', description: 'Chill vibes for work and study', image: 'https://i.scdn.co/image/ab67706f00000002739dd68675c94f3dc0fd2326' },
    { id: 'p2', title: '90s Rock', description: 'Best rock hits from the 90s', image: 'https://i.scdn.co/image/ab67706f00000002d073e656e546e43bc387ad79' },
    { id: 'p3', title: 'Pop Hits', description: 'Top pop songs right now', image: 'https://i.scdn.co/image/ab67706f00000002f0a25cf8f426309572e125cb' },
    { id: 'p4', title: 'Workout Mix', description: 'High energy tracks', image: 'https://i.scdn.co/image/ab67706f00000002d3c9b2ca6d62d9b7e90fc3b2' },
];

export default function Home() {
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const { user } = useAuth();
    
    usePageTransition();
    
    const [heroItems] = useState(recentlyPlaysData);
    const [trending] = useState(trendingData);
    const [recommended] = useState(topPlaylistsData);
    const [loading] = useState(false);

    if (loading) {
        return (
            <div className="px-4 md:px-8 py-6 space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-48 rounded animate-pulse" style={{ backgroundColor: '#262d3d' }} />
                    <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: '#262d3d' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-6 space-y-8 page-transition">
            {/* Header with Search */}
            <FadeInContainer delay={0.1}>
                <header className="flex items-center justify-between">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for songs, artists, albums..."
                                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 transition-all"
                                style={{ 
                                    backgroundColor: '#262d3d',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                onClick={() => navigate('/search')}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="ml-4 w-10 h-10 rounded-full overflow-hidden transition-all"
                        style={{ border: '2px solid rgba(255, 255, 255, 0.1)' }}
                    >
                        <img
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=5edb5e&color=fff`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </header>
            </FadeInContainer>

            {/* Recently Plays */}
            <FadeInContainer delay={0.2}>
                <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>Recently plays</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                        {heroItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0 cursor-pointer group"
                                style={{ width: '200px' }}
                                onClick={() => playItem(item, heroItems)}
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden mb-3" style={{ backgroundColor: '#262d3d' }}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: '#5edb5e' }}>
                                            <Play size={24} className="text-black ml-1" fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-white text-sm mb-1 truncate">{item.title}</h3>
                                <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{item.artist}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeInContainer>

            {/* Trending */}
            <FadeInContainer delay={0.3}>
                <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>Trending</h2>
                    <div className="space-y-2">
                        {trending.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 rounded-lg cursor-pointer group transition-all"
                                style={{ backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#262d3d'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                onClick={() => playItem(item, trending)}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-14 h-14 rounded-lg object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <Play size={20} className="text-white" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-sm truncate">{item.title}</h3>
                                    <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{item.artist}</p>
                                </div>
                                <span className="text-sm" style={{ color: '#9ca3af' }}>{item.duration}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeInContainer>

            {/* Top Playlists */}
            <FadeInContainer delay={0.4}>
                <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>Top playlists for you</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {recommended.map((item) => (
                            <div
                                key={item.id}
                                className="cursor-pointer group"
                                onClick={() => navigate('/library')}
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden mb-3" style={{ backgroundColor: '#262d3d' }}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: '#5edb5e' }}>
                                            <Play size={24} className="text-black ml-1" fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-white text-sm mb-1 truncate">{item.title}</h3>
                                <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeInContainer>
        </div>
    );
}


