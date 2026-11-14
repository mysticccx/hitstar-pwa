import { useState, useEffect, useRef } from 'react';
import { SPOTIFY_CONFIG } from '../config/spotify';

export function useSpotifyPlayer (token, onPlaybackStarted) {
    const [player, setPlayer] = useState(undefined);
    const [deviceId, setDeviceId] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const currentTrackIdRef = useRef(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        const initializePlayer = () => {
            if (!window.Spotify);

            const spotifyPlayer = new window.Spotify.Player({
                name: 'Hitstar PWA Player',
                getOAuthToken: (cb) => { cb(token); },
                volume: 0.5
            });

            spotifyPlayer.addListener('ready', async ({ device_id }) => {
                console.log('Hitstar-Player ist bereit mit Device ID:', device_id);
                setDeviceId(device_id);
                setIsReady(true);

                // transfer play to this device ONCE
                try {
                    await fetch(SPOTIFY_CONFIG.PLAYER_ENDPOINT, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          device_ids: [device_id],
                          play: false,
                        }),
                      });
                    console.log("Spotify-Audiofokus erfolgreich auf PWA übertragen.");
                } catch (err) {
                    console.error("Fehler beim initialen Playback-Transfer:", err);
                }
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID ist offline gegangen:', device_id);
                setIsReady(false);
            });

            spotifyPlayer.addListener('player_state_changed', (state) => {
                if (!state) return;
                
                const currentTrack = state.track_window?.current_track;
                const isPlaying = !state.paused && currentTrack;

                if (isPlaying) {
                    // check whether play was already triggered for this specific track
                    if (currentTrackIdRef.current !== currentTrack.id) {
                        console.log("Audio-Stream läuft offiziell für Song-ID:", currentTrack.name);
                        
                        currentTrackIdRef.current = currentTrack.id; // mark song as active
                        
                        // should fire only once
                        if (onPlaybackStarted) {
                            onPlaybackStarted();
                        }
                    }
                } else if (state.paused) {
                    // reset id if paused or state changed to paused
                    currentTrackIdRef.current = null;
                }
            });


            spotifyPlayer.addListener('initialization_error', ({ message }) => {
                console.error('Spotify Init Fehler:', message);
            });

            spotifyPlayer.addListener('authentication_error', ({ message }) => {
                console.error('Spotify Auth Fehler (Token evtl. ungültig?):', message);
            });

            // Player verbinden
            spotifyPlayer.connect().then(success => {
                if (success) {
                    console.log('Erfolgreich mit dem Web Playback SDK verbunden!');
                    setPlayer(spotifyPlayer);
                }
            });
        };

        if (window.Spotify) {
            initializePlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initializePlayer;
        }

        // cleanup on refresh or quit
        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [token]);

    return { player, deviceId, isReady };
}