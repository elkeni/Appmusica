import React from 'react';

export default function LocalFile({ onSelectFile = () => {} }) {
  return (
    <div className="p-4 mobile-card">
      <h2 className="text-lg font-bold mb-3">Local File</h2>
      <p className="text-sm text-slate-400 mb-3">Selecciona un archivo de audio desde tu equipo para reproducir localmente.</p>
      <input aria-label="Seleccionar archivo" type="file" accept="audio/*" onChange={(e) => onSelectFile(e.target.files && e.target.files[0])} />
    </div>
  );
}
