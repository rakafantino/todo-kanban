"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { LabelSelector } from "./LabelSelector";

interface TaskFormProps {
  onSubmit: (data: { title: string; description?: string; priority?: number; labels?: string[]; dueDate?: Date }) => void;
  task?: Task;
  submitText?: string;
}

export default function TaskForm({ onSubmit, task, submitText = "Create Task" }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || 4);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labels.map((l) => l.id) || []);
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      priority,
      labels: selectedLabels,
      dueDate: dueDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title
        </Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="w-full" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description" className="w-full min-h-[100px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Due Date</Label>
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
        <LabelSelector selectedLabels={selectedLabels} onChange={setSelectedLabels} />
      </div>

      <Button type="submit" className="w-full bg-todoist-red hover:bg-todoist-red/90 text-white">
        {submitText}
      </Button>
    </form>
  );
}
