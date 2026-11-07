import { SPOTIFY_CONFIG } from "../config/spotify";

export async function fetchSongMetadata(cardId) {
  const response = await fetch(`/api/get-song?id=${cardId}`);
  if (!response.ok) {
    throw new Error(`Serverless API Fehler: ${response.status}`);
  }
  return response.json();
}

export async function playSpotifyTrack(accessToken, spotifyTrackId, deviceId) {
  const url = deviceId 
    ? `${SPOTIFY_CONFIG.PLAYBACK_ENDPOINT}?device_id={deviceId}`
    : SPOTIFY_CONFIG.PLAYBACK_ENDPOINT;

  const response = await fetch(url, {
    method: 'PUT', // Spotify verlangt zwingend PUT, um den State zu ändern
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Dein valider OAuth-Token
    },
    body: JSON.stringify({
      uris: [`spotify:track:${spotifyTrackId}`], // Spotify erwartet URIs als Array
    }),
  });

  // Spotify antwortet bei Erfolg mit HTTP 204 (No Content) statt 200
  if (response.status !== 204 && !response.ok) {
    throw new Error(`Spotify Playback Fehler: ${response.status}`);
  }

  if (response.status !== 204 && !response.ok) {
    throw new Error(`Spotify Playback Fehler: ${response.status}`);
  }
}
