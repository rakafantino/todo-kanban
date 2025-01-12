import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Hapus data yang ada
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();

  // Buat labels
  const labels = await Promise.all([
    prisma.label.create({
      data: {
        name: "feature",
        color: "#0ea5e9", // sky-500
        description: "New feature or enhancement",
      },
    }),
    prisma.label.create({
      data: {
        name: "bug",
        color: "#ef4444", // red-500
        description: "Something isn't working",
      },
    }),
    prisma.label.create({
      data: {
        name: "documentation",
        color: "#8b5cf6", // violet-500
        description: "Documentation updates",
      },
    }),
    prisma.label.create({
      data: {
        name: "design",
        color: "#f59e0b", // amber-500
        description: "UI/UX improvements",
      },
    }),
    prisma.label.create({
      data: {
        name: "backend",
        color: "#10b981", // emerald-500
        description: "Backend related tasks",
      },
    }),
  ]);

  // Buat tasks satu per satu
  await prisma.task.create({
    data: {
      title: "Implement authentication",
      description: "Add user login and registration functionality",
      status: "TODO",
      priority: 1,
      order: 0,
      labels: {
        connect: [{ id: labels[0].id }, { id: labels[4].id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Fix navigation bug",
      description: "Menu doesn't close on mobile devices",
      status: "IN_PROGRESS",
      priority: 2,
      order: 0,
      labels: {
        connect: [{ id: labels[1].id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Update API documentation",
      description: "Add new endpoints documentation",
      status: "DONE",
      priority: 3,
      order: 0,
      labels: {
        connect: [{ id: labels[2].id }, { id: labels[4].id }],
      },
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
