"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as api from '@/services/api';
import { Task, GetTasksQueryParams } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircledIcon, ReloadIcon } from '@radix-ui/react-icons';

import TaskCard from '@/components/TaskCard';
import AddEditTaskDialog from '@/components/AddEditTaskDialog';

// Utility function for deep comparison of arrays
const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const AddTaskButtonAndDialog: React.FC = () => {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setIsAddTaskDialogOpen(true)}>
        <PlusCircledIcon className="mr-2 h-4 w-4" /> Add New Task
      </Button>
      <AddEditTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onTaskCreated={() => setIsAddTaskDialogOpen(false)}
      />
    </>
  );
};

const page: React.FC = () => {
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'completed' | 'pending' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  const queryParams: GetTasksQueryParams = {
    assignee: filterAssignee === 'all' ? undefined : filterAssignee,
    status: filterStatus === 'all' ? undefined : filterStatus,
    sortBy: sortBy,
  };

  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError, error: tasksError } = useQuery<Task[], Error>({
    queryKey: ['tasks', queryParams],
    queryFn: () => api.getTasks(queryParams),
    staleTime: 5 * 60 * 1000, // Cache tasks for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
  });

  const {
    data: assignees = [],
    isLoading: isAssigneesLoading,
    isError: isAssigneesError,
    error: assigneesError,
    refetch: refetchAssignees,
    isRefetching: isAssigneesRefetching,
  } = useQuery<string[], Error>({
    queryKey: ['assignees'],
    queryFn: api.getAssignees,
    staleTime: 10 * 60 * 1000, // Cache assignees for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep cache for 15 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  // Use useRef to persist the previous assignees across renders
  const previousAssigneesRef = useRef<string[]>(assignees);

  // Memoize assignees with deep comparison to prevent unnecessary updates
  const memoizedAssignees = useMemo(() => {
    console.log('Computing memoizedAssignees'); // Debug: Check when this runs
    const currentAssignees = assignees;
    const previousAssignees = previousAssigneesRef.current;

    // Update the ref for the next render
    previousAssigneesRef.current = currentAssignees;

    // Return the previous array if the content hasn't changed
    return arraysEqual(previousAssignees, currentAssignees) ? previousAssignees : [...currentAssignees];
  }, [assignees]);

  // Debug: Log when the component renders
  console.log('Rendering TaskListPage', { tasksLength: tasks.length, assigneesLength: memoizedAssignees.length });

  if (isTasksLoading || isAssigneesLoading) {
    console.log('Showing loading state');
    return <div>Loading tasks and assignees...</div>;
  }
  if (isTasksError) {
    console.log('Tasks error:', tasksError?.message);
    return <div>Error loading tasks: {tasksError?.message || 'Unknown error'}</div>;
  }
  if (isAssigneesError) {
    console.log('Assignees error:', assigneesError?.message);
    return <div>Error loading assignees: {assigneesError?.message || 'Unknown error'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <div className="flex gap-2">
          <AddTaskButtonAndDialog />
          <Button onClick={() => refetchAssignees()} disabled={isAssigneesRefetching}>
            {isAssigneesRefetching ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ReloadIcon className="mr-2 h-4 w-4" />
            )}
            Refresh Assignees
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select onValueChange={setFilterAssignee} value={filterAssignee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {memoizedAssignees.map(assignee => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value: 'completed' | 'pending' | 'all') => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value: 'dueDate' | 'priority') => setSortBy(value)} value={sortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} assignees={memoizedAssignees} />)
        ) : (
          <div>No tasks available</div>
        )}
      </div>
    </div>
  );
};

export default page;