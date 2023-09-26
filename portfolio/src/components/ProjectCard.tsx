import React, { useState } from 'react';
import { StyledBox } from './StyledComponent';
import { Box, Button, Center, Heading, Stack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ProjectModal from './ProjectModal';
import { useBreakpointCheckerDesktop } from '../utils/breakpointChecker';
import { projects } from '../utils/content';

interface ProjectCardProps {
    color: string;
    title: string;
    overview: string;
    projectIndex: number;
}
 
const ProjectCard: React.FC<ProjectCardProps> = (props: ProjectCardProps) => {
    const { title, color, overview, projectIndex } = props;
    const [open, setOpen] = useState<boolean>(false);

    const isDesktop = useBreakpointCheckerDesktop();
    
    return (
        <>
        <motion.div
            whileHover={{ scale: 1.05 }}
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
                        <Text fontSize={'xl'} noOfLines={isDesktop ? 5 : 2}>
                            {overview}                  
                        </Text>
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
            <ProjectModal 
                open={open} 
                close={() => setOpen(false)} 
                title={projects[projectIndex].title}
                overview={projects[projectIndex].overview}
                photos={projects[projectIndex].photos}
                skillsDescription={projects[projectIndex].skillsDescription}
                githubLink={projects[projectIndex].githubLink}
                linkedinLink={projects[projectIndex].linkedinLink}
                competencies={projects[projectIndex].competencies}
                skills={projects[projectIndex].skills}
            />
        </Center>
        </>
    );
}

export default ProjectCard;