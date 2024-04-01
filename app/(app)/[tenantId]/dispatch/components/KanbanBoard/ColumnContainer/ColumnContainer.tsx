import { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Box, Flex } from '@mantine/core';
import { CSS } from '@dnd-kit/utilities';

import { Task } from '../types';
import classes from './ColumnContainer.module.css';
import TaskCard from '../TaskCard/TaskCard';
import { CarType } from '@/app/(app)/[tenantId]/employees/CreateCarRelationModal/types';

interface Props {
  column: CarType;
  tasks: Task[];
}

function ColumnContainer(props: Props) {
  const { column, tasks } = props;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  if (isDragging) {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        className={`${classes.container} ${classes.isDragging}`}
      />
    );
  }

  return (
    <Box ref={setNodeRef} style={style} className={classes.container}>
      <Box {...attributes} {...listeners} className={classes.title}>
        <Flex gap="0.5rem">
          <div className={classes.taskNumber}>0</div>
          {column.regnr}
        </Flex>
      </Box>

      <Box className={classes.taskContainer}>
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
}

export default ColumnContainer;
