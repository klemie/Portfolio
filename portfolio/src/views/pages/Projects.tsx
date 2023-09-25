import React from 'react';
import { Container, Flex, Spacer, Stack } from '@chakra-ui/react';
import Header from '../../components/Header';
import ProjectCard from '../../components/ProjectCard';
import Lines from '../../components/Lines';
import { Pages, useViewContext } from '../../utils/ViewContext';

const Projects: React.FC = () => {
  const viewContext = useViewContext();
  const backToTitle = () => {
      viewContext.setPage(Pages.TITLE);
  }

  return (
    <Container maxW={"100vm"} h={"100%"} m={0} p={0}>
      <Flex padding={10} direction={'column'} height={"100%"}>
        <Header color='projects' title='Projects' close={backToTitle} />
        <Spacer />
        <Stack padding={20} direction={'row'} spacing={10} scrollBehavior={"smooth"} overflowX={'scroll'}>
          <ProjectCard color='projects' title='Project 1' />
          <ProjectCard color='experience' title='Project 2' />
          <ProjectCard color='contact' title='Project 3' />
          <ProjectCard color='about' title='Project 4' />
          <ProjectCard color='projects' title='Project 5' />
        </Stack>
        <Spacer />
        <Lines hiddenIndex={1} />
      </Flex>
    </Container>
  );
};

export default Projects;
