import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// No need for BrowserRouter as Next.js handles routing
import TaskCard from '@/components/TaskCard'; // Adjusted import path
import * as api from '@/services/api'; // Adjusted import path
import { Task } from '@/types'; // Adjusted import path

// Mock the API service
jest.mock('@/services/api', () => ({
  updateTaskDone: jest.fn(() => Promise.resolve({ success: true })),
}));

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 'test-1',
    title: 'Test Task',
    description: 'This is a test description',
    priority: 'Medium',
    assignee: 'Tester',
    dueDate: new Date('2025-08-10').toISOString(),
    done: false,
  };

  test('renders task details correctly', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TaskCard task={mockTask} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Tester')).toBeInTheDocument();
    expect(screen.getByText('Aug 10, 2025')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Mark task as done/i })).not.toBeChecked();
  });

  test('checkbox toggles task status and calls API', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TaskCard task={mockTask} />
      </QueryClientProvider>
    );

    const checkbox = screen.getByRole('checkbox', { name: /Mark task as done/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(api.updateTaskDone).toHaveBeenCalledWith({ id: mockTask.id, done: true });
    });
  });

  test('completed task has line-through style and is checked', () => {
    const completedTask: Task = { ...mockTask, done: true };
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TaskCard task={completedTask} />
      </QueryClientProvider>
    );

    const titleElement = screen.getByText('Test Task');
    expect(titleElement).toHaveClass('line-through');
    expect(screen.getByRole('checkbox', { name: /Mark task as done/i })).toBeChecked();
  });

  test('clicking "View Details" navigates to task detail page', () => {
    const queryClient = createTestQueryClient();
    const mockRouterPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockRouterPush });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskCard task={mockTask} />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /View Details/i }));
    expect(mockRouterPush).toHaveBeenCalledWith(`/tasks/${mockTask.id}`);
  });
});