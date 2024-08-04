'use client';

import {
  Button,
  Group,
  TextInput,
  PasswordInput,
  Container,
  Title,
  Flex,
  Text,
  Box,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { validateRequest } from '@/lib/server/actions/user-actions';
import { signup } from './actions';

export default function SignupPage() {
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
      pin: '',
      password: '',
      firstName: '',
      lastName: '',
      organisationName: '',
      organisationId: '',
    },

    validate: (values) => ({
      email: /^\S+@\S+.+\S$/.test(values.email) ? null : 'Ugyldig e-post adress!',
      password: values.password.length < 6 ? 'Passordet må bestå av minst 6 karakterer' : null,
      firstName:
        values.firstName.trim().length < 2 ? 'Fornavnet må bestå av minst 2 karakterer' : null,
      lastName:
        values.lastName.trim().length < 2 ? 'Etternavnet må bestå av minst 2 karakterer' : null,
      organisationName:
        values.organisationName.trim().length < 2
          ? 'Organisasjons navnet må bestå av minst 2 karakterer'
          : null,
      organisationId:
        values.organisationId.trim().length < 2
          ? 'Organisasjons id må bestå av minst 2 karakterer'
          : null,
    }),
  });

  const signUpMutation = useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      organisationName,
      organisationId,
      email,
      password,
    }: {
      firstName: string;
      lastName: string;
      organisationName: string;
      organisationId: string;
      email: string;
      password: string;
    }) => {
      const { error, errorMessage } = await signup({
        firstName,
        lastName,
        organisationName,
        organisationId,
        email,
        password,
      });
      if (error) throw new Error(errorMessage);
    },
    retry: false,
  });

  const submit = async () => {
    if (form.validate().hasErrors) {
      return;
    }

    signUpMutation.mutate({
      firstName: form.values.firstName,
      lastName: form.values.lastName,
      organisationName: form.values.organisationName,
      organisationId: form.values.organisationId,
      email: form.values.email,
      password: form.values.password,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container size="sm" mt="xl">
      <Title ta="center" mb="xl">
        Velkommen til CRS, opprett en konto
      </Title>

      <TextInput
        mb="md"
        label="Fornavn"
        placeholder="Ole"
        autoFocus={form.values.firstName.length === 0}
        {...form.getInputProps('firstName')}
      />
      <TextInput
        mb="md"
        label="Etternavn"
        placeholder="Nordmann"
        {...form.getInputProps('lastName')}
      />

      <TextInput
        mb="md"
        label="Organisasjons navn"
        placeholder="Container bedrift AS"
        {...form.getInputProps('organisationName')}
        onChange={(event) =>
          form.setValues({
            organisationName: event.currentTarget.value,
            organisationId: event.currentTarget.value.toLocaleLowerCase().replaceAll(' ', '-'),
          })
        }
      />

      <Box>
        <Text>Organisasjons id</Text>
        <Flex gap=".3rem">
          <TextInput placeholder="crs.com/" disabled />
          <TextInput
            placeholder="container-bedrift-as"
            {...form.getInputProps('organisationId')}
            flex={1}
            value={form.values.organisationId}
            onChange={(event) =>
              form.setValues({
                organisationId: event.currentTarget.value.toLocaleLowerCase().replace(' ', '-'),
              })
            }
          />
        </Flex>
      </Box>

      <TextInput
        mt="md"
        label="E-post"
        placeholder="post@crs.com"
        autoFocus={form.values.email.length === 0}
        {...form.getInputProps('email')}
      />
      <PasswordInput
        mb="md"
        label="Passord"
        placeholder="Sterk passord"
        {...form.getInputProps('password')}
      />

      {signUpMutation.isError && (
        <Alert variant="light" color="red" icon={<IconInfoCircle />}>
          {signUpMutation.error.message}
        </Alert>
      )}

      <Group justify="flex-end" mt="xl">
        <Button loading={signUpMutation.isPending} onClick={submit}>
          Send
        </Button>
      </Group>
    </Container>
  );
}
