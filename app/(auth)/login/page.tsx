'use client';

import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Alert,
  Modal,
  Flex,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { confirmInvitation, getUser } from '@/lib/server/actions/user-actions';

export default function LoginPage() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [tenantId, setTenantId] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: (values) => ({
      email: /^\S+@\S+.+\S$/.test(values.email) ? null : 'Ugyldig e-post adress!',
      password: values.password.length < 6 ? 'Passordet må bestå av minst 6 karakterer' : null,
    }),
  });

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

  const supabase = createClientComponentClient();

  const signInMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) return;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.values.email,
        password: form.values.password,
      });

      if (error) throw new Error(error.message);
      const _tenantId = data.user.user_metadata.tenantId;

      const { user } = await getUser(data.user.email!);

      if (!user?.firstName && !user?.lastName) {
        setTenantId(_tenantId);
        open();
      } else {
        router.push(`/${_tenantId}/dashboard`);
      }
    },
    retry: false,
  });

  const confirmInvitationMutation = useMutation({
    mutationFn: async () => {
      if (confirmInvitationform.validate().hasErrors) throw new Error('Invalid form!');

      const { user, error } = await confirmInvitation(
        form.values.email,
        confirmInvitationform.values.firstName,
        confirmInvitationform.values.lastName,
        confirmInvitationform.values.newPassword
      );

      if (error) throw new Error("Couldn't confirm the user's invitation!");

      return user;
    },
    retry: false,
    onSuccess: () => {
      close();
      router.push(`/${tenantId}/dashboard`);
    },
    onError: (error) => console.log(error.message),
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center">Velkommen tilbake!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Er det din første gang her?{' '}
        <Anchor size="sm" component="a" href="/signup">
          Opprett en konto!
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
          label="E-post"
          placeholder="post@crs.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Passord"
          placeholder="Ditt passord"
          required
          mt="md"
          {...form.getInputProps('password')}
        />

        {signInMutation.isError && (
          <Alert mt="md" variant="light" color="red" icon={<IconInfoCircle />}>
            E-post/passord er feil!
          </Alert>
        )}

        <Button
          fullWidth
          mt="xl"
          loading={signInMutation.isPending}
          onClick={() => signInMutation.mutate()}
        >
          Sign in
        </Button>
      </Paper>

      <Modal opened={opened} onClose={close} title="Velkommen til CRS">
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
          <Button
            loading={confirmInvitationMutation.isPending}
            leftSection={<IconCheck width="1.4rem" />}
            onClick={() => confirmInvitationMutation.mutate()}
          >
            Bekreft
          </Button>
        </Flex>
      </Modal>
    </Container>
  );
}
