import React, { ForwardedRef, RefObject } from 'react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';
import { Button, Box, UseTabProps, useMultiStyleConfig, useTab, Container, Flex, Tabs, TabList, TabPanels, TabPanel } from '@chakra-ui/react';
import { useBreakpointCheckerMobile } from '../../utils/breakpointChecker';
import { motion } from 'framer-motion';

const Experience: React.FC = () => {
  const viewContext = useViewContext();
  const isMobile = useBreakpointCheckerMobile();

  const CustomTab = React.forwardRef<HTMLButtonElement, UseTabProps>((props, ref) => {
    const styles = useMultiStyleConfig('Tabs', props)
    const tabProps = useTab({ ...props, ref: ref as RefObject<HTMLElement> })

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
      >
        <Button 
          __css={styles.tab} 
          {...tabProps} 
          marginRight={4}
          size={'lg'}
          variant={'outline'}
          sx={{ 'box-shadow': '5px 5px 1px 0px rgba(72, 72, 72, 0.80)' }}
        >
          <Box as={'b'}>
            {props.children}
          </Box>
        </Button>
      </motion.div>
    )
  })

  return (
      <Flex padding={10} direction={'column'} height={"100%"}>
        <Header 
          color='experience' 
          title='Experience' 
          close={() => {
            viewContext.setPage(Pages.TITLE);
          }} />
          <Tabs py={5} variant='unstyled' orientation={'horizontal'}>
            <TabList >
              <CustomTab  
                bg={'projects'} 
                color="white" 
                _selected={{ transition: 'all .4s ease-in-out', transform:'scale(1.2)', marginLeft: 4, marginRight: 10 }}
              >Helm Operations</CustomTab>
              <CustomTab 
                bg={'contact'} 
                color="white" 
                _selected={{ transition: 'all .4s ease-in-out', transform:'scale(1.2)', marginX: 5 }}
              >UVic Rocketry
              </CustomTab>
              <CustomTab 
                bg={'about'} 
                color="white" 
                _selected={{ transition: 'all .4s ease-in-out', transform:'scale(1.2)', marginX: 10 }}
              >Island Temperature Controls</CustomTab>
            </TabList>
            <TabPanels>
              <TabPanel>1</TabPanel>
              <TabPanel>2</TabPanel>
              <TabPanel>3</TabPanel>
            </TabPanels>
          </Tabs>

      </Flex>
  );
};

export default Experience;
