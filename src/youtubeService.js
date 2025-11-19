// src/youtubeService.js
import axios from 'axios';

// ¡IMPORTANTE! En un proyecto real, esto debería estar en variables de entorno (.env)
// Pero para aprender, pégalo aquí. NO SUBAS ESTO A GITHUB PÚBLICO si es una clave de pago.
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchMusic = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 50,
        q: query,
        type: 'video',
        videoCategoryId: '10', // 10 es la categoría de "Música" en YouTube
        key: API_KEY,
      },
    });
    const items = response.data.items || [];
    // Filtramos resultados que no tengan un id de video válido
    return items.filter((item) => item.id && item.id.videoId);
  } catch (error) {
    console.error("Error buscando música", error);
    return [];
  }
};