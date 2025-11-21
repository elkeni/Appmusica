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

/**
 * Format date in Spanish format
 * Example: "21 de noviembre de 2025"
 */
export const formatDateSpanish = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} de ${month} de ${year}`;
};

/**
 * Format date in short Spanish format
 * Example: "21 nov 2025"
 */
export const formatDateShortSpanish = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const monthsShort = [
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
    
    const day = dateObj.getDate();
    const month = monthsShort[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} ${month} ${year}`;
};

/**
 * Format relative time in Spanish
 * Example: "hace 2 días", "hace 1 hora"
 */
export const formatRelativeTimeSpanish = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffSecs < 60) return 'hace unos segundos';
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    if (diffWeeks < 4) return `hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
    if (diffMonths < 12) return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    
    return formatDateShortSpanish(dateObj);
};

