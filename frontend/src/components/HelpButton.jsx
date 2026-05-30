import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function HelpButton({ onRepeatTour }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-full py-2.5 rounded-lg text-sm font-medium transition bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center"
        title="Ayuda"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <button
            onClick={() => {
              setOpen(false);
              onRepeatTour?.();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <span>🔄</span> Repetir tutorial
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
            disabled
          >
            <span>📧</span> Contacto
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
            disabled
          >
            <span>📖</span> Documentación
          </button>
        </div>
      )}
    </div>
  );
}
