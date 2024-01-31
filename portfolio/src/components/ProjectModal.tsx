import { Box, Center, Flex, Heading, IconButton, ListItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Stack, Tag, Text, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import { CloseBtn } from './StyledComponent';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PhotoGallery from './PhotoGallery';
import { useBreakpointCheckerMobile } from '../utils/breakpointChecker';
import { CgWebsite } from 'react-icons/cg';

export interface ProjectModalProps {
    open: boolean;
    close: () => void;
    photos: string[];
    title: string;
    overview: string[];
    skills: string[];
    competencies: string[];
    skillsDescription: string;
    timeline: string;
    githubLink?: string;
    linkedinLink?: string;
    websiteLink?: string;
}

const ProjectModal: React.FC<ProjectModalProps> = (props: ProjectModalProps) => {
    const { 
        open, 
        close, 
        title, 
        photos, 
        overview, 
        skills, 
        skillsDescription,
        timeline,
        githubLink, 
        linkedinLink, 
        websiteLink, 
        competencies 
    } = props;
    const isMobile = useBreakpointCheckerMobile();
    return (
        <Modal isOpen={open} onClose={close} isCentered size={'full'}>
            <ModalOverlay />
            <ModalContent bg={'#E3D1AB'} borderRadius={0} overflowY={'scroll'} height={'100vh'}>
                <ModalHeader textAlign={'center'} paddingTop={5} position={'fixed'} bg={'#E3D1AB'} zIndex={2} width={'100%'}>
                    <Box width={'100%'} height={2} border={"3px solid #1a202c"} />
                    <Heading fontSize={!isMobile ? '7xl' : '5xl'}>{title}</Heading>
                    <Box width={'100%'} height={2} border={"3px solid #1a202c"} />
                 </ModalHeader>
                <ModalBody marginTop={150}>
                    <Center>
                        <Stack direction={'column'} gap={5} minWidth={isMobile ? 200 : 500} maxWidth={isMobile ? 'auto' : 600}>
                            <PhotoGallery photoUrls={photos} />
                            <Stack>
                                <Flex>
                                    <Heading fontSize={'3xl'}>Overview</Heading>
                                    <Spacer />
                                    <Stack gap={2} direction={'row'}>
                                        {githubLink && <motion.div
                                            whileHover={{ scale: 1.07 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                                        >
                                            <a target="_blank" href={githubLink ?? ''}>
                                                <IconButton 
                                                    aria-label='github' 
                                                    icon={<FiGithub />} 
                                                    size={'sm'} 
                                                    bg={"#1a202c"} 
                                                    _hover={{ bg: "#1a202c" }}
                                                    color={'whiteAlpha.800'} 
                                                    borderRadius={0}
                                                    boxShadow={'sm'}
                                                />
                                            </a>
                                        </motion.div>}
                                        {linkedinLink && <motion.div
                                            whileHover={{ scale: 1.07 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                                        >
                                            <a target="_blank" href={linkedinLink ?? ''}>
                                                <IconButton 
                                                    aria-label='linkedin-post' 
                                                    icon={<FiLinkedin />} 
                                                    size={'sm'} 
                                                    bg={"#1a202c"}
                                                    _hover={{ bg: "#1a202c" }} 
                                                    color={'whiteAlpha.800'} 
                                                    borderRadius={0}
                                                    boxShadow={'lg'}
                                                />
                                            </a>
                                        </motion.div>}
                                        {websiteLink && <motion.div
                                            whileHover={{ scale: 1.07 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                                        >
                                            <a target="_blank" href={websiteLink ?? ''}>
                                                <IconButton 
                                                    aria-label='project-website' 
                                                    icon={<CgWebsite />} 
                                                    size={'sm'} 
                                                    bg={"#1a202c"}
                                                    _hover={{ bg: "#1a202c" }} 
                                                    color={'whiteAlpha.800'} 
                                                    borderRadius={0}
                                                    boxShadow={'lg'}
                                                />
                                            </a>
                                        </motion.div>}
                                    </Stack>
                                </Flex>
                                <Tag 
                                    borderRadius={0}
                                    width={'fit-content'} 
                                    size={'md'} 
                                    variant='solid' 
                                    bg={'#1a202c'}
                                    color={'whiteAlpha.800'}
                                >
                                    {timeline}
                                </Tag> 
                                <Text>
                                    {overview.map((paragraph: string) => (
                                        <Text marginBottom={'1rem'}>
                                            {paragraph}
                                        </Text>
                                    ))}
                                </Text>
                            </Stack>
                            <Stack>
                                <Heading fontSize={'3xl'}>Skills</Heading>
                                <Stack direction={'row'}>
                                    {skills.map((skill: string) => (
                                        <Tag 
                                            borderRadius={0}
                                            width={'fit-content'} 
                                            size={'md'} 
                                            variant='solid' 
                                            bg={'#1a202c'}
                                            color={'whiteAlpha.800'}
                                        >
                                            {skill}
                                        </Tag>
                                    ))}
                                </Stack>
                                <Text>
                                    {skillsDescription}
                                </Text>
                                <UnorderedList>
                                    {
                                        competencies.map((competency: string) => (
                                            <ListItem>{competency}</ListItem>
                                        ))
                                    }
                                </UnorderedList>
                            </Stack>
                        </Stack>                          
                    </Center>
                </ModalBody>
                <ModalFooter>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                    >
                        <CloseBtn size={'lg'} bg={"#1a202c"} color={'whiteAlpha.800'} borderRadius={0} onClick={close} />
                    </motion.div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ProjectModal;