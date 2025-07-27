// components/TaskCard.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; // Changed from react-router-dom
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/services/api'; // Adjusted import path
import { Task, Priority } from '@/types'; // Adjusted import path

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Adjusted import path
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const router = useRouter(); // Changed from useNavigate
  const queryClient = useQueryClient();

  const updateTaskDoneMutation = useMutation({
    mutationFn: api.updateTaskDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      toast.success('Task status updated.');
    },
    onError: (err: Error) => toast.error(`Failed to update task status: ${err.message}`),
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
            onCheckedChange={(checked: boolean) => handleDoneChange(checked)}
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

export default TaskCard;