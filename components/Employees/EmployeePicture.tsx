import React from 'react';
import { Avatar } from '@mantine/core';

interface EmployeePictureProps {
  imageSrc: string;
}

export function EmployeePicture({ imageSrc }: EmployeePictureProps) {
  return <Avatar src={imageSrc} radius="xl" alt="Employee Picture" />;
}
