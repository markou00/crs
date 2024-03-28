import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import classes from './TaskCard.module.css';

interface Props {
  task: Task;
}

function TaskCard({ task }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={classes.card}>
      {task.content}
    </div>
  );
}

export default TaskCard;
