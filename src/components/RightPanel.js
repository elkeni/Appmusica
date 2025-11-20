import React, { useState, useEffect } from 'react';
import { ListMusic, Mic2 } from 'lucide-react';
import LyricsView from './LyricsView';
import { fetchLyrics } from '../services/lyricsService';
import { parseLRC } from '../utils/lrcParser';

export default function RightPanel({ currentTrack = null, upNext = [], onPlay = () => { }, playItem = null, currentTime = 0, isPlaying = false, prevTrack = () => {}, nextTrack = () => {}, togglePlayPause = () => {} }) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'lyrics'
  const [lyrics, setLyrics] = useState([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState(null);

  useEffect(() => {
    if (currentTrack && activeTab === 'lyrics') {
      const loadLyrics = async () => {
        setIsLoadingLyrics(true);
        setLyricsError(null);
        setLyrics([]);

        try {
          const data = await fetchLyrics(
            currentTrack.title,
            currentTrack.artist || currentTrack.originalData?.artist || '',
            currentTrack.album || '',
            currentTrack.duration || 0
          );

          if (data && data.syncedLyrics) {
            setLyrics(parseLRC(data.syncedLyrics));
          } else if (data && data.plainLyrics) {
            // Fallback to plain lyrics if no synced
            setLyrics([{ time: 0, text: data.plainLyrics }]);
          } else {
            setLyricsError('Lyrics not found');
          }
        } catch (err) {
          setLyricsError('Failed to load lyrics');
        } finally {
          setIsLoadingLyrics(false);
        }
      };
      loadLyrics();
    }
  }, [currentTrack, activeTab]);
  return (
    <aside className="hidden md:flex flex-col w-96 min-w-[320px] max-w-[420px] glass-fluid-strong rounded-3xl m-6 ml-0 shadow-2xl border border-white/10 overflow-hidden">
      <div className="p-8 pb-4 border-b border-white/10">
        <h3 className="text-lg font-extrabold text-slate-800 mb-2 flex items-center gap-2 tracking-tight font-display">Now Playing</h3>
        {currentTrack ? (
          <>
            <div className="rounded-2xl overflow-hidden shadow-xl mb-4 aspect-square w-full bg-slate-200 group">
              <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-bold text-2xl text-slate-900 truncate mb-1">{currentTrack.title}</h4>
            <p className="text-slate-500 text-base mb-4 truncate">{currentTrack.originalData?.snippet?.channelTitle || ''}</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <p className="font-semibold">No song playing</p>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center justify-center p-2 mx-6 mb-2 bg-black/20 rounded-xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'queue' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ListMusic size={16} /> Up Next
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'lyrics' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Mic2 size={16} /> Lyrics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative">
          {activeTab === 'queue' ? (
            <div className="p-6 pt-2">
              <ul className="space-y-2">
                {upNext.slice(0, 20).map((item, idx) => {
                  const keyId = item?.id || item?.videoId || item?.deezerId || idx;
                  const title = item?.snippet?.title || item?.title || item?.name || 'Unknown';
                  const artist = item?.snippet?.channelTitle || item?.artist || item?.originalData?.artist || '';
                  const thumb = item?.snippet?.thumbnails?.default?.url || item?.cover || item?.image || item?.thumbnail || '';
                  const handlePlay = () => {
                    if (typeof playItem === 'function') return playItem(item);
                    if (typeof onPlay === 'function') return onPlay(item);
                  };

                  return (
                    <li key={keyId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group" onClick={handlePlay}>
                      <img src={thumb} alt={title} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-white">{title}</p>
                        <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">{artist}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <LyricsView
              lyrics={lyrics}
              currentTime={currentTime}
              isLoading={isLoadingLyrics}
              error={lyricsError}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
