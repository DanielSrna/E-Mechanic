import { useCallback, useMemo } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import OrderCard from './OrderCard';
import {
  KANBAN_COLUMNS,
  VALID_TRANSITIONS,
  getColumnBgColor,
  getColumnBorderColor,
  getColumnHeaderBg,
  statusLabel,
} from './status';

export default function OrderKanban({ orders, onStatusChange }) {
  const columns = useMemo(() => {
    const cols = {};
    KANBAN_COLUMNS.forEach((col) => {
      cols[col.id] = {
        ...col,
        orders: orders.filter((o) => o.status === col.id),
      };
    });
    return cols;
  }, [orders]);

  const onDragEnd = useCallback(
    async (result) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const fromStatus = source.droppableId;
      const toStatus = destination.droppableId;

      if (fromStatus === toStatus) return;

      const allowed = VALID_TRANSITIONS[fromStatus] || [];
      if (!allowed.includes(toStatus)) {
        toast.error(
          `Transición inválida: ${statusLabel(fromStatus)} → ${statusLabel(toStatus)}`
        );
        return;
      }

      onStatusChange(draggableId, toStatus, fromStatus);
    },
    [onStatusChange]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={columns[col.id]} />
        ))}
      </div>
    </DragDropContext>
  );
}

function KanbanColumn({ column }) {
  const { id, label, color, orders } = column;
  const bgColor = getColumnBgColor(color);
  const borderColor = getColumnBorderColor(color);
  const headerBg = getColumnHeaderBg(color);

  return (
    <div
      className={`flex-shrink-0 w-[260px] rounded-xl border ${borderColor} ${bgColor} flex flex-col`}
    >
      <div
        className={`${headerBg} text-white px-3 py-2 rounded-t-xl flex items-center justify-between`}
      >
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
          {orders.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto transition-colors min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
            }`}
          >
            {orders.map((order, index) => (
              <OrderCard key={order._id} order={order} index={index} />
            ))}
            {provided.placeholder}
            {orders.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-slate-300 text-xs">
                Sin órdenes
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
