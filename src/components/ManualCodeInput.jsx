import { useId, useState } from 'react';

export default function ManualCodeInput ({ handleSongScanned }) {
  const id = useId();
  const [codeInput, setCodeInput] = useState(null);
  return (
    <div className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-left space-y-3">
        <p className="font-semibold text-lg">Code manuell eingeben</p>
        <div className="flex gap-2 justify-between">
            <input id={id} onInput={e => setCodeInput(e.target.value)} type="text" className="w-3/4 bg-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-emerald-500" placeholder="001" />
            <button
            onClick={() => handleSongScanned('HITS-' + String(codeInput).padStart(3, '0'))}
            className="bg-emerald-500 hover:bg-slate-650 text-slate-950 font-semibold text-sm py-2 px-4 rounded-xl transition-all w-1/4"
            >
            Abspielen
            </button>
        </div>
    </div>
  );
}
