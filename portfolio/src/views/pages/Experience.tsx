import React from 'react';
import { Container, Flex } from '@chakra-ui/react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';

const Experience: React.FC = () => {
  const viewContext = useViewContext();
  return (
    <Container maxW={"100vm"} h={"100%"} m={0} p={0}>
      <Flex padding={10} direction={'column'} height={"100%"}>
        <Header 
          color='experience' 
          title='Experience' 
          close={() => {
            viewContext.setPage(Pages.TITLE);
          }} />

      </Flex>
    </Container>
  );
};

export default Experience;
