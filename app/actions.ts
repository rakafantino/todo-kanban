"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Status } from "@/types/task";
import { Prisma } from "@prisma/client";

interface ActionResponse {
  success: boolean;
  error: string | null;
}

interface TasksResponse {
  columns: {
    todo: Task[];
    inprogress: Task[];
    done: Task[];
  };
  error: string | null;
}

interface LabelsResponse {
  labels: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  error: string | null;
}

export async function getTasks(): Promise<TasksResponse> {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        labels: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const mapStatus = (status: string): Status => {
      switch (status) {
        case "TODO":
          return Status.TODO;
        case "IN_PROGRESS":
          return Status.IN_PROGRESS;
        case "DONE":
          return Status.DONE;
        default:
          return Status.TODO;
      }
    };

    const columns = {
      todo: tasks.filter((task) => mapStatus(task.status) === Status.TODO),
      inprogress: tasks.filter((task) => mapStatus(task.status) === Status.IN_PROGRESS),
      done: tasks.filter((task) => mapStatus(task.status) === Status.DONE),
    };

    return { columns, error: null };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      columns: {
        todo: [],
        inprogress: [],
        done: [],
      },
      error: "Failed to fetch tasks",
    };
  }
}

export async function updateTaskStatus(taskId: string, status: Status): Promise<ActionResponse> {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function createTask(data: { title: string; description?: string; status: Status; priority: number; labels: string[]; dueDate?: Date | null }): Promise<ActionResponse> {
  try {
    await prisma.task.create({
      data: {
        ...data,
        description: data.description || "",
        dueDate: data.dueDate || null,
        labels: {
          connect: data.labels.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: Status;
    priority?: number;
    dueDate?: Date | null;
    labels?: {
      set: Array<{ id: string }>;
    };
  }
): Promise<ActionResponse> {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        labels: data.labels,
      },
    });

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  try {
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

export async function reorderTasks(taskId: string, sourceStatus: Status, destinationStatus: Status, newOrder: number): Promise<ActionResponse> {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Dapatkan semua tugas di kolom tujuan
      const tasksInDestination = await tx.task.findMany({
        where: { status: destinationStatus },
        orderBy: { order: "asc" },
      });

      // Jika berpindah dalam kolom yang sama
      if (sourceStatus === destinationStatus) {
        const task = tasksInDestination.find((t: Task) => t.id === taskId);
        const oldOrder = task?.order || 0;

        if (newOrder > oldOrder) {
          await tx.task.updateMany({
            where: {
              status: destinationStatus,
              order: { gt: oldOrder, lte: newOrder },
            },
            data: { order: { decrement: 1 } },
          });
        } else {
          await tx.task.updateMany({
            where: {
              status: destinationStatus,
              order: { gte: newOrder, lt: oldOrder },
            },
            data: { order: { increment: 1 } },
          });
        }
      } else {
        // Pindah ke kolom yang berbeda
        // Kurangi urutan di kolom sumber
        await tx.task.updateMany({
          where: {
            status: sourceStatus,
            order: { gt: newOrder },
          },
          data: { order: { decrement: 1 } },
        });

        // Tambah urutan di kolom tujuan
        await tx.task.updateMany({
          where: {
            status: destinationStatus,
            order: { gte: newOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      // Update tugas yang dipindahkan
      await tx.task.update({
        where: { id: taskId },
        data: {
          status: destinationStatus,
          order: newOrder,
        },
      });
    });

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder tasks",
    };
  }
}

export async function getLabels(): Promise<LabelsResponse> {
  try {
    const labels = await prisma.label.findMany({
      orderBy: { name: "asc" },
    });
    return { labels, error: null };
  } catch (error) {
    console.error("Error fetching labels:", error);
    return { labels: [], error: "Failed to fetch labels" };
  }
}
