import { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AssistButton() {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [sending, setSending] = useState(false);
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

  const handleSubmit = async () => {
    if (!desc.trim()) return;
    const wordCount = desc.trim().split(/\s+/).length;
    if (wordCount > 50) {
      toast.error('Máximo 50 palabras');
      return;
    }
    setSending(true);
    try {
      await api.post('/notifications/request-assistance', { description: desc.trim() });
      toast.success('Asistencia solicitada');
      setDesc('');
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar');
    }
    setSending(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-10 rounded-lg flex items-center justify-center text-sm font-medium transition bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
        title="Asistencia"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
            Solicitar asistencia al administrador
          </p>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe tu duda en menos de 50 palabras..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">
              {desc.trim().split(/\s+/).filter(Boolean).length}/50 palabras
            </span>
            <button
              onClick={handleSubmit}
              disabled={sending || !desc.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
