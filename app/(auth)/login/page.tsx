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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { login } from './actions';
import { validateRequest } from '@/lib/server/actions/user-actions';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      const { user } = await validateRequest();
      if (user) {
        router.push(`/${user.tenantId}/dashboard`);
      } else {
        setLoading(false);
      }
    };

    validateUser();
  }, []);

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

  const signInMutation = useMutation({
    mutationFn: async () => {
      if (form.validate().hasErrors) return;

      const { error, errorMessage } = await login({
        email: form.values.email,
        password: form.values.password,
      });

      if (error) throw new Error(errorMessage);
    },
    retry: false,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

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
            {signInMutation.error.message}
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
    </Container>
  );
}
