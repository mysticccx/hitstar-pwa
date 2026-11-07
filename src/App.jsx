import { useState } from 'react'
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';

function App() {
  const { token, login, loading: authLoading } = useSpotifyAuth();
  const { player, deviceId, isReady: playerReady } = useSpotifyPlayer(token);

  const [view, setView] = useState('home');
  const [scannedSong, setScannedSong] = useState(null);

  const handleSongScanned = (songData) => {
    setScannedSong(songData);
    setView('reveal'); // Automatisch zur Song-Anzeige wechseln
    // TODO: nur reveal bei click auf song player
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl font-medium animate-pulse text-emerald-400">
          Spiel wird geladen...
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Kleiner Status-Indikator oben */}
      <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
        ✓ Spotify aktiv
      </div>

      {/* ANSICHT A: STARTBILDSCHIRM */}
      {view === 'home' && (
        <div className="text-center space-y-6 max-w-sm">
          <h1 className="text-4xl font-extrabold text-slate-100">Bereit für die Karte?</h1>
          <p className="text-slate-400 text-sm">
            Klicke auf den Button und halte die Kamera über den QR-Code deiner Spielkarte.
          </p>
          <button
            onClick={() => setView('scanner')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 px-6 rounded-full shadow-lg transform active:scale-95 transition-all text-lg"
          >
            📸 Karte scannen
          </button>
        </div>
      )}

      {/* ANSICHT B: SCANNER-OBERFLÄCHE */}
      {view === 'scanner' && (
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          <h2 className="text-xl font-bold text-slate-300">Code scannen</h2>
          
          <div className="w-full aspect-square bg-slate-800 rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-inner flex items-center justify-center">
            {/* Hier binden wir gleich den Scanner ein */}
            <p className="text-slate-500 text-sm px-4 text-center">
              [Hier wird die ScannerComponent gerendert]
            </p>
            {/* <ScannerComponent token={token} onScanSuccess={handleSongScanned} /> */}
          </div>

          <button
            onClick={() => setView('home')}
            className="text-slate-400 hover:text-white underline text-sm transition-colors pt-4"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* ANSICHT C: SONG ANZEIGEN (REVEAL) */}
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
              setView('home');
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
