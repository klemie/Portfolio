import React, { RefObject } from 'react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';
import { Button, Box, UseTabProps, useMultiStyleConfig, useTab, Flex, Tabs, TabList, TabPanels, TabPanel, Stack, Heading, Text, List, ListItem, ListIcon, SimpleGrid, Center } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ExperienceCard from '../../components/ExperienceCard';
import { experiences } from '../../utils/content';
import { useBreakpointCheckerDesktop, useBreakpointCheckerMobile, useBreakpointCheckerTablet } from '../../utils/breakpointChecker';
import Close from '../../components/CloseButton';

const Experience: React.FC = () => {
  const viewContext = useViewContext();

  interface CustomTabProps extends Omit<UseTabProps, 'bg'> {
    bg: string;
  }

  const CustomTab = React.forwardRef<HTMLButtonElement, CustomTabProps>((props, ref) => {
    const styles = useMultiStyleConfig('Tabs', props)
    const tabProps = useTab({ ...props, ref: ref as RefObject<HTMLElement> })

    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, bounce: 0 }}
      >
        <Button 
          __css={styles.tab} 
          {...tabProps} 
          marginRight={4}
          size={'lg'}
          variant={'outline'}
          bg={props.bg}
          color="white" 
          _selected={{ transition: 'all .4s ease-in-out', transform:'scale(1.1)' }}
          sx={{ 'box-shadow': '5px 5px 1px 0px rgba(72, 72, 72, 0.80)' }}
        >
          <Box as={'b'}>
            {props.children}
          </Box>
        </Button>
      </motion.div>
    )
  });

  const isTablet = useBreakpointCheckerTablet();
  const isMobile = useBreakpointCheckerMobile();

  return (
    <Flex padding={10} direction={'column'} height={"100%"}>
      <Header 
        color='experience' 
        title='Experience' 
        close={() => {
          viewContext.setPage(Pages.TITLE);
        }} />
        <Tabs py={5} variant='unstyled' orientation={'horizontal'} >
          <TabList gap={5} justifyContent={isMobile ? 'center' : 'left'}>
            <CustomTab  
              bg={'projects'} 
            >
              { !isMobile ? 'Helm Operations' : 'Helm' }
            </CustomTab>
            <CustomTab 
              bg={'contact'} 
            >
              { !isMobile ? 'UVic Rocketry' : 'UVR' }
            </CustomTab>
            <CustomTab 
              bg={'about'} 
            >
              { !isMobile ? 'Island Temperature Controls' : 'ITC' }
            </CustomTab>
          </TabList>
          <TabPanels>
            <TabPanel p={isMobile ? 0 : 10} paddingTop={10}>
              <SimpleGrid 
                columns={ isMobile || isTablet ? 1 : 2 } 
                spacing={10}    
                scrollBehavior={"smooth"} 
                overflow={'scroll'} 
                padding={5}
              >  
                {experiences.map((experience) => {
                  if (experience.company === 'Helm Operations') {  
                    return (
                      <ExperienceCard
                        coop={experience.coop} 
                        position={experience.position}
                        company={experience.company}
                        startDate={experience.startDate}
                        endDate={experience.endDate}
                        points={experience.points}
                      />
                    )
                  }
                })}
              </SimpleGrid>
            </TabPanel>
            <TabPanel p={isMobile ? 0 : 10} paddingTop={10}>
                <SimpleGrid 
                  columns={ isMobile || isTablet ? 1 : 2 } 
                  spacing={10}    
                  scrollBehavior={"smooth"} 
                  overflow={'scroll'} 
                  padding={5}
                >
                  {experiences.map((experience) => {
                    if (experience.company === 'UVic Rocketry') {  
                      return (
                        <ExperienceCard 
                          coop={experience.coop} 
                          position={experience.position}
                          company={experience.company}
                          startDate={experience.startDate}
                          endDate={experience.endDate}
                          points={experience.points}
                        />
                      )
                    }
                  })}
                </SimpleGrid >
            </TabPanel>
            <TabPanel p={isMobile ? 0 : 10} paddingTop={10} overflow={'scroll'}>
                <SimpleGrid 
                  columns={ isMobile || isTablet ? 1 : 2 } 
                  spacing={10}    
                  scrollBehavior={"smooth"} 
                  overflow={'scroll'} 
                  padding={5}
                >
                  {experiences.map((experience) => {
                    if (experience.company === 'Island Temperature Controls') {  
                      return (
                        <ExperienceCard 
                          coop={experience.coop} 
                          position={experience.position}
                          company={experience.company}
                          startDate={experience.startDate}
                          endDate={experience.endDate}
                          points={experience.points}
                        />
                      )
                    }
                })}
                </SimpleGrid>
               
            </TabPanel>
          </TabPanels>
        </Tabs>
        {isMobile && <Center
            position={'fixed'}
            bottom={10}
            zIndex={2}
          >
            <Close
              close={() => {
                viewContext.setPage(Pages.TITLE);
              }} 
              color={'experience'} 
            />
          </Center>}
    </Flex>
  );
};

export default Experience;
