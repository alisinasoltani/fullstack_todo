// components/AddEditTaskDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/services/api'; // Adjusted import path
import { Task, CreateTaskPayload, UpdateTaskPayload, Priority } from '@/types'; // Adjusted import path
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'; // Adjusted import path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';


interface AddEditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: Task; // Optional, for editing
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
}

const AddEditTaskDialog: React.FC<AddEditTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  taskToEdit,
  onTaskCreated,
  onTaskUpdated,
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [assignee, setAssignee] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const availableAssignees: string[] = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Mark Davis']; // Simulate

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setAssignee(taskToEdit.assignee || '');
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined);
    } else {
      // Reset form when adding a new task
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setAssignee('');
      setDueDate(undefined);
    }
  }, [taskToEdit, isOpen]); // Reset when dialog opens or taskToEdit changes

  const createTaskMutation = useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: api.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
      onTaskCreated?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create task: ${err.message}`);
    },
  });

  const updateTaskMutation = useMutation<Task, Error, UpdateTaskPayload>({
    mutationFn: api.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskToEdit?.id] });
      toast.success('Task updated successfully!');
      onTaskUpdated?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update task: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: CreateTaskPayload = {
      title,
      description: description || undefined,
      priority,
      assignee: assignee || undefined,
      dueDate: dueDate ? dueDate.toISOString() : null,
    };

    if (taskToEdit) {
      updateTaskMutation.mutate({ id: taskToEdit.id, ...taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Assignee
            </Label>
            <Select value={assignee} onValueChange={(value: string) => setAssignee(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {availableAssignees.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`col-span-3 justify-start text-left font-normal ${!dueDate && "text-muted-foreground"
                    }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (taskToEdit ? 'Save Changes' : 'Create Task')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTaskDialog;