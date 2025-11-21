export const getItemId = (item) => {
    if (!item) return Math.random().toString(36).slice(2);
    if (item?.stationuuid) return item.stationuuid;
    if (item?.deezerId) return `deezer_${item.deezerId}`;
    if (item?.id?.videoId) return item.id.videoId;
    if (item?.videoId) return item.videoId;
    if (item?.id) return String(item.id);
    if (item?.snippet?.title) return item.snippet.title + Math.random().toString(36).slice(2, 6);
    if (item?.title) return item.title + Math.random().toString(36).slice(2, 6);
    return Math.random().toString(36).slice(2);
};

export const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const getImageUrl = (item) => {
    if (!item) return 'https://placehold.co/300x300/1e293b/ffffff?text=Music';
    return item.image || item.coverBig || item.cover || item.picture_medium || item.picture_xl || 'https://placehold.co/300x300/1e293b/ffffff?text=Music';
};

export const getThumbnail = (item) => {
    if (!item) return 'https://placehold.co/300x300/1e293b/ffffff?text=Music';
    if (item?.coverBig) return item.coverBig;
    if (item?.cover) return item.cover;
    if (item?.image) return item.image;
    if (item?.snippet?.thumbnails?.high?.url) return item.snippet.thumbnails.high.url;
    if (item?.snippet?.thumbnails?.medium?.url) return item.snippet.thumbnails.medium.url;
    if (item?.snippet?.thumbnails?.default?.url) return item.snippet.thumbnails.default.url;
    return 'https://placehold.co/300x300/1e293b/ffffff?text=Music';
};

