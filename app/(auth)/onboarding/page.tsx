'use client';

import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Alert,
  Flex,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmInvitation } from './actions';
import { validateRequest } from '@/lib/server/actions/user-actions';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      const { user } = await validateRequest();
      if (!user) {
        router.push('/login');
      } else if (user?.firstName && user?.lastName) {
        router.push(`/${user.tenantId}/dashboard`);
      } else {
        setLoading(false);
      }
    };

    validateUser();
  }, []);

  const confirmInvitationform = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      newPassword: '',
    },

    validate: (values) => ({
      firstName: values.firstName.length < 2 ? 'Fornavnet må bestå av minst 2 karakterer' : null,
      lastName: values.lastName.length < 2 ? 'Etternavnet må bestå av minst 2 karakterer' : null,
      newPassword:
        values.newPassword.length < 6 ? 'Passordet må bestå av minst 6 karakterer' : null,
    }),
  });

  const confirmInvitationMutation = useMutation({
    mutationFn: async () => {
      if (confirmInvitationform.validate().hasErrors) throw new Error('Invalid form!');

      const { error, errorMessage } = await confirmInvitation(
        confirmInvitationform.values.firstName,
        confirmInvitationform.values.lastName,
        confirmInvitationform.values.newPassword
      );

      if (error) throw new Error(errorMessage);
    },
    retry: false,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">Velkommen tilbake! Fullfør regisreringsprocessen</Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Flex direction="column" gap="md">
          <TextInput
            data-autofocus
            label="Fornavn"
            placeholder="Ole"
            {...confirmInvitationform.getInputProps('firstName')}
          />
          <TextInput
            label="Etternavn"
            placeholder="Nordmann"
            {...confirmInvitationform.getInputProps('lastName')}
          />
          <PasswordInput
            label="Nytt passord"
            placeholder="Sterk passord"
            {...confirmInvitationform.getInputProps('newPassword')}
          />

          {confirmInvitationMutation.isError && (
            <Alert mt="md" variant="light" color="red" icon={<IconInfoCircle />}>
              {confirmInvitationMutation.error.message}
            </Alert>
          )}

          <Button
            loading={confirmInvitationMutation.isPending}
            leftSection={<IconCheck width="1.4rem" />}
            onClick={() => confirmInvitationMutation.mutate()}
          >
            Bekreft
          </Button>
        </Flex>
      </Paper>
    </Container>
  );
}
