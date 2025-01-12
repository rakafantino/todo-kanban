export enum Status {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  labels: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}
