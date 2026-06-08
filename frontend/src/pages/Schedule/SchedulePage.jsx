import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    api
      .get(`/schedule?from=${from}&to=${to}`)
      .then(r => setSchedule(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [from, to]);

  const days = useMemo(() => {
    if (!schedule) return [];
    const result = [];
    for (let i = 0; i < startOffset; i++) {
      result.push({ key: `empty-${i}`, empty: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = schedule.days?.[dateKey];
      result.push({
        key: dateKey,
        date: dateKey,
        day: d,
        empty: false,
        isWeekend: dayData?.isWeekend ?? (new Date(year, month, d).getDay() === 0 || new Date(year, month, d).getDay() === 6),
        ...dayData,
      });
    }
    return result;
  }, [schedule, year, month, startOffset, totalDays]);

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getCapacityColor = (percentUsed, isWeekend) => {
    if (isWeekend) return 'bg-slate-100 dark:bg-slate-700';
    if (percentUsed === undefined || percentUsed === null) return 'bg-white dark:bg-slate-800';
    if (percentUsed >= 90) return 'bg-red-50 dark:bg-red-900/20';
    if (percentUsed >= 60) return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  const getCapacityIcon = (percentUsed, isWeekend) => {
    if (isWeekend) return '⚪';
    if (percentUsed === undefined || percentUsed === null) return '⚪';
    if (percentUsed >= 90) return '🔴';
    if (percentUsed >= 60) return '🟡';
    return '🟢';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 page-schedule">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Capacidad del Taller
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition"
          >
            Hoy
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span>{MONTH_NAMES[month]} {year}</span>
        {schedule?.config && (
          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            Capacidad diaria: {schedule.config.dailyCapacityUnits} unidades
          </span>
        )}
        {schedule?.nextAvailableDate && (
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
            Próximo disponible: {schedule.nextAvailableDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 schedule-legend">
        <span className="flex items-center gap-1">🟢 &lt;60%</span>
        <span className="flex items-center gap-1">🟡 60-90%</span>
        <span className="flex items-center gap-1">🔴 &gt;90%</span>
        <span className="flex items-center gap-1">⚪ Libre / Fin de semana</span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando calendario...</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7">
            {DAYS_OF_WEEK.map(d => (
              <div
                key={d}
                className="px-2 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map(d => {
              if (d.empty) {
                return <div key={d.key} className="h-24 border-b border-r border-slate-100 dark:border-slate-700" />;
              }

              const isToday = d.date === today;
              const colorClass = getCapacityColor(d.percentUsed, d.isWeekend);
              const icon = getCapacityIcon(d.percentUsed, d.isWeekend);
              const isSelected = selectedDay === d.date;

              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(isSelected ? null : d.date)}
                  className={`h-24 border-b border-r border-slate-100 dark:border-slate-700 p-1.5 text-left transition hover:bg-blue-50 dark:hover:bg-blue-900/20 schedule-day ${colorClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {d.day}
                    </span>
                    <span className="text-xs">{icon}</span>
                  </div>
                  {!d.isWeekend && d.maxUnits !== undefined && (
                    <div className="mt-1">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {d.usedUnits ?? 0}/{d.maxUnits}
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1 mt-0.5">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            (d.percentUsed ?? 0) >= 90
                              ? 'bg-red-500'
                              : (d.percentUsed ?? 0) >= 60
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(d.percentUsed ?? 0, 100)}%` }}
                        />
                      </div>
                      {d.orders && d.orders.length > 0 && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {d.orders.length} orden{d.orders.length > 1 ? 'es' : ''}
                        </div>
                      )}
                    </div>
                  )}
                  {d.isWeekend && (
                    <div className="text-xs text-slate-300 mt-1">No laboral</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDay && schedule?.days?.[selectedDay] && (
        <DayDetail
          date={selectedDay}
          dayData={schedule.days[selectedDay]}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function DayDetail({ date, dayData, onClose }) {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 schedule-day-detail">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
          {formattedDate}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 schedule-capacity-info">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Capacidad: <span className="font-medium">{dayData.usedUnits ?? 0}/{dayData.maxUnits} unidades</span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Disponible: <span className="font-medium">{dayData.availableUnits ?? dayData.maxUnits} unidades</span>
        </div>
      </div>

      {dayData.orders && dayData.orders.length > 0 ? (
        <div className="space-y-2">
          {dayData.orders.map(o => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
            >
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                  {o.plate}
                </span>
                <span className="text-xs text-slate-400 ml-2">{o.client}</span>
              </div>
        <div className="flex items-center gap-2 schedule-nav">
                <span className="text-xs text-slate-500 capitalize">{o.serviceType}</span>
                <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                  {o.units}u
                </span>
                {o.priority && o.priority !== 'normal' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    o.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                    o.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {o.priority}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Sin órdenes programadas para este día</p>
      )}
    </div>
  );
}
