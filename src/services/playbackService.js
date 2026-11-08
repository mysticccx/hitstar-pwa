import { SPOTIFY_CONFIG } from "../config/spotify";

export async function fetchSongMetadata(cardId) {
  const response = await fetch(`/api/get-song?id=${cardId}`);
  if (!response.ok) {
    // 1. Wenn die API fehlschlägt, lesen wir das JSON aus, das du gesendet hast
    try {
      const errorData = await response.json();
      // throw error from api function
      throw new Error(errorData.error || `Server-Fehler: ${response.status}`);
    } catch (jsonParseError) {
      // Fallback
      throw new Error(`Serverless API Fehler: ${response.status}`);
    }
  }
  
  return response.json();
}

export async function playSpotifyTrack(accessToken, spotifyTrackId, deviceId) {

  if (!deviceId) {
    throw new Error("Keine Device-ID vom Spotify-SDK empfangen.");
  }

  const url = deviceId 
    ? `${SPOTIFY_CONFIG.PLAYBACK_ENDPOINT}?device_id=${deviceId}`
    : SPOTIFY_CONFIG.PLAYBACK_ENDPOINT;

  const response = await fetch(url, {
    method: 'PUT', // Spotify verlangt zwingend PUT, um den State zu ändern
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Dein valider OAuth-Token
    },
    body: JSON.stringify({
      uris: [`spotify:track:${spotifyTrackId}`], // Spotify erwartet URIs als Array
      position_ms: 0,
    }),
  });

  // Spotify antwortet bei Erfolg mit HTTP 204 (No Content) statt 200
  if (response.status !== 204 && !response.ok) {
    throw new Error(`Spotify Playback Fehler: ${response.status}`);
  }
}

export async function pauseSpotifyTrack(accessToken, deviceId) {

  if (!deviceId) {
    throw new Error("Keine Device-ID vom Spotify-SDK empfangen.");
  }

  const url = deviceId 
    ? `${SPOTIFY_CONFIG.PAUSE_ENDPOINT}?device_id=${deviceId}`
    : SPOTIFY_CONFIG.PAUSE_ENDPOINT;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 204 && !response.ok) {
    throw new Error(`Spotify Playback Fehler: ${response.status}`);
  }
}
