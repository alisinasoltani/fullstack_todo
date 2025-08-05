// components/TaskCard.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// Assuming these types and API functions are available
import * as api from '@/services/api';
import { Task, Priority } from '@/types';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  assignees: string[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, assignees }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // New mutation hook with optimistic updates
  const updateTaskDoneMutation = useMutation({
    mutationFn: api.updateTaskDone,
    
    // onMutate is called before the mutation function fires.
    // It allows us to optimistically update the cache.
    onMutate: async (newTaskData: { id: string; done: boolean }) => {
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot the previous value of the 'tasks' query
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Optimistically update the cache for the 'tasks' list
      queryClient.setQueryData<Task[]>(['tasks'], oldTasks =>
        oldTasks?.map(t =>
          t.id === newTaskData.id ? { ...t, done: newTaskData.done } : t
        )
      );
      
      // Also optimistically update the individual task cache
      queryClient.setQueryData<Task>(['task', task.id], oldTask => {
        if (oldTask) {
          return { ...oldTask, done: newTaskData.done };
        }
        return oldTask;
      });

      // Return a context object with the snapshot value
      return { previousTasks };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      toast.error(`Failed to update task status: ${err.message}`);
      // Roll back to the previous data
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    
    // Always refetch after error or success to ensure the client is in sync with the server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
    },
    onSuccess: () => {
      toast.success('Task status updated.');
    }
  });

  const handleDoneChange = (checked: boolean) => {
    updateTaskDoneMutation.mutate({ id: task.id, done: checked });
  };

  const getPriorityVariant = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'default';
    }
  };

  console.log("rerender");

  return (
    <Card className={`relative ${task.done ? 'opacity-70 border-gray-300' : 'border-blue-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg ${task.done ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </CardTitle>
        <CardDescription>
          <Badge variant={getPriorityVariant(task.priority)} className="mr-2">
            {task.priority}
          </Badge>
          <span>{task.assignee || 'Unassigned'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4" />
          <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`task-${task.id}-done`}
            checked={task.done}
            onCheckedChange={handleDoneChange}
            aria-label="Mark task as done"
          />
          <label htmlFor={`task-${task.id}-done`} className="text-sm cursor-pointer">
            Done
          </label>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button variant="outline" className="w-full" onClick={() => router.push(`/tasks/${task.id}`)}>
          View Details <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default React.memo(TaskCard);
