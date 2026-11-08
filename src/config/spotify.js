// spotify config data

export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  REDIRECT_URI: window.location.origin,
  SCOPES: 'streaming user-modify-playback-state user-read-currently-playing user-read-private user-read-email',
  AUTH_ENDPOINT: 'https://accounts.spotify.com/authorize',
  TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
  PLAYER_ENDPOINT: 'https://api.spotify.com/v1/me/player',
  PLAYBACK_ENDPOINT: 'https://api.spotify.com/v1/me/player/play',
  PAUSE_ENDPOINT: 'https://api.spotify.com/v1/me/player/pause',
};