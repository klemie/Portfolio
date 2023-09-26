import React from 'react';
import { Flex } from '@chakra-ui/react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';

const About: React.FC = () => {
  const viewContext = useViewContext();
  return (
    <Flex padding={10} direction={'column'} height={"100%"}>
      <Header 
        color='about' 
        title='About' 
        close={() => {
          viewContext.setPage(Pages.TITLE);
        }} />

    </Flex>
  );
};

export default About;
