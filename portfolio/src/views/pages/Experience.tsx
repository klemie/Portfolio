import React, { RefObject } from 'react';
import Header from '../../components/Header';
import { Pages, useViewContext } from '../../utils/ViewContext';
import { Button, Box, UseTabProps, useMultiStyleConfig, useTab, Tabs, TabList, TabPanels, TabPanel, SimpleGrid, Center, Stack, Text, Image, Heading } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ExperienceCard from '../../components/ExperienceCard';
import { experiences } from '../../utils/content';
import { useBreakpointCheckerMobile, useBreakpointCheckerTablet } from '../../utils/breakpointChecker';
import Close from '../../components/CloseButton';
import Helm from '../../../public/assets/helm_logo.png';
import { StyledBox } from '../../components/StyledComponent';

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
    <Stack padding={10} direction={'column'}>
      <Header 
        color='experience' 
        title='Experience' 
        close={() => {
          viewContext.setPage(Pages.TITLE);
        }} 
      />
      <Tabs py={5} variant='unstyled' orientation={'horizontal'}>
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
        <TabPanels          
          overflowY={'scroll'}
          marginTop={5}
          height={isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 200px)'}
        >
          <TabPanel>
            <StyledBox p={5}>
              <Text as={'b'} fontSize={'2xl'}>About Helm</Text>
              <Stack direction={'row'} spacing={4} alignItems={'center'} padding={5}>
                <Image src={Helm} boxSize={100}/>
                <Text>
                  Helm Operation is a maritime Software as a Service (SaaS) company that provides software compliance and fleet management. Helm has one of the largest
                  market share for cargo ships and tug boats in North America, and has accounts internationally.
                  I worked as a Software Developer Co-op for 8 months, and contact work for 4 months after that. 
                </Text>
              </Stack>
            </StyledBox>
            <SimpleGrid 
              mt={5}
              columns={ isMobile || isTablet ? 1 : 2 } 
              spacing={10}
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
                      duration={experience.duration}
                      points={experience.points}
                    />
                  )
                }
              })}
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
              <SimpleGrid 
                columns={ isMobile || isTablet ? 1 : 2 }                  
                spacing={10}    
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
                        duration={experience.duration}
                        points={experience.points}
                      />
                    )
                  }
                })}
              </SimpleGrid >
          </TabPanel>
          <TabPanel>
              <SimpleGrid 
                columns={ isMobile || isTablet ? 1 : 2 } 
                spacing={10}    
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
                        duration={experience.duration}
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
    </Stack>
  );
};

export default Experience;
