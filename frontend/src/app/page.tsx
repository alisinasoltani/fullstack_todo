// app/page.tsx
"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as api from '@/services/api';
import { Task, GetTasksQueryParams } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircledIcon } from '@radix-ui/react-icons';

import TaskCard from '@/components/TaskCard';
import AddEditTaskDialog from '@/components/AddEditTaskDialog';

const TaskListPage: React.FC = () => {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);
  // Change initial states and type to reflect the new "all" value
  const [filterAssignee, setFilterAssignee] = useState<string>('all'); // Initialize with 'all'
  const [filterStatus, setFilterStatus] = useState<'completed' | 'pending' | 'all'>('all'); // Initialize with 'all'
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  const queryParams: GetTasksQueryParams = {
    // Pass undefined or null if 'all' is selected, so your API doesn't filter
    assignee: filterAssignee === 'all' ? undefined : filterAssignee,
    status: filterStatus === 'all' ? undefined : filterStatus,
    sortBy: sortBy,
  };

  const { data: tasks, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['tasks', queryParams],
    queryFn: () => api.getTasks(queryParams),
  });

  const availableAssignees: string[] = ['John Doe', 'Jane Smith', 'Alice Johnson'];

  if (isLoading) return <div>Loading tasks...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <Button onClick={() => setIsAddTaskDialogOpen(true)}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </div>

      {/* Filters and Sort */}
      <div className="flex gap-4 mb-6">
        <Select onValueChange={setFilterAssignee} value={filterAssignee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem> {/* <-- CHANGED VALUE */}
            {availableAssignees.map(assignee => (
              <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value: 'completed' | 'pending' | 'all') => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem> {/* <-- CHANGED VALUE */}
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
        {tasks?.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <AddEditTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onTaskCreated={() => setIsAddTaskDialogOpen(false)}
      />
    </div>
  );
};

export default TaskListPage;