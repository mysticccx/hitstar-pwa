import { useState } from 'react'
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import ScannerComponent from './components/ScannerComponent';
import { fetchSongMetadata, playSpotifyTrack, pauseSpotifyTrack } from './services/playbackService';

function App() {
  const { token, login, loading: authLoading } = useSpotifyAuth();
  const { player, deviceId, isReady: playerReady } = useSpotifyPlayer(token);

  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState('home');
  const [scannedSong, setScannedSong] = useState(null);
  const [isPlaybackLoading, setIsPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  const handleSongScanned = async (cardId) => {

    // block any second handleSongScanned call
    if (isProcessing) return;

    setIsProcessing(true);
    setPlaybackError(null);
    setIsPlaybackLoading(true); 

    try {
      const songData = await fetchSongMetadata(cardId);
      setScannedSong(songData);
      
      await playSpotifyTrack(token, songData.spotify_id, deviceId);

      setView('guess');
    } catch (error) {
      console.error("Fehler im Spielablauf:", error);
      setPlaybackError(error.message || "Unerwarteter Fehler beim Abspielen.");
      setView('home'); // Bei Fehler zurück zum Start
    } finally {
      setIsPlaybackLoading(false);
      setIsProcessing(false);
    }
    
  };

  const handleNextGuess = async () => {
    setPlaybackError(null);
    try {
      await pauseSpotifyTrack(token, deviceId);
      setView('home');
    } catch (error) {
      console.error("Fehler im Spielablauf:", error);
      setPlaybackError(error.message || "Unerwarteter Fehler beim Abspielen.");
      setView('home'); // Bei Fehler zurück zum Start
    }
  }

  /**
   * Spiel laden Screen
   * während initialisierung des Auth-Prozessses
   */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl font-medium animate-pulse text-emerald-400">
          Spiel wird geladen...
        </div>
      </div>
    );
  }

  /**
   * Auth Screen
   * um Spotify zu verbinden
   */
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <h1 className="text-5xl font-black text-emerald-400 tracking-tight drop-shadow">
            Hitster QR
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Verbinde die App mit deinem Spotify Premium Account, um Songs im Hintergrund abzuspielen.
          </p>
          <button
            onClick={login}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 px-6 rounded-full shadow-lg transform active:scale-95 transition-all text-lg"
          >
            Anmelden mit Spotify
          </button>
        </div>
      </div>
    );
  }

  /**
   * Hauptseiten
   * nach autorisierung und Laden
   */
  return (
    <div className="min-h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Kleiner Status-Indikator oben */}
      <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
        ✓ Spotify aktiv
      </div>

      {playbackError && (
        <div className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl mb-4 text-sm">
          ⚠️ {playbackError}
        </div>
      )}

      {isPlaybackLoading && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-fade-in">
          {/* Ein schicker, rotierender Ladekreis in Spotify-Grün */}
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white">Lied wird geladen...</h3>
            <p className="text-sm text-slate-400">Musik wird im Hintergrund gestartet.</p>
          </div>
        </div>
      )}

      {/* ANSICHT A: STARTBILDSCHIRM */}
      {view === 'home' && (
        <div className="text-center space-y-6 max-w-sm animate-fade-in">
          {/* Der Titel wechselt dynamisch */}
          <h1 className="text-4xl font-extrabold text-slate-100">
            {playerReady ? "Bereit für die Karte?" : "Spiel lädt..."}
          </h1>
          
          {/* Der Beschreibungstext wechselt dynamisch */}
          <p className="text-slate-400 text-sm">
            {playerReady 
              ? "Klicke auf den Button und halte die Kamera über den QR-Code deiner Spielkarte."
              : "Verbinde mit Spotify, dann kann es sofort losgehen!"}
          </p>

        {/* Der Button wird NUR gerendert, wenn der Player bereit ist */}
        {playerReady && (
          <button
            onClick={() => setView('scanner')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 px-6 rounded-full shadow-lg transform active:scale-95 transition-all text-lg"
          >
            📸 Karte scannen
          </button>
        )}
      </div>
    )}

      {/* ANSICHT B: SCANNER-OBERFLÄCHE */}
      {view === 'scanner' && (
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          <h2 className="text-xl font-bold text-slate-300">Code scannen</h2>
          
          <div className="w-full aspect-square bg-slate-800 rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-inner flex items-center justify-center">
            <ScannerComponent token={token} onScanSuccess={handleSongScanned} />
          </div>

          {/* --- NEU: MANUELLES TEST-MENÜ FÜR PC OHNE KAMERA --- */}
          <div className="w-full bg-slate-850 p-4 rounded-2xl border border-slate-700 text-center space-y-3">
            <p className="text-xs text-amber-400 font-semibold">💻 PC-Modus: Simuliere QR-Code-Scan</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleSongScanned('HITS-001')}
                className="bg-slate-700 hover:bg-slate-650 text-white text-xs py-2 px-4 rounded-xl transition-all"
              >
                Klicke "Karte 1" (1977)
              </button>
              <button
                onClick={() => handleSongScanned('HITS-002')}
                className="bg-slate-700 hover:bg-slate-650 text-white text-xs py-2 px-4 rounded-xl transition-all"
              >
                Klicke "Karte 2" (1982)
              </button>
              <button
                onClick={() => handleSongScanned('HITS-FLOPP')}
                className="bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs py-2 px-4 rounded-xl transition-all border border-rose-500/30"
              >
                Simuliere Fehler-Karte
              </button>
            </div>
          </div>

          <button
            onClick={() => setView('home')}
            className="text-slate-400 hover:text-white underline text-sm transition-colors pt-4"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* ANSICHT C: SONG RATEN */}
      {view === 'guess' && scannedSong && (
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white pt-3">Rate den Song!</h2>
            <p className="text-xl text-slate-300">{scannedSong.artist}</p>
          </div>

          <div className="bg-slate-900/60 py-4 px-6 rounded-2xl border border-slate-700">
            <span className="text-sm text-slate-400 block mb-1">Hier dreht sich eine scheibe!</span>
          </div>

          <button
            onClick={() => {
              setView('reveal');
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Lösung anzeigen
          </button>
        </div>
      )}

      {/* ANSICHT D: SONG ANZEIGEN (REVEAL) */}
      {view === 'reveal' && scannedSong && (
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
              Lösung
            </span>
            <h2 className="text-3xl font-black text-white pt-3">{scannedSong.title}</h2>
            <p className="text-xl text-slate-300">{scannedSong.artist}</p>
          </div>

          <div className="bg-slate-900/60 py-4 px-6 rounded-2xl border border-slate-700">
            <span className="text-sm text-slate-400 block mb-1">Jahr</span>
            <span className="text-4xl font-extrabold text-emerald-300">{scannedSong.year}</span>
          </div>

          <button
            onClick={() => {
              setScannedSong(null);
              handleNextGuess();
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Nächste Karte
          </button>
        </div>
      )}
    </div>
  );

}

export default App
