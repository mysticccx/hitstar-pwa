import { useState } from 'react'
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import ScannerComponent from './components/ScannerComponent';
import { fetchSongMetadata, playSpotifyTrack, pauseSpotifyTrack } from './services/playbackService';
import AnimatedBackground from './components/AnimatedBackground';
import ManualCodeInput from './components/ManualCodeInput';

function App() {
  const { token, login, loading: authLoading } = useSpotifyAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState('home');
  const [scannedSong, setScannedSong] = useState(null);
  const [isPlaybackLoading, setIsPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  const handleAudioPlaying = () => {
    console.log("Changing to guess view...");
    setIsPlaybackLoading(false);
    setView('guess');            
  };

  const { player, deviceId, isReady: playerReady } = useSpotifyPlayer(token, handleAudioPlaying);


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
      // view is switched only when audio is playing -> callback handleAudioPlaying

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
    <div className="relative min-h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden">

      {/* animierter Hintergrund */}
      <AnimatedBackground />

      {/* Kleiner Status-Indikator oben */}
      <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
        ✓ Spotify aktiv
      </div>

      {/* Hauptcontent */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">

        {playbackError && (
          <div className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl mb-4 text-sm">
            ⚠️ {playbackError}
          </div>
        )}

        {isPlaybackLoading && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-fade-in">
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
              {playerReady ? "Bereit zum Spielen?" : "Spiel lädt..."}
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
              className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 px-6 rounded-full shadow-lg transform active:scale-95 transition-all text-lg"
            >
              Song scannen
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
            <ManualCodeInput handleSongScanned={handleSongScanned} />

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
            </div>

            <div className="py-4 px-6 flex justify-center">
              <div className="bg-slate-900/60 rounded-full p-1 border-8 border-slate-700">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-40 fill-none animate-spin stroke-emerald-500">
                <circle cx="12" cy="12" r="3" strokeWidth="1.5"/>
                <path d="M7.40381 16.5967C4.8654 14.0583 4.8654 9.94271 7.40381 7.4043M16.5962 7.4043C17.6103 8.41836 18.2192 9.68413 18.4231 11.0005M16.5962 16.5967C17.0785 16.1144 17.4692 15.5751 17.7682 15.0005" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              </div>
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

    </div>
  );

}

export default App
