import { useState } from 'react';

export default function DemoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-float">
      <div className="bg-slate-900/90 backdrop-blur rounded-xl px-4 py-3 shadow-lg max-w-[280px]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white/60 text-[10px] font-medium tracking-wide">
            BIENVENIDO RECLUTADOR
          </p>
          <button
            onClick={() => setVisible(false)}
            className="text-white/40 hover:text-white/80 leading-none text-sm"
          >
            ✕
          </button>
        </div>
        <p className="text-white/80 text-sm mt-1.5">Credenciales demo:</p>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs text-white/50">
            Admin:{' '}
            <span className="text-white font-mono">admin@emechanic.com</span>
            <span className="text-white/30 mx-1">/</span>
            <span className="text-white font-mono">admin123</span>
          </p>
          <p className="text-xs text-white/50">
            Mec:{' '}
            <span className="text-white font-mono">carlos@emechanic.com</span>
            <span className="text-white/30 mx-1">/</span>
            <span className="text-white font-mono">mecanico123</span>
          </p>
        </div>
        <div className="flex gap-2 mt-2.5 pt-2 border-t border-white/10">
          <a
            href={import.meta.env.VITE_API_DOCS_URL || 'http://localhost:3000/api-docs'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-[11px] px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            API Docs
          </a>
          <a
            href={import.meta.env.VITE_DEPLOY_GUIDE_URL || 'https://github.com/DanielSrna/E-Mechanic/blob/main/docs/DEPLOY.md'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-[11px] px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            Guía Deploy
          </a>
        </div>
      </div>
    </div>
  );
}
