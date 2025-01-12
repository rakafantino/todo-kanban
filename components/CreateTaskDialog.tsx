"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TaskForm from "./TaskForm";
import { useToast } from "./ui/use-toast";
import { createTask } from "@/app/actions";
import { Status } from "@/types/task";
import { Plus } from "lucide-react";

interface CreateTaskDialogProps {
  onTaskCreated: () => void;
}

export function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: { title: string; description?: string; priority?: number; labels?: string[]; dueDate?: Date }) => {
    try {
      const { success, error } = await createTask({
        ...data,
        status: Status.TODO,
        priority: data.priority || 4,
        labels: data.labels || [],
        dueDate: data.dueDate || null,
      });

      if (!success) {
        throw new Error(error || "Failed to create task");
      }

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      onTaskCreated();
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-todoist-red hover:bg-todoist-red/90">
          <Plus className="h-5 w-5 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm onSubmit={handleSubmit} submitText="Create Task" />
      </DialogContent>
    </Dialog>
  );
}
