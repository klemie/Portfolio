import React from 'react';
import { Center, Container, Flex, Stack, Text } from '@chakra-ui/react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';
import Close from '../../components/CloseButton';
import { useBreakpointCheckerMobile } from '../../utils/breakpointChecker';
import { StyledBox } from '../../components/StyledComponent';

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
            }} 
          />
          <StyledBox marginTop={10}>
            <Stack direction={'column'} padding={10}>
              <Text fontSize={isMobile ? 'lg' :'2xl'} textAlign={isMobile ? 'left' : 'center'}>
                I am currently looking for a full-time coop position as a software developer. 
                If you would like to get in touch, please feel free to contact me.
              </Text>
              <Stack direction={ isMobile ? 'column' : 'row' } >
                <Text as={'b'} fontSize={isMobile ? 'xl' : '2xl'}>
                    Email:
                </Text>
                <Text as={'b'} fontSize={isMobile ? 'lg' :'2xl'} color={'experience'}>
                    <a href="mailto: lemieuxkristopher@gmail.com" target="_blank" rel="noopener noreferrer"> lemieuxkristopher@gmail.com</a>
                </Text>
              </Stack>
            </Stack>
          </StyledBox>
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
