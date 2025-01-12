export enum Status {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface Label {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: number;
  dueDate: Date | null;
  order: number;
  labels: Label[];
  createdAt: Date;
  updatedAt: Date;
}
