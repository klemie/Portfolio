import React, { useState } from 'react';
import { StyledBox } from './StyledComponent';
import { Box, Button, Center, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ProjectModal from './ProjectModal';
import { useBreakpointCheckerDesktop } from '../utils/breakpointChecker';

interface ProjectCardProps {
    color: string;
    title: string;
    text: string;
    srcUrl: string;
}
 
const ProjectCard: React.FC<ProjectCardProps> = (props: ProjectCardProps) => {
    const { title, color } = props;
    const [info, setInfo] = useState<boolean>(true);
    const [open, setOpen] = useState<boolean>(false);

    const isDesktop = useBreakpointCheckerDesktop();
    
    return (
        <>
        <motion.div
            whileHover={{ scale: 1.05 }}
            onTap={() => setInfo(!info)}
            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
        >
            <StyledBox maxWidth={500} minWidth={300} minH={'fit-content'} height={'auto'}>
                <Center>
                    <Stack justifyContent={'center'} padding={10} gap={5}>
                        <Box textAlign={'center'}>
                            <Heading
                                fontSize={"4xl"} 
                                as={'b'} 
                                p={3}
                            >
                                {title}
                            </Heading>
                            <Box 
                                marginTop={-4}  
                                paddingX={3} 
                                zIndex={-1} 
                                h={5} 
                                bg={color} 
                            />
                        </Box>
                        {info && (
                            <Text fontSize={'xl'} noOfLines={isDesktop ? 5 : 2}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Nulla euismod, nisl vitae aliquam ultricies, nunc nisl
                                ultricies nunc, vitae aliquam nisl nisl vitae aliquam
                                ultricies, nunc nisl ultricies nunc, vitae aliquam nisl                    
                            </Text>
                        )}
                        {!info && (
                            <Image
                                alignSelf={'center'}
                                src={'https://media.licdn.com/dms/image/D5622AQF4vne1wTtN-g/feedshare-shrink_2048_1536/0/1693875912928?e=1698278400&v=beta&t=8BnW14NvMG0aer-Wrurfc1tdQ9l7LmgCc8mNi03nt2M'} 
                                height={150}
                            />
                        )}
                        <Button 
                            variant={'outline'} 
                            size={'lg'} 
                            colorScheme={color} 
                            color={color} 
                            borderRadius={0}
                            onClick={() => setOpen(true)}
                        >
                            Learn More
                        </Button>
                    </Stack>
                </Center>
            </StyledBox>
        </motion.div>
        <Center>
            <ProjectModal open={open} close={() => setOpen(false)} />
        </Center>
        </>
    );
}

export default ProjectCard;