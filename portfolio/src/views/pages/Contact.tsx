import React from 'react';
import { Center, Container, Flex } from '@chakra-ui/react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';
import Close from '../../components/CloseButton';
import { useBreakpointCheckerMobile } from '../../utils/breakpointChecker';

const Contact: React.FC = () => {
  const viewContext = useViewContext();
  const isMobile = useBreakpointCheckerMobile();
  return (
    <Container maxW={"100vm"} h={"100%"} m={0} p={0}>
        <Flex padding={10} direction={'column'} height={"100%"}>
          <Header 
            color='contact' 
            title='Contact' 
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
              color={'contact'} 
            />
          </Center>}
        </Flex>
    </Container>
  );
};

export default Contact;
