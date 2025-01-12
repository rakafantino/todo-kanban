# Todo Kanban Board

Aplikasi Kanban Board sederhana yang dibuat dengan Next.js 14, Prisma, dan PostgreSQL.

## 🚀 Features

- Drag and drop task management
- Real-time task status updates
- Label management
- Priority setting
- Due date tracking
- Responsive design

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **UI Components:**
  - Radix UI
  - Tailwind CSS
- **Drag & Drop:** dnd-kit
- **Type Checking:** TypeScript

## 📦 Installation

1. Clone repository

```bash
git clone https://github.com/yourusername/todo-kanban.git
cd todo-kanban
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables (buat file .env):

```env
DATABASE_URL="your-postgres-url"
POSTGRES_URL_NON_POOLING="your-non-pooling-url"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Setup database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Run development server

```bash
npm run dev
```

## 🗄️ Project Structure

```
todo-kanban/
├── app/
│   ├── actions.ts         # Server actions
│   ├── api/              # API routes
│   └── page.tsx          # Main page
├── components/
│   ├── KanbanBoard.tsx   # Main board component
│   ├── Column.tsx        # Column component
│   └── TaskCard.tsx      # Task card component
├── lib/
│   └── prisma.ts         # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── types/
    └── task.ts           # TypeScript types
```

## 🚀 Deployment

1. Push code ke GitHub
2. Setup project di Vercel:
   - Connect repository
   - Setup environment variables:
     ```env
     DATABASE_URL="your-postgres-url"
     POSTGRES_URL_NON_POOLING="your-non-pooling-url"
     ```
   - Deploy!

## 🧪 Development

### Commands

- `npm run dev` - Run development server
- `npm run build` - Build production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run type-check` - Run type checking

## 📄 License

This project is licensed under the MIT License.
