import { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Box, Flex } from '@mantine/core';
import { CSS } from '@dnd-kit/utilities';

import classes from './ColumnContainer.module.css';
import { CarType } from '../../../../trucks/types';
import { JobDetails } from '@/app/(app)/[tenantId]/jobs/types';
import { JobCard } from '@/app/(app)/[tenantId]/jobs/JobCard/JobCard';

interface Props {
  column: Partial<CarType>;
  tasks: JobDetails[];
}

function ColumnContainer(props: Props) {
  const { column, tasks } = props;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id!,
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
        <Flex gap="0.5rem" align="center">
          <div className={classes.taskNumber}>{tasks.length}</div>
          {column.regnr}
        </Flex>
      </Box>

      <Box className={classes.taskContainer}>
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <JobCard key={task.id} job={task} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
}

export default ColumnContainer;
