import { Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { PRIORITY_CONFIG, SERVICE_TYPE_CONFIG } from './status';

export default function OrderCard({ order, index }) {
  const priority = PRIORITY_CONFIG[order.priority || 'normal'];
  const serviceType = SERVICE_TYPE_CONFIG[order.serviceType || 'medio'];

  return (
    <Draggable draggableId={order._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border p-3 mb-2 transition-shadow ${
            snapshot.isDragging
              ? 'shadow-lg border-blue-300 bg-white'
              : 'shadow-sm border-slate-200 bg-white hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded bg-${priority.color}-100 text-${priority.color}-700`}
            >
              {priority.label}
            </span>
            {order.scheduledDate && (
              <span className="text-xs text-slate-400">
                {new Date(order.scheduledDate).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>

          <Link to={`/orders/${order._id}`} className="block group">
            <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
              {order.motorcycle?.plate}
              <span className="text-slate-400 font-normal ml-1.5 text-xs">
                {order.motorcycle?.brand} {order.motorcycle?.model}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-1 truncate">
              {order.client?.name}
            </div>

            <div className="text-xs text-slate-400 mt-0.5">
              {order.mechanic?.name}
            </div>
          </Link>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <span
              className={`text-xs px-1.5 py-0.5 rounded bg-${serviceType.color}-50 text-${serviceType.color}-600 font-medium`}
            >
              {serviceType.label}
            </span>
            {order.entryReason && (
              <span className="text-xs text-slate-400 truncate flex-1">
                {order.entryReason}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
