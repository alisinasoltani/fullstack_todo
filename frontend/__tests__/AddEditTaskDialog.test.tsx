import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddEditTaskDialog from '@/components/AddEditTaskDialog'; // Adjusted import path
import * as api from '@/services/api'; // Adjusted import path
import { Task } from '@/types'; // Adjusted import path

// Mock API calls
jest.mock('@/services/api', () => ({
  createTask: jest.fn(() => Promise.resolve({ id: 'new-task', title: 'New Task' })),
  updateTask: jest.fn(() => Promise.resolve({ id: 'existing-task', title: 'Updated Task' })),
}));

// Mock toast notifications to prevent actual calls in tests
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AddEditTaskDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnTaskCreated = jest.fn();
  const mockOnTaskUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders "Add New Task" form correctly', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AddEditTaskDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          onTaskCreated={mockOnTaskCreated}
        />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Add New Task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText('Select priority')).toBeInTheDocument();
    expect(screen.getByText('Select assignee')).toBeInTheDocument();
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeInTheDocument();
  });

  test('renders "Edit Task" form with pre-filled data', () => {
    const mockTask: Task = {
      id: 'task-123',
      title: 'Existing Task',
      description: 'Existing Desc',
      priority: 'High',
      assignee: 'Jane Smith',
      dueDate: new Date('2025-09-15').toISOString(),
      done: false,
    };
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AddEditTaskDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          taskToEdit={mockTask}
          onTaskUpdated={mockOnTaskUpdated}
        />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Task');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Existing Desc');
    expect(screen.getByText('High')).toBeInTheDocument(); // For select
    expect(screen.getByText('Jane Smith')).toBeInTheDocument(); // For select
    expect(screen.getByText('Sep 15, 2025')).toBeInTheDocument(); // For date picker
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  test('submits new task correctly', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AddEditTaskDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          onTaskCreated={mockOnTaskCreated}
        />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Test Task' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Test Task' })
      );
    });

    await waitFor(() => {
      expect(mockOnTaskCreated).toHaveBeenCalledTimes(1);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(require('sonner').toast.success).toHaveBeenCalledWith('Task created successfully!');
    });
  });

  test('submits updated task correctly', async () => {
    const mockTask: Task = {
      id: 'task-123',
      title: 'Existing Task',
      description: 'Existing Desc',
      priority: 'Medium',
      assignee: 'John Doe',
      dueDate: null,
      done: false,
    };
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AddEditTaskDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          taskToEdit={mockTask}
          onTaskUpdated={mockOnTaskUpdated}
        />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Task Title' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task-123', title: 'Updated Task Title' })
      );
    });

    await waitFor(() => {
      expect(mockOnTaskUpdated).toHaveBeenCalledTimes(1);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(require('sonner').toast.success).toHaveBeenCalledWith('Task updated successfully!');
    });
  });

  test('displays error toast on API failure', async () => {
    (api.createTask as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AddEditTaskDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          onTaskCreated={mockOnTaskCreated}
        />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Failing Task' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to create task'));
    });
    expect(mockOnTaskCreated).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });
});