'use client';

import { useState } from 'react';
import {
  Stepper,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Code,
  Container,
  Title,
  PinInput,
  Flex,
  Text,
  Box,
  Input,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export default function SignupPage() {
  const [active, setActive] = useState(0);

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
        };
      }

      if (active === 1) {
        return {
          pin: values.pin.trim().length < 4,
        };
      }

      if (active === 2) {
        return {
          firstName:
            values.firstName.trim().length < 2 ? 'Fornavnet må bestå av minst 2 karakterer' : null,
          lastName:
            values.lastName.trim().length < 2 ? 'Etternavnet må bestå av minst 2 karakterer' : null,
          password: values.password.length < 6 ? 'Passordet må bestå av minst 6 karakterer' : null,
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

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return current < 3 ? current + 1 : current;
    });

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
            {...form.getInputProps('email')}
          />
        </Stepper.Step>

        <Stepper.Step label="Verifisering" description="Oppgi tilsendt kode">
          <Flex direction="column" align="center">
            <Title order={2}>Sjek inboxen din!</Title>
            <Text>Vennligst lim inn koden vi sendte til deg på e-post:</Text>
            <PinInput type="number" ta="center" mt="md" {...form.getInputProps('pin')} />
          </Flex>
        </Stepper.Step>

        <Stepper.Step label="Opprett organisasjonen" description="Fullfør registreringen">
          <TextInput
            mb="md"
            label="Fornavn"
            placeholder="Ole"
            {...form.getInputProps('firstName')}
          />
          <TextInput
            mb="md"
            label="Etternavn"
            placeholder="Nordmann"
            {...form.getInputProps('lastName')}
          />
          <PasswordInput
            mb="md"
            label="Passord"
            placeholder="Sterk passord"
            {...form.getInputProps('password')}
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
        <Stepper.Completed>
          Completed! Form values:
          <Code block mt="xl">
            {JSON.stringify(form.values, null, 2)}
          </Code>
        </Stepper.Completed>
      </Stepper>

      <Group justify="flex-end" mt="xl">
        {active !== 0 && (
          <Button variant="default" onClick={prevStep}>
            Tilbake
          </Button>
        )}
        {active !== 3 && <Button onClick={nextStep}>Neste</Button>}
      </Group>
    </Container>
  );
}
