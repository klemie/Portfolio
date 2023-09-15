import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';

const Projects: React.FC = () => {
  return (
    <Container maxW={"100vm"} h={"100%"} bg="projects" m={0} p={0}>
      <Heading>Projects</Heading>
      <Text>Portfolio</Text>
    </Container>
  );
};

export default Projects;
