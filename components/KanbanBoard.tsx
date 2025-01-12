"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Header from "./Header";
import Column from "./Column";
import TaskCard from "./TaskCard";
import { getTasks, updateTaskStatus, reorderTasks } from "../app/actions";
import { Status, Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Record<string, Task[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Status[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px minimal drag distance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { columns: data, error } = await getTasks();

      if (error) {
        throw new Error(error);
      }

      setColumns(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load tasks",
        variant: "destructive",
      });
      setColumns({
        todo: [],
        inprogress: [],
        done: [],
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = columns?.[active.data.current?.containerId as string]?.find((task) => task.id === active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [columns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !active) {
        setActiveTask(null);
        return;
      }

      const activeContainer = active.data.current?.containerId;
      const overContainer = over.data.current?.containerId || over.id;

      if (!activeContainer || !overContainer || !columns) {
        setActiveTask(null);
        return;
      }

      try {
        const sourceStatus = getStatus(activeContainer as string);
        const destinationStatus = getStatus(overContainer as string);

        // Optimistic update
        const updatedColumns = { ...columns };
        const activeTask = updatedColumns[activeContainer].find((task) => task.id === active.id);

        if (!activeTask) {
          return;
        }

        // Jika drop di container yang sama dan posisi berbeda
        if (activeContainer === overContainer && active.id !== over.id) {
          const oldIndex = updatedColumns[activeContainer].findIndex((task) => task.id === active.id);
          const newIndex = updatedColumns[activeContainer].findIndex((task) => task.id === over.id);

          if (oldIndex !== undefined && newIndex !== undefined) {
            // Update UI terlebih dahulu
            const newTasks = [...updatedColumns[activeContainer]];
            newTasks.splice(oldIndex, 1);
            newTasks.splice(newIndex, 0, activeTask);
            updatedColumns[activeContainer] = newTasks;
            setColumns(updatedColumns);

            // Kemudian update server
            const { success, error } = await reorderTasks(active.id as string, sourceStatus, destinationStatus, newIndex);

            if (!success) {
              throw new Error(error || "Failed to reorder tasks");
            }
          }
        }
        // Jika drop di container berbeda
        else if (activeContainer !== overContainer) {
          // Update UI terlebih dahulu
          const sourceTasks = [...updatedColumns[activeContainer]].filter((task) => task.id !== active.id);
          const destinationTasks = [...updatedColumns[overContainer]];

          activeTask.status = destinationStatus;
          destinationTasks.push(activeTask);

          updatedColumns[activeContainer] = sourceTasks;
          updatedColumns[overContainer] = destinationTasks;
          setColumns(updatedColumns);

          // Kemudian update server
          const { success, error } = await reorderTasks(active.id as string, sourceStatus, destinationStatus, updatedColumns[overContainer].length - 1);

          if (!success) {
            throw new Error(error || "Failed to reorder tasks");
          }
        }

        // Tidak perlu loadTasks() karena UI sudah diupdate
      } catch (error) {
        console.error("Error moving task:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to move task",
          variant: "destructive",
        });
        // Jika terjadi error, muat ulang data untuk memastikan konsistensi
        await loadTasks();
      } finally {
        setActiveTask(null);
      }
    },
    [columns, toast, loadTasks]
  );

  const getStatus = (id: string): Status => {
    switch (id) {
      case "todo":
        return Status.TODO;
      case "inprogress":
        return Status.IN_PROGRESS;
      case "done":
        return Status.DONE;
      default:
        throw new Error(`Invalid status: ${id}`);
    }
  };

  const filteredColumns = useMemo(() => {
    if (!columns) return null;

    const filterTask = (task: Task) => {
      const matchesSearch = searchTerm === "" || task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(task.status);

      return matchesSearch && matchesFilter;
    };

    return {
      todo: columns.todo.filter(filterTask),
      inprogress: columns.inprogress.filter(filterTask),
      done: columns.done.filter(filterTask),
    };
  }, [columns, searchTerm, activeFilters]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header onSearch={setSearchTerm} onFilterChange={setActiveFilters} onTasksChange={loadTasks} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-todoist-red" />
        </div>
      </div>
    );
  }

  const columnData = [
    { id: "todo", title: "To Do", tasks: filteredColumns?.todo || [] },
    { id: "inprogress", title: "In Progress", tasks: filteredColumns?.inprogress || [] },
    { id: "done", title: "Done", tasks: filteredColumns?.done || [] },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header onSearch={setSearchTerm} onFilterChange={setActiveFilters} onTasksChange={loadTasks} />
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex p-4 gap-4 min-w-full h-full">
            <div className="flex gap-4 min-w-max">
              {columnData.map((column) => (
                <Column key={column.id} column={column} onTasksChange={loadTasks} />
              ))}
            </div>
          </div>
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} containerId="" index={-1} isDragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
