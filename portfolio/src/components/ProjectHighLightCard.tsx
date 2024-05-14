import { Center, Stack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import ProjectModal from './ProjectModal';
import { projects } from '../utils/content';
import { StyledBox } from './StyledComponent';

interface ProjectHighLightCardProps {
    projectName: string;
    projectIndex: number;
    color: 'contract' | 'experience' | 'projects' | 'about';
}

const ProjectHighLightCard: React.FC<ProjectHighLightCardProps> = (props: ProjectHighLightCardProps) => {
    const {
        projectName, 
        projectIndex,
        color
    } = props;

    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                onClick={() => setOpen(true)}
                style={{ marginLeft: 10}}
            >
                <StyledBox background={color} color={"#F4EEE9"} boxShadow={"none"} cursor={'pointer'}>
                    <Stack padding={2}>
                        <Text color={"#F4EEE9"} as={'b'}>{projectName}</Text>
                    </Stack>
                </StyledBox>
            </motion.div>
            <Center>
                <ProjectModal 
                    open={open} 
                    close={() => setOpen(false)}
                    timeline={projects[projectIndex].timeline} 
                    title={projects[projectIndex].title}
                    overview={projects[projectIndex].overview}
                    photos={projects[projectIndex].photos}
                    skillsDescription={projects[projectIndex].skillsDescription}
                    githubLink={projects[projectIndex].githubLink}
                    linkedinLink={projects[projectIndex].linkedinLink}
                    websiteLink={projects[projectIndex].websiteLink}
                    competencies={projects[projectIndex].competencies}
                    skills={projects[projectIndex].skills}
                />
            </Center>
        </>
    );
}

export default ProjectHighLightCard;