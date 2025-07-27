// app/tasks/[id]/page.tsx
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Changed from react-router-dom
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/services/api'; // Adjusted import path
import { Task, Subtask, Priority } from '@/types'; // Adjusted import path

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronDownIcon, PlusCircledIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';


import AddEditTaskDialog from '@/components/AddEditTaskDialog';
import AddEditSubtaskDialog from '@/components/AddEditSubtaskDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';


const TaskDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string; // Type assertion for route param
  const router = useRouter(); // Changed from useNavigate
  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSubtaskDeleteDialogOpen, setIsSubtaskDeleteDialogOpen] = useState<boolean>(false);
  const [selectedSubtask, setSelectedSubtask] = useState<string | null>(null);
  const [subtaskToEdit, setSubtaskToEdit] = useState<Subtask | undefined>(undefined);


  const { data: task, isLoading, isError, error } = useQuery<Task, Error>({
    queryKey: ['task', id],
    queryFn: () => api.getTaskByID(id),
    enabled: !!id, // Only fetch if id exists
  });

  const { data: subtasks, isLoading: isLoadingSubtasks, isError: isErrorSubtasks } = useQuery<Subtask[], Error>({
    queryKey: ['subtasks', id],
    queryFn: () => api.getSubtasks(id),
    enabled: !!task, // Only fetch subtasks if task data is available
  });

  const updateTaskDoneMutation = useMutation<Task, Error, { id: string; done: boolean }>({
    mutationFn: api.updateTaskDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated.');
    },
    onError: (err: Error) => toast.error(`Failed to update task status: ${err.message}`),
  });

  const deleteTaskMutation = useMutation<any, Error, string>({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully.');
      router.push('/'); // Go back to task list after deletion
    },
    onError: (err: Error) => toast.error(`Failed to delete task: ${err.message}`),
  });

  const updateSubtaskDoneMutation = useMutation<Subtask, Error, { id: string; done: boolean }>({
    mutationFn: api.updateSubtaskDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', id] });
      toast.success('Subtask status updated.');
    },
    onError: (err: Error) => toast.error(`Failed to update subtask status: ${err.message}`),
  });

  const deleteSubtaskMutation = useMutation<any, Error, string>({
    mutationFn: api.deleteSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', id] });
      toast.success('Subtask deleted successfully.');
    },
    onError: (err: Error) => toast.error(`Failed to delete subtask: ${err.message}`),
  });


  if (isLoading) return <div>Loading task details...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  if (!task) return <div>Task not found.</div>;

  const handleTaskDoneChange = (checked: boolean) => {
    updateTaskDoneMutation.mutate({ id: task.id, done: checked });
  };

  const handleSubtaskDoneChange = (subtaskId: string, checked: boolean) => {
    updateSubtaskDoneMutation.mutate({ id: subtaskId, done: checked });
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate(task.id);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSelectedSubtask(subtaskId);
    setIsSubtaskDeleteDialogOpen(true);
  };

  const confirmDeleteSubtask = () => {
    if (selectedSubtask) {
      deleteSubtaskMutation.mutate(selectedSubtask);
      setIsSubtaskDeleteDialogOpen(false);
      setSelectedSubtask(null);
    }
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setSubtaskToEdit(subtask);
    setIsAddSubtaskDialogOpen(true);
  };

  const handleSubtaskDialogClose = () => {
    setSubtaskToEdit(undefined);
    setIsAddSubtaskDialogOpen(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-3xl font-bold ${task.done ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="taskDone"
            checked={task.done}
            onCheckedChange={(checked: boolean) => handleTaskDoneChange(checked)}
            className="w-5 h-5"
          />
          <label htmlFor="taskDone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Mark as Done
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <p><strong>Assignee:</strong> {task.assignee || 'Unassigned'}</p>
          <p className="flex items-center">
            <strong>Due Date:</strong>{' '}
            {task.dueDate ? (
              <>
                <CalendarIcon className="ml-1 mr-1 h-4 w-4" /> {format(new Date(task.dueDate), 'PPP')}
              </>
            ) : (
              'No due date'
            )}
          </p>
          <p>
            <strong>Priority:</strong>{' '}
            <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
          </p>
        </div>
        <div>
          <p><strong>Description:</strong> {task.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
          <Pencil2Icon className="mr-2 h-4 w-4" /> Edit Task
        </Button>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
          <TrashIcon className="mr-2 h-4 w-4" /> Delete Task
        </Button>
      </div>

      <Separator />

      {/* Subtasks Section */}
      <Collapsible className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Subtasks ({subtasks ? subtasks.length : 0})</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDownIcon className="h-4 w-4" />
              <span className="sr-only">Toggle Subtasks</span>
            </Button>
          </CollapsibleTrigger>
          <Button variant="outline" size="sm" onClick={() => setIsAddSubtaskDialogOpen(true)}>
            <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Subtask
          </Button>
        </div>
        <CollapsibleContent className="space-y-3">
          {isLoadingSubtasks ? (
            <div>Loading subtasks...</div>
          ) : isErrorSubtasks ? (
            <div>Error loading subtasks.</div>
          ) : subtasks?.length === 0 ? (
            <p className="text-gray-500">No subtasks yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {subtasks?.map((subtask) => (
                <li key={subtask.id} className={`flex items-center justify-between py-1 ${subtask.done ? 'line-through text-gray-500' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`subtask-${subtask.id}`}
                      checked={subtask.done}
                      onCheckedChange={(checked: boolean) => handleSubtaskDoneChange(subtask.id, checked)}
                    />
                    <label htmlFor={`subtask-${subtask.id}`} className="cursor-pointer">
                      {subtask.title}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSubtask(subtask)}>
                      <Pencil2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSubtask(subtask.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Modals/Dialogs */}
      <AddEditTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        taskToEdit={task}
        onTaskUpdated={() => setIsEditDialogOpen(false)}
      />

      <AddEditSubtaskDialog
        isOpen={isAddSubtaskDialogOpen}
        onOpenChange={handleSubtaskDialogClose}
        parentTaskId={task.id}
        subtaskToEdit={subtaskToEdit}
        onSubtaskAdded={() => handleSubtaskDialogClose()}
        onSubtaskUpdated={() => handleSubtaskDialogClose()}
      />

      <DeleteConfirmationDialog
        isOpen={isSubtaskDeleteDialogOpen}
        onOpenChange={setIsSubtaskDeleteDialogOpen}
        onConfirm={confirmDeleteSubtask}
        title="Delete Subtask"
        description="Are you sure you want to delete this subtask? This action cannot be undone."
      />
    </div>
  );
};

export default TaskDetailPage;