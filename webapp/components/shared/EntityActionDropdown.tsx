"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Plus, FileText, HelpCircle, MessageSquare, BookOpen, FileStack } from "lucide-react";

interface EntityActionDropdownProps {
  entity: any;
  entityType: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddMCQ: (entityId: string) => void;
  onAddFAQ: (entityId: string) => void;
  onAddDescriptiveQuestion: (entityId: string) => void;
  onAddTopic?: (entityId: string) => void;
  onAddSubtopic?: (entityId: string) => void;
  onAddGBTopic?: (entityId: string) => void;
  onAddGBSubtopic?: (entityId: string) => void;
}

export function EntityActionDropdown({
  entity,
  entityType,
  onEdit,
  onDelete,
  onAddMCQ,
  onAddFAQ,
  onAddDescriptiveQuestion,
  onAddTopic,
  onAddSubtopic,
  onAddGBTopic,
  onAddGBSubtopic,
}: EntityActionDropdownProps) {
  // Safety check to prevent undefined entity errors
  if (!entity) {
    return null;
  }
  
  const entityId = entity._id || entity.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        {onAddTopic && (
          <DropdownMenuItem onClick={() => onAddTopic(entityId)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Add Topic
          </DropdownMenuItem>
        )}
        {onAddSubtopic && (
          <DropdownMenuItem onClick={() => onAddSubtopic(entityId)}>
            <FileStack className="mr-2 h-4 w-4" />
            Add Subtopic
          </DropdownMenuItem>
        )}
        {onAddGBTopic && (
          <DropdownMenuItem onClick={() => onAddGBTopic(entityId)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Add GB Topic
          </DropdownMenuItem>
        )}
        {onAddGBSubtopic && (
          <DropdownMenuItem onClick={() => onAddGBSubtopic(entityId)}>
            <FileStack className="mr-2 h-4 w-4" />
            Add GB Subtopic
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAddMCQ(entityId)}>
          <Plus className="mr-2 h-4 w-4" />
          Add MCQ
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddFAQ(entityId)}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Add FAQ
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddDescriptiveQuestion(entityId)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Add Descriptive Question
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 