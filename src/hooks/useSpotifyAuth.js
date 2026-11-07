import { useState, useEffect, useRef } from 'react';
import { SPOTIFY_CONFIG } from '../config/spotify';
import { generateRandomString, generateCodeChallenge } from '../utils/pkce';
import { fetchSpotifyToken, fetchRefreshToken } from '../services/spotifyApi';

export function useSpotifyAuth () {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const authProcessed = useRef(false);

    const login = async () => {
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const authUrl = new URL(SPOTIFY_CONFIG.AUTH_ENDPOINT);

        window.localStorage.setItem('spotify_code_verifier', codeVerifier);

        const params = {
            response_type: 'code',
            client_id: SPOTIFY_CONFIG.CLIENT_ID,
            scope: SPOTIFY_CONFIG.SCOPES,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
        };
        
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    };

    const getAccessToken = async (code) => {
        const codeVerifier = localStorage.getItem('spotify_code_verifier');

        try {
            const result = await fetchSpotifyToken(code, codeVerifier);

            if (!result.ok) {
                    const errorData = await result.json();
                    throw new Error(`Spotify Token API Error: ${result.status} - ${errorData.error_description || errorData.error}`);

            }

            // 3. Erst wenn alles OK (200) ist, parsen wir die Erfolgsdaten
            const response = await result.json();

            if (response.access_token) {
                const expirationTime = Date.now() + response.expires_in * 1000;
                window.localStorage.setItem('spotify_token', response.access_token);
                window.localStorage.setItem('spotify_token_expires', expirationTime);
                window.localStorage.setItem('spotify_refresh_token', response.refresh_token);
                setToken(response.access_token);

                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen des Spotify-Tokens:', error);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const result = await fetchRefreshToken();
            const response = await result.json();
            if (!result.ok) {
                // expired refresh token triggers new auth prompt
                if (response.error === 'invalid_grant') {
                    window.localStorage.removeItem('spotify_token');
                    window.localStorage.removeItem('spotify_token_expires');
                    window.localStorage.removeItem('spotify_refresh_token');
                    setToken(null);

                    await login(); 
                    return;
                }

                throw new Error(`Token refresh failed: ${result.error}`);
            }
            
            // store token and expires at in state and localStorage
            const expirationTime = Date.now() + response.expires_in * 1000;
            window.localStorage.setItem('spotify_token', response.access_token);
            window.localStorage.setItem('spotify_token_expires', expirationTime);
            setToken(response.access_token);

            // set refresh token again
            if (response.refresh_token) {
                window.localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }

        } catch (error) {
            console.error('Fehler beim Auffrischen des Spotify-Tokens:', error);
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = window.localStorage.getItem('spotify_token');
            const refreshToken = window.localStorage.getItem('spotify_refresh_token');
            const tokenExpires = window.localStorage.getItem('spotify_token_expires');
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            
            if (error) {
                console.error("Spotify Login abgebrochen:", error);
                alert("Du musst den Spotify-Berechtigungen zustimmen, um das Spiel zu spielen.");

                window.history.replaceState({}, document.title, window.location.pathname);
            } else if (code && !authProcessed.current) {
                // coming back from login
                authProcessed.current = true;
                await getAccessToken(code);
            } else if (code && authProcessed.current) {
                // already processed, skip
                return;
            } else if (savedToken && tokenExpires && Date.now() < Number(tokenExpires)) {
                // still valid saved token
                setToken(savedToken);
            } else if (refreshToken) {
                // still saved refresh token
                await refreshAccessToken();
            } else {
                // no data in storage
                setToken(null)
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

  return { token, login, loading };
}