import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { deleteTask } from "@/app/actions";
import { EditTaskDialog } from "./EditTaskDialog";

interface TaskCardProps {
  task: Task;
  containerId: string;
  index: number;
  isDragging?: boolean;
  onTasksChange?: () => void;
}

export default function TaskCard({ task, containerId, index, isDragging: isOverlay, onTasksChange }: TaskCardProps) {
  const { toast } = useToast();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
      containerId,
      index,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: "grab",
  };

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (containerId: string) => {
    switch (containerId) {
      case "todo":
        return "bg-yellow-500";
      case "inprogress":
        return "bg-blue-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDelete = async () => {
    try {
      const { success, error } = await deleteTask(task.id);

      if (!success) {
        throw new Error(error || "Failed to delete task");
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });

      onTasksChange?.();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={cn(
        "bg-white p-4 rounded-lg shadow-sm border border-gray-200",
        "active:cursor-grabbing group touch-none",
        "transition-all duration-200",
        (isDragging || isOverlay) && "shadow-lg ring-2 ring-todoist-red/20",
        isOverlay && "rotate-[2deg] scale-105"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getStatusColor(containerId))} />
          <span className="text-xs text-gray-500">
            {containerId === "todo" && "To Do"}
            {containerId === "inprogress" && "In Progress"}
            {containerId === "done" && "Done"}
          </span>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="invisible group-hover:visible w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white shadow-lg border border-gray-200">
            <div onClick={(e) => e.stopPropagation()}>
              <EditTaskDialog
                task={task}
                trigger={
                  <DropdownMenuItem className="bg-white hover:bg-gray-100" onSelect={(e) => e.preventDefault()}>
                    <Pencil className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                }
                onTaskUpdated={onTasksChange}
              />
            </div>
            <DropdownMenuItem className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {format(new Date(task.dueDate), "MMM d")}
        </div>
      )}

      {/* Title & Description */}
      <h3 className="font-medium text-gray-900">{task.title}</h3>
      {task.description && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="text-xs px-2 py-0.5"
              style={{
                backgroundColor: label.color || undefined,
                color: label.color ? "#fff" : undefined,
              }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Created Date */}
      <div className="mt-3 flex items-center text-xs text-gray-400">
        <Clock className="w-3 h-3 mr-1" />
        {format(new Date(task.createdAt), "MMM d, yyyy")}
      </div>
    </div>
  );
}
