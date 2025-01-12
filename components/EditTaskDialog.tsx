"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "./ui/use-toast";
import { updateTask, getLabels } from "@/app/actions";
import { Task } from "@/types/task";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface EditTaskDialogProps {
  task: Task;
  trigger: React.ReactNode;
  onTaskUpdated?: () => void;
}

export function EditTaskDialog({ task, trigger, onTaskUpdated }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate ? new Date(task.dueDate) : undefined);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels.map((l) => l.id));
  const [labels, setLabels] = useState<Array<{ id: string; name: string; color?: string | null }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const loadLabels = async () => {
    const { labels: fetchedLabels, error } = await getLabels();
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      setLabels(fetchedLabels);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success, error } = await updateTask(task.id, {
        title,
        description,
        status: task.status,
        priority: task.priority,
        dueDate,
        labels: {
          set: selectedLabels.map((id) => ({ id })),
        },
      });

      if (!success) {
        throw new Error(error || "Failed to update task");
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      onTaskUpdated?.();
      setOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description" />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="rounded-md border">
              <ScrollArea className="h-[145px]">
                <div className="p-4 space-y-3">
                  {labels.map((label) => (
                    <div key={label.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={label.id}
                        checked={selectedLabels.includes(label.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLabels([...selectedLabels, label.id]);
                          } else {
                            setSelectedLabels(selectedLabels.filter((id) => id !== label.id));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        {label.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />}
                        <label htmlFor={label.id} className="text-sm font-medium leading-none cursor-pointer">
                          {label.name}
                        </label>
                      </div>
                    </div>
                  ))}
                  {labels.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No labels available</div>}
                </div>
              </ScrollArea>
            </div>
          </div>

          <Button type="submit" className="w-full bg-todoist-red hover:bg-todoist-red/90">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
