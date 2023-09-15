import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';

const About: React.FC = () => {
  return (
    <Container maxW={"100vm"} h={"100%"} bg="about" m={0} p={0}>
      <Heading>About</Heading>
      <Text>Portfolio</Text>
    </Container>
  );
};

export default About;
