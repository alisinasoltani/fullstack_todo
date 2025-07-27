# Task Manager Application

A comprehensive task management application built with a Next.js (App Router) frontend and a Go backend, featuring task creation, editing, deletion, status tracking, and subtasks.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Features

This application provides a robust set of features for managing your tasks:

- **Add New Task**: Create new tasks with a title, description, priority, assignee, and due date.
- **Edit Task**: Modify existing tasks, including all their properties.
- **Delete Task**: Remove tasks from the list.
- **Task Details**: Each task includes:
  - **Priority**: Categorized as Low, Medium, or High.
  - **Assignee**: Free text (simulated dropdown with pre-defined users).
  - **Due Date**: Selectable via a date picker.
- **Subtasks**:
  - Each task can have zero or more subtasks.
  - Subtasks support add, edit, and delete operations.
  - Subtasks can be marked as done/undone.
- **Mark Task as Done**: Tasks and subtasks can be marked as completed or uncompleted, with visual distinction.
- **Visual Distinction**: Completed tasks and subtasks are visually differentiated (e.g., strike-through, reduced opacity).
- **Collapsible Subtasks**: Subtasks are displayed in a collapsible section under their parent task for better organization.
- **Task Filtering**: Filter tasks by assignee or status (completed/pending).
- **Task Sorting**: Sort tasks by due date or priority.

## Technologies Used

### Frontend

- **Next.js 14+ (App Router)**: React framework for building full-stack web applications.
- **TypeScript**: Strongly typed JavaScript for enhanced code quality and maintainability.
- **React Query (TanStack Query)**: Powerful data fetching, caching, and state management library.
- **Shadcn UI**: Beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Sonner**: A modern toast notification library.
- **date-fns**: A comprehensive utility library for date manipulation.
- **Jest**: JavaScript testing framework.
- **React Testing Library**: For testing React components in a user-centric way.

### Backend

- **Go (Golang)**: Programming language for building scalable and efficient backend services.
- **Fiber**: A fast and flexible web framework for Go.
- **MySQL**: Relational database management system.
- **GORM**: ORM library for Go.
- **Validator**: Input validation library for Go.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher (LTS recommended). [Download Node.js](https://nodejs.org/)
- **npm** (Node Package Manager) or **Yarn** / **pnpm**: Comes with Node.js, or install separately.
  - `npm install -g yarn` (if you prefer Yarn)
  - `npm install -g pnpm` (if you prefer pnpm)
- **Go (Golang)**: Required for running the backend. [Download Go](https://golang.org/dl/)
- **MySQL**: Relational database management system. [Download MySQL](https://dev.mysql.com/downloads/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   # or yarn install
   # or pnpm install
   ```

3. **Set up Shadcn UI (if not already done)**:
   If Shadcn UI components are not yet initialized:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input dialog select calendar checkbox card collapsible separator textarea badge alert-dialog dropdown-menu
   ```
   Follow the prompts to configure Tailwind CSS and `components.json`.

4. **Install backend dependencies**:
   ```bash
   cd ../backend
   go mod tidy
   ```

5. **Set up the database**:
   - Create a MySQL database named `task_manager`.
   - Update the database connection settings in `backend/config/config.go` if necessary (e.g., username, password, host).

6. **Run database migrations**:
   ```bash
   cd backend
   go run cmd/migrate/main.go
   ```

### Running the Development Server

1. **Run the backend server**:
   ```bash
   cd backend
   go run cmd/server/main.go
   ```
   The backend typically runs on `http://localhost:8080` (adjust if configured differently).

2. **Run the frontend development server**:
   ```bash
   cd frontend
   npm run dev
   # or yarn dev
   # or pnpm dev
   ```
   The frontend runs on `http://localhost:3000`.

3. **Connect frontend to backend**:
   - Update `frontend/services/api.ts` to point to the backend URL (e.g., `http://localhost:8080`) instead of using mock data.
   - Ensure environment variables (e.g., in `.env.local`) are set if needed:
     ```bash
     NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
     ```

4. Open `http://localhost:3000` in your browser to see the application.

## API Endpoints

The backend provides the following RESTful API endpoints:

| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| POST   | `/tasks`              | Create a new task            |
| GET    | `/tasks`              | Get all tasks (with filters/sort) |
| GET    | `/tasks/:id`          | Get a task by ID             |
| PUT    | `/tasks/:id`          | Update an existing task      |
| DELETE | `/tasks/:id`          | Delete a task                |
| PATCH  | `/tasks/:id/done`     | Mark a task as done/undone   |
| POST   | `/tasks/:id/subtasks` | Create a subtask for a task  |
| GET    | `/tasks/:id/subtasks` | Get all subtasks for a task  |
| PUT    | `/subtasks/:id`       | Update an existing subtask   |
| DELETE | `/subtasks/:id`       | Delete a subtask             |
| PATCH  | `/subtasks/:id/done`  | Mark a subtask as done/undone|

## Running Tests

The project includes unit and component tests for both frontend and backend.

### Frontend Tests

1. **Ensure Jest configuration is correct**:
   - Verify `jest.config.ts` and `jest.setup.ts` in the `frontend` directory.
   - The `moduleNameMapper` in `jest.config.ts` maps `@/` to the `src` directory.

2. **Run all frontend tests once**:
   ```bash
   cd frontend
   npm run test
   # or yarn test
   # or pnpm test
   ```

3. **Run frontend tests in watch mode (for development)**:
   ```bash
   cd frontend
   npm run test:watch
   # or yarn test:watch
   # or pnpm test:watch
   ```

### Backend Tests

1. **Run backend tests**:
   ```bash
   cd backend
   go test ./...
   ```

## Project Structure

The project is organized into `frontend` and `backend` directories:

```
my-task-app/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout for the application
│   │   ├── page.tsx               # Main Task List page
│   │   └── tasks/
│   │       └── [id]/
│   │           └── page.tsx       # Dynamic route for Task Detail page
│   ├── components/
│   │   ├── ui/                    # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── AddEditTaskDialog.tsx  # Dialog for adding/editing tasks
│   │   ├── AddEditSubtaskDialog.tsx # Dialog for adding/editing subtasks
│   │   ├── DeleteConfirmationDialog.tsx # Confirmation dialog
│   │   └── TaskCard.tsx           # Component for task summary
│   ├── providers/
│   │   └── ReactQueryProvider.tsx # React Query context provider
│   ├── services/
│   │   └── api.ts                 # API service (update for backend calls)
│   ├── types.ts                   # TypeScript types
│   ├── public/                    # Static assets
│   ├── .env.local                 # Environment variables
│   ├── jest.config.ts             # Jest configuration
│   ├── jest.setup.ts              # Jest setup
│   ├── next.config.mjs            # Next.js configuration
│   ├── package.json              # Frontend dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── tailwind.config.ts         # Tailwind CSS configuration
├── backend/
│   ├── cmd/
│   │   ├── server/
│   │   │   └── main.go            # Backend server entry point
│   │   └── migrate/
│   │       └── main.go            # Database migration script
│   ├── config/
│   │   └── config.go              # Configuration settings
│   ├── handlers/
│   │   ├── tasks.go               # Task-related HTTP handlers
│   │   └── subtasks.go            # Subtask-related HTTP handlers
│   ├── models/
│   │   ├── task.go                # Task data model
│   │   └── subtask.go             # Subtask data model
│   ├── repositories/
│   │   ├── task_repository.go     # Task database operations
│   │   └── subtask_repository.go  # Subtask database operations
│   ├── services/
│   │   ├── task_service.go        # Task business logic
│   │   └── subtask_service.go     # Subtask business logic
│   ├── go.mod                     # Go module dependencies
│   └── go.sum                     # Go dependency checksums
└── README.md                      # Project documentation
```

## Future Enhancements

- **User Authentication**: Implement login/registration and associate tasks with users.
- **Real-time Updates**: Use WebSockets for instant task/subtask updates.
- **Drag-and-Drop Reordering**: Enable reordering of tasks and subtasks.
- **Notifications**: Add in-app or push notifications for due dates.
- **Advanced Filtering/Sorting**: Support complex filter combinations and custom sorting.
- **Search Functionality**: Implement global search across tasks and subtasks.
- **Dark Mode**: Add a dark theme for the UI.
- **Form Validation**: Enhance client-side form validation.
- **API Documentation**: Generate API docs using tools like Swagger.

## License

This project is open-source and available under the MIT License.