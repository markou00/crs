import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import classes from './TaskCard.module.css';
import { JobDetails } from '@/app/(app)/[tenantId]/jobs/types';

interface Props {
  task: JobDetails;
}

function TaskCard({ task }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id?.toString()!,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className={`${classes.card} ${classes.isDragging}`} />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={classes.card} />
  );
}

export default TaskCard;
