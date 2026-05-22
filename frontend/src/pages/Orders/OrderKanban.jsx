import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import OrderCard from './OrderCard';
import {
  KANBAN_COLUMNS,
  VALID_TRANSITIONS,
  getColumnBgColor,
  getColumnBorderColor,
  getColumnHeaderBg,
  statusLabel,
} from './status';

function isColumnEmpty(orders) {
  return !orders || orders.length === 0;
}

function loadCollapsedState() {
  try {
    const stored = localStorage.getItem('kanban-collapsed');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCollapsedState(state) {
  localStorage.setItem('kanban-collapsed', JSON.stringify(state));
}

export default function OrderKanban({ orders, onStatusChange }) {
  const [collapsed, setCollapsed] = useState(loadCollapsedState);
  const prevOrdersRef = useRef(orders);

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

  useEffect(() => {
    const prev = prevOrdersRef.current;
    const nextCols = {};

    KANBAN_COLUMNS.forEach((col) => {
      const prevCount = prev.filter((o) => o.status === col.id).length;
      const nextCount = orders.filter((o) => o.status === col.id).length;
      if (prevCount === 0 && nextCount > 0) {
        nextCols[col.id] = false;
      }
    });

    if (Object.keys(nextCols).length > 0) {
      setCollapsed((c) => {
        const updated = { ...c, ...nextCols };
        saveCollapsedState(updated);
        return updated;
      });
    }

    prevOrdersRef.current = orders;
  }, [orders]);

  const toggleCollapse = useCallback((colId) => {
    setCollapsed((c) => {
      const updated = { ...c, [colId]: !c[colId] };
      saveCollapsedState(updated);
      return updated;
    });
  }, []);

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
      <div className="flex items-start gap-2 overflow-x-auto pb-4 kanban-board">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={columns[col.id]}
            isCollapsed={!!collapsed[col.id]}
            onToggle={() => toggleCollapse(col.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

function KanbanColumn({ column, isCollapsed, onToggle }) {
  const { id, label, color, orders } = column;
  const bgColor = getColumnBgColor(color);
  const borderColor = getColumnBorderColor(color);
  const headerBg = getColumnHeaderBg(color);
  const empty = isColumnEmpty(orders);

  useEffect(() => {
    if (empty && !isCollapsed) {
      onToggle();
    }
  }, [empty, isCollapsed, onToggle]);

  if (empty && isCollapsed) {
    return (
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-shrink-0 rounded-xl border ${borderColor} ${bgColor} transition-all duration-200 ${
              snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <button
              onClick={onToggle}
              className={`w-12 rounded-xl ${headerBg} text-white flex flex-col items-center gap-1 py-3 hover:opacity-90 transition`}
              title={`Expandir ${label}`}
            >
              <ChevronRight className="w-4 h-4" />
              <span
                className="text-xs font-semibold"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {label}
              </span>
              <span className="text-xs bg-white/20 px-1 py-0.5 rounded-full">0</span>
            </button>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  return (
    <div
      className={`flex-shrink-0 w-[260px] rounded-xl border ${borderColor} ${bgColor} flex flex-col max-h-[calc(100vh-220px)] transition-all duration-200`}
    >
      <button
        onClick={onToggle}
        className={`${headerBg} text-white px-3 py-2 rounded-t-xl flex items-center justify-between w-full text-left`}
      >
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
          {orders.length}
        </span>
      </button>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto kanban-column-scroll transition-colors min-h-[80px] ${
              snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
            }`}
          >
            {orders.map((order, index) => (
              <OrderCard key={order._id} order={order} index={index} />
            ))}
            {provided.placeholder}
            {empty && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-slate-300 dark:text-slate-600 text-xs">
                Sin órdenes
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
