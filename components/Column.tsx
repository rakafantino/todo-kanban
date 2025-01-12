import { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface ColumnProps {
  column: Column;
  onTasksChange: () => void;
}

export default function Column({ column, onTasksChange }: ColumnProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className="w-[85vw] sm:w-[380px] md:w-80 flex-shrink-0">
      <div className="bg-gray-100/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">{column.title}</h2>
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200/80 rounded-full">{column.tasks.length}</span>
          </div>
        </div>

        {/* Tasks Container - tambahkan touch handling yang lebih baik */}
        <div
          ref={setNodeRef}
          className={cn(
            "p-4 space-y-3 min-h-[calc(100vh-13rem)] overflow-y-auto touch-pan-y",
            "transition-colors duration-200",
            isOver && !active?.data.current?.containerId && "bg-blue-50/50",
            isOver && active?.data.current?.containerId === column.id && "bg-gray-100/50"
          )}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} containerId={column.id} index={index} onTasksChange={onTasksChange} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
