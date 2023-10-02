import React from 'react';
import { Center, Flex } from '@chakra-ui/react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';
import Close from '../../components/CloseButton';
import { useBreakpointCheckerMobile } from '../../utils/breakpointChecker';

const About: React.FC = () => {
  const viewContext = useViewContext();
  const isMobile = useBreakpointCheckerMobile();
  return (
    <Flex padding={10} direction={'column'} height={"100%"}>
      <Header 
        color='about' 
        title='About' 
        close={() => {
          viewContext.setPage(Pages.TITLE);
        }} />
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
  );
};

export default About;
