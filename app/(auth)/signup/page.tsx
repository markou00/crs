'use client';

import { useState } from 'react';
import {
  Stepper,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Container,
  Title,
  PinInput,
  Flex,
  Text,
  Box,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const supabase = createClientComponentClient();

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

    validate: (values) => {
      if (active === 0) {
        return {
          email: /^\S+@\S+.+\S$/.test(values.email) ? null : 'Ugyldig e-post adress!',
          password: values.password.length < 6 ? 'Passordet må bestå av minst 6 karakterer' : null,
        };
      }

      if (active === 1) {
        return {
          pin: values.pin.trim().length < 6,
        };
      }

      if (active === 2) {
        return {
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
        };
      }

      return {};
    },
  });

  const userQuery = useQuery({
    queryKey: ['user', form.values.email],
    enabled: false,
    queryFn: () => fetch(`/api/users/${form.values.email}`).then((data) => data.json()),
    retry: false,
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, token }: { email: string; token: string }) => {
      const response = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (response.error?.status === 401) {
        throw new Error('The OTP code is incorrect');
      }

      return response.data;
    },

    retry: false,
    onSuccess: async (data) => {
      data.session && (await supabase.auth.setSession(data.session));

      // Move to the next step on success
      setActive((current) => (current < 3 ? current + 1 : current));
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    retry: false,
    onSuccess: () => {
      // Move to the next step on success
      setActive((current) => (current < 3 ? current + 1 : current));
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const modifyUserMutation = useMutation({
    mutationFn: async ({
      email,
      firstName,
      lastName,
      tenantName,
      tenantId,
    }: {
      email: string;
      firstName: string;
      lastName: string;
      tenantName: string;
      tenantId: string;
    }) => {
      const response = await fetch(`/api/users/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          tenantName,
          tenantId,
        }),
      });

      if (!response.ok) throw new Error('ERROR! failed to modify user');
    },

    retry: false,
    onSuccess: async () => {
      router.push(`/${form.values.organisationId}/dashboard`);
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const nextStep = async () => {
    if (active === 0) {
      if (form.validate().hasErrors) {
        return;
      }

      // Check if form is valid before attempting to refetch
      if (form.isValid('email') && form.isValid('password')) {
        try {
          const refetchResult = await userQuery.refetch();
          if (refetchResult.isSuccess) {
            // If user query was successful, exit the function to prevent further execution
            return;
          }
        } catch (error) {
          console.error('Refetch error:', error);
        }

        signUpMutation.mutate({ email: form.values.email, password: form.values.email });
      }
    }

    if (active === 1) {
      if (form.validate().hasErrors) {
        return;
      }

      verifyOtpMutation.mutate({ email: form.values.email, token: form.values.pin });
    }

    if (active === 2) {
      if (form.validate().hasErrors) {
        return;
      }

      modifyUserMutation.mutate({
        email: form.values.email,
        firstName: form.values.firstName,
        lastName: form.values.lastName,
        tenantName: form.values.organisationName,
        tenantId: form.values.organisationId,
      });
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title ta="center" mb="xl">
        Velkommen til CRS
      </Title>
      <Stepper active={active}>
        <Stepper.Step label="Opprett en konto" description="Registrer e-posten din">
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
        </Stepper.Step>

        <Stepper.Step label="Verifisering" description="Oppgi tilsendt kode">
          <Flex direction="column" align="center">
            <Title order={2}>Sjek inboxen din!</Title>
            <Text>Vennligst lim inn koden vi sendte til deg på e-post:</Text>
            <PinInput
              length={6}
              type="number"
              ta="center"
              mt="md"
              autoFocus={form.values.pin.length === 0}
              {...form.getInputProps('pin')}
            />
          </Flex>
        </Stepper.Step>

        <Stepper.Step label="Opprett organisasjonen" description="Fullfør registreringen">
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
                organisationId: event.currentTarget.value.toLocaleLowerCase().replace(' ', '-'),
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
        </Stepper.Step>
      </Stepper>

      {userQuery.isSuccess && (
        <Alert variant="light" color="red" icon={<IconInfoCircle />}>
          E-post addresse er allerede registrert!
        </Alert>
      )}

      {verifyOtpMutation.isError && (
        <Alert mt="md" variant="light" color="red" icon={<IconInfoCircle />}>
          Koden er feil. Prøv igjen!
        </Alert>
      )}

      <Group justify="flex-end" mt="xl">
        {active !== 3 && (
          <Button
            loading={
              userQuery.isLoading ||
              signUpMutation.isPending ||
              verifyOtpMutation.isPending ||
              modifyUserMutation.isPending
            }
            onClick={nextStep}
          >
            {active === 2 ? 'Fullfør' : 'Neste'}
          </Button>
        )}
      </Group>
    </Container>
  );
}
