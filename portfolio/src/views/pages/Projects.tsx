import React from 'react';
import { Center, Container, Flex, Spacer, Stack } from '@chakra-ui/react';
import Header from '../../components/Header';
import ProjectCard from '../../components/ProjectCard';
import { Pages, useViewContext } from '../../utils/ViewContext';
import { useBreakpointCheckerMobile } from '../../utils/breakpointChecker';
import { projects } from '../../utils/content';
import Close from '../../components/CloseButton';

const Projects: React.FC = () => {
  const viewContext = useViewContext();

  const backToTitle = () => {
      viewContext.setPage(Pages.TITLE);
  };

  const isMobile = useBreakpointCheckerMobile();

  return (
    <Container maxW={"100vm"} h={"100%"} m={0} p={0}>
      <Flex padding={10} direction={'column'} height={"100%"}>
        <Header color='projects' title='Projects' close={backToTitle} />
        <Spacer />
        <Center           
        >
          <Stack 
            padding={isMobile ? 5 : 5} 
            direction={isMobile ? 'column' : 'row'} 
            spacing={5} 
            scrollBehavior={"smooth"} 
            height={isMobile ? 'calc(100vh)' : 'auto'}

            overflow={'scroll'}
          >
              {
                projects.map((project, index) => {
                    return (
                      <ProjectCard 
                        color={project.color} 
                        title={project.title} 
                        overview={project.overview} 
                        projectIndex={index} 
                      />
                    );
                })
              }
          </Stack>
        </Center>
        <Spacer />
        {/* {isDesktop && <Lines hiddenIndex={1} />} */}
        {isMobile && <Center
            position={'fixed'}
            bottom={10}
            zIndex={2}
          >
            <Close
              close={() => {
                viewContext.setPage(Pages.TITLE);
              }} 
              color={'projects'} 
            />
          </Center>}
      </Flex>
    </Container>
  );
};

export default Projects;
