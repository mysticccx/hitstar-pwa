import { SPOTIFY_CONFIG } from '../config/spotify';

export async function fetchSpotifyToken(code, codeVerifier) {
  const payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  };

  const result = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, payload);
  
  return result;
}

export async function fetchRefreshToken () {

  const refreshToken = window.localStorage.getItem('spotify_refresh_token');

  const payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }),
  };

  const result = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, payload);

  return result;
}
