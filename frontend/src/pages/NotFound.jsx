import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle className="w-12 h-12 text-slate-400 mb-4" />
      <h1 className="text-2xl font-bold text-slate-700 mb-2">404 - Página no encontrada</h1>
      <p className="text-slate-500">Esta ruta no existe en el taller.</p>
    </div>
  );
}
