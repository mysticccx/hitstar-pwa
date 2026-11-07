import fs from 'fs';
import path from 'path';

export default async function handler (request, response) {
    // CORS header
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // read card id from query params
    const url = new URL(request.url, `http://${request.headers.host}`);
    const cardId = url.searchParams.get('id');

    if (!cardId) {
        return response.status(450).json({ error: 'Missing card ID parameter (?id=...)' });
    }

    try {
        // Pfad zur songs.json
        // process.cwd() = Hauptverzeichnis von vercel
        const filePath = path.join(process.cwd(), 'public', 'songs.json');

        // Datei einlesen
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const songsDatabase = JSON.parse(fileData);

        // Song anhand der gescannten ID suchen
        const foundSong = songsDatabase[cardId];

        if (!foundSong) {
            return response.status(404).json({ error: `Karte '${cardId}' wurde in der Spieldatenbank nicht gefunden.` });
        }

        // Erfolg: Schicke die Metadaten zurück an das Frontend!
        return response.status(200).json(foundSong);

    } catch (error) {
        console.error('Interner Serverfehler in der Serverless Function:', error);
        return response.status(500).json({ error: 'Interner Serverfehler beim Lesen der Musikdatenbank.' });
    }
}