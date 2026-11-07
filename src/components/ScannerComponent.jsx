import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerComponent () {

    const scannerId = "html5qr-code-region";
    const html5QrcodeRef = useRef(null);

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const html5Qrcode = new Html5Qrcode(scannerId);
        html5QrcodeRef.current = html5Qrcode;

        const qrCodeConfig = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        };

        const handleSuccess = (decodedText) => {
            console.log("Erfolgreich gescannt:", decodedText);
            onScanSuccess(decodedText);
        };

        // on scan failed
        const handleScanError = (errorMessage) => {
            // leave empty to not flood the console
        };

        const startWithFallbackDevice = () => {
            Html5Qrcode.getCameras().then((devices) => {
                if (devices && devices.length > 0) {
                    console.log("Fallback aktiv: Nutze Kamera-ID:", devices[0].label || devices[0].id);
                    return html5Qrcode.start(devices[0].id, config, handleSuccess, handleScanError);
                } else {
                    throw new Error("Keine Kamera-Hardware erkannt.");
                }
            }).catch((err) => {
                console.error("Endgültiger Kamerafehler:", err);
                setErrorMessage(
                    "Es konnte kein gültiges Videoeingabegerät gefunden werden. Bitte versuche es auf einem anderen Gerät (z.B. deinem Smartphone)."
                );
            });
        };

        html5Qrcode.start(
            { facingMode: "environment" }, // force front camera
            qrCodeConfig,
            (decodedText) => {
                // scan successful
                console.log("Erfolgreich gescannt:", decodedText);
                onScanSuccess(decodedText);
            },
        ).then(() => {
            console.log("Kamera erfolgreich über Standardmethode (Rückkamera) gestartet.");
        }).catch((err) => {
            console.warn("Standard-Kamerastart fehlgeschlagen. Starte Fallback...", err.name || err);
            startWithFallbackDevice();
        });

        // cleanup
        return () => {
            if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
                html5QrcodeRef.current.stop()
                    .then(() => {
                        console.log("Kamera erfolgreich gestoppt und freigegeben.");
                    })
                    .catch((err) => console.error("Fehler beim Stoppen der Kamera:", err));
            }
        };

    }, []);

    if (errorMessage) {
        return (
        <div className="w-full h-full bg-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-lg font-bold text-rose-400">Kamerafehler</h3>
            <p className="text-sm text-slate-300 leading-relaxed px-2">
            {errorMessage}
            </p>
        </div>
        );
    }

    
    return (
        <div className="relative w-full h-full">
            <div id={scannerId} className="w-full h-full object-cover"></div>
            <div className="absolute inset-0 pointer-events-none border-[30px] border-slate-900/60 flex items-center justify-center">
                <div className="w-[250px] h-[250px] border-2 border-dashed border-emerald-400 rounded-2xl animate-pulse"></div>
            </div>
        </div>
    );
}