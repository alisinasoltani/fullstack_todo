// components/AddEditSubtaskDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/services/api'; // Adjusted import path
import { Subtask, CreateSubtaskPayload, UpdateSubtaskPayload } from '@/types'; // Adjusted import path

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

interface AddEditSubtaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  parentTaskId: string;
  subtaskToEdit?: Subtask; // Optional, for editing
  onSubtaskAdded?: () => void;
  onSubtaskUpdated?: () => void;
}

const AddEditSubtaskDialog: React.FC<AddEditSubtaskDialogProps> = ({
  isOpen,
  onOpenChange,
  parentTaskId,
  subtaskToEdit,
  onSubtaskAdded,
  onSubtaskUpdated,
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    if (subtaskToEdit) {
      setTitle(subtaskToEdit.title || '');
    } else {
      setTitle(''); // Reset for new subtask
    }
  }, [subtaskToEdit, isOpen]);

  const createSubtaskMutation = useMutation<Subtask, Error, CreateSubtaskPayload>({
    mutationFn: api.createSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', parentTaskId] });
      toast.success('Subtask created successfully!');
      onSubtaskAdded?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create subtask: ${err.message}`);
    },
  });

  const updateSubtaskMutation = useMutation<Subtask, Error, UpdateSubtaskPayload>({
    mutationFn: api.updateSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', parentTaskId] });
      toast.success('Subtask updated successfully!');
      onSubtaskUpdated?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update subtask: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtaskToEdit) {
      updateSubtaskMutation.mutate({ id: subtaskToEdit.id, title });
    } else {
      createSubtaskMutation.mutate({ taskId: parentTaskId, title });
    }
  };

  const isLoading = createSubtaskMutation.isPending || updateSubtaskMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subtaskToEdit ? 'Edit Subtask' : 'Add New Subtask'}</DialogTitle>
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
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (subtaskToEdit ? 'Save Changes' : 'Create Subtask')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditSubtaskDialog;