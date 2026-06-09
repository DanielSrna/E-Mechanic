import { Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { PRIORITY_CONFIG, SERVICE_TYPE_CONFIG } from '../../utils/status';

export default function OrderCard({ order, index }) {
  const priority = PRIORITY_CONFIG[order.priority || 'normal'];
  const serviceType = SERVICE_TYPE_CONFIG[order.serviceType || 'medio'];

  return (
    <Draggable draggableId={order._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex rounded-lg border transition-shadow ${
            snapshot.isDragging
              ? 'shadow-lg border-blue-300 bg-white'
              : 'shadow-sm border-slate-200 bg-white hover:shadow-md'
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="flex-shrink-0 w-7 bg-slate-100 dark:bg-slate-600 rounded-l-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-slate-200 dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors card-drag-handle"
            title="Arrastrar para mover"
          >
            <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-300" />
          </div>

          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded bg-${priority.color}-100 text-${priority.color}-700 dark:bg-${priority.color}-900/30 dark:text-${priority.color}-300`}
              >
                {priority.label}
              </span>
              {order.scheduledDate && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(order.scheduledDate).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>

            <Link to={`/orders/${order._id}`} className="block group">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 transition-colors">
                {order.motorcycle?.plate}
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5 text-xs">
                  {order.motorcycle?.brand} {order.motorcycle?.model}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {order.client?.name}
              </div>

              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {order.mechanic?.name}
              </div>
            </Link>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span
                className={`text-xs px-1.5 py-0.5 rounded bg-${serviceType.color}-50 text-${serviceType.color}-600 dark:bg-${serviceType.color}-900/20 dark:text-${serviceType.color}-400 font-medium`}
              >
                {serviceType.label}
              </span>
              {order.entryReason && (
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate flex-1">
                  {order.entryReason}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
