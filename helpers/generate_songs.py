import json
import os
import random
import spotipy
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyClientCredentials

# init dotenv
load_dotenv()

print("Gefundene ID:", os.environ.get("VITE_SPOTIFY_CLIENT_ID"))
print("Gefundenes Secret:", os.environ.get("SPOTIPY_CLIENT_SECRET"))

USER_ACCESS_TOKEN = "BQBnydVErCNci3sBVm74B1OQxLHomxHagFqlPbF4PvuK0wJ6J4lXHH6VaKvn8HUbOzvCA3guLwTmOlcPpYMVL35PDTOsGIlYxpcERfpzom2Et-Msv0KD5vsV2w7KYIG5fWqWkV6l9IpPQxIdtvjjIA4wRFuxq2tGFAWf-KoHC5s315Z3xEeLj9mCcmujT3bBacPkisywyzhyj9tMrDc2ZBuSgif9hyoq8UodQw9Aq8YEjaEm0UNIlZSvt59Ukdy1rBFre3txx5tIDYxsVYG-okeX"

# 1. DEINE CREDENTIALS HIER EINTRAGEN
CLIENT_ID = os.environ.get("VITE_SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIPY_CLIENT_SECRET")

# 2. DIE ID DEINER PLAYLIST
PLAYLIST_ID = "0ZGV7fs4mUUaG48LIO7vq4"

def random_color():
    r = random.randint(40, 255)
    g = random.randint(40, 255)
    b = random.randint(40, 255)

    col = (r, g, b)
    ccol = (255 - r, 255 - g, 255 - b)

    return (col, ccol)

def main():
    if USER_ACCESS_TOKEN == "HIER_DEN_KOPIERTEN_TOKEN_VON_localhost_EINSETZEN":
        print("❌ Bitte kopiere zuerst dein spotify_token aus dem LocalStorage in das Skript!")
        return

    print("Verbinde mit der Spotify API...")

    print("Verbinde mit der Spotify API über User-Authentifizierung...")
    
    # Wir starten spotipy DIREKT mit dem echten User-Token statt ClientCredentials!
    sp = spotipy.Spotify(auth=USER_ACCESS_TOKEN)

    print("Hole Playlist-Tracks ein (Achte auf das 100-Songs-Limit)...")
    songs_dict = {}
    card_counter = 1

    # Spotify liefert pro Anfrage maximal 100 Songs, wir loopen per Offset durch
    offset = 0
    while True:
        results = sp.playlist_items(PLAYLIST_ID, offset=offset, market="DE", fields="items(item(id,name,artists,album(release_date)))")
        items = results.get('items', [])
        
        if not items:
            break

        for item in items:
            track = item.get('item')
            if not track:
                continue

            track_id = track.get('id')
            title = track.get('name')
            
            # Künstler zusammenführen (falls es ein Feature mit mehreren Sängern ist)
            artists_list = [artist['name'] for artist in track.get('artists', [])]
            artist = ", ".join(artists_list)
            
            # Das Release-Datum auslesen und bereinigen
            # Spotify liefert manchmal "1977-12-15" oder nur "1977". Wir schneiden starr das Jahr ab.
            release_date = track.get('album', {}).get('release_date', '')
            year = int(release_date[:4]) if release_date else 0

            # Generiere deine eigene Karten-ID (z.B. HITS-001, HITS-002)
            card_id = f"HITS-{card_counter:03d}"

            (col1, col2) = random_color()

            # In die Struktur einpflegen
            songs_dict[card_id] = {
                "spotify_id": track_id,
                "title": title,
                "artist": artist,
                "year": year,
                "col1": col1,
                "col2": col2
            }
            
            card_counter += 1

        offset += len(items)
        if len(items) < 50:
            break # Keine weiteren Songs mehr in der Playlist

    # 3. Speicher das Ergebnis direkt in deinem public Ordner ab!
    output_path = "public/songs-processed.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(songs_dict, f, indent=2, ensure_ascii=False)

    print(f"🎉 Fertig! {len(songs_dict)} Songs erfolgreich in '{output_path}' importiert.")

if __name__ == "__main__":
    main()