// src/youtubeService.js
import axios from 'axios';

// ¡IMPORTANTE! En un proyecto real, esto debería estar en variables de entorno (.env)
// Pero para aprender, pégalo aquí. NO SUBAS ESTO A GITHUB PÚBLICO si es una clave de pago.
const API_KEY = 'AIzaSyAb4DxLjyYdaBiQE1n2KiOapnRwl35EHJE'; 
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchMusic = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query, // Lo que el usuario escribe
        type: 'video',
        videoCategoryId: '10', // 10 es la categoría de "Música" en YouTube
        key: API_KEY,
      },
    });
    return response.data.items;
  } catch (error) {
    console.error("Error buscando música", error);
    return [];
  }
};