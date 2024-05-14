import { Box, Center, Flex, Heading, IconButton, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Stack, Tag, Text } from '@chakra-ui/react';
import React from 'react';
import { CloseBtn } from './StyledComponent';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { CgMail } from 'react-icons/cg';
import { motion } from 'framer-motion';
import { useBreakpointCheckerMobile } from '../utils/breakpointChecker';
import krisBiking from '../../public/assets/kris-biking.png';
import krisPainting from '../../public/assets/kris-painting.png';
import krisHeadShot from '../../public/assets/kris-present.png';
import ProjectHighLightCard from './ProjectHighLightCard';

export interface AboutModalProps {
    open: boolean;
    close: () => void;
    overview: string[];
    skills: string[];
    skillsDescription: string;
    gmailLink?: string;
    githubLink?: string;
    linkedinLink?: string;
}

const AboutModal: React.FC<AboutModalProps> = (props: AboutModalProps) => {
    const { 
        open, 
        close, 
        overview, 
        skills, 
        skillsDescription,
        githubLink, 
        linkedinLink,
        gmailLink
    } = props;

    const isMobile = useBreakpointCheckerMobile();

    return (
        <Modal isOpen={open} onClose={close} isCentered size={'full'}>
            <ModalOverlay />
            <ModalContent bg={'#E3D1AB'} borderRadius={0} overflowY={'scroll'} height={'100vh'}>
                <ModalHeader textAlign={'center'} paddingTop={5} position={'fixed'} bg={'#E3D1AB'} zIndex={2} width={'100%'}>
                    <Box width={'100%'} height={2} border={"3px solid #1a202c"} />
                    <Heading fontSize={!isMobile ? '7xl' : '5xl'}>About me</Heading>
                    <Box width={'100%'} height={2} border={"3px solid #1a202c"} />
                 </ModalHeader>
                <ModalBody marginTop={150}>
                    <Center>
                        <Stack direction={'column'} gap={5} minWidth={isMobile ? 200 : 700} width={isMobile ? 'auto' : 700}>
                            <Stack>
                                <Stack direction={'row'}>
                                    <Image src={krisBiking} width={'33.3%'} borderRadius={0}/>
                                    <Image src={krisPainting} width={'33.3%'} borderRadius={0}/>
                                    <Image src={krisHeadShot} width={'33.3%'} borderRadius={0}/>
                                </Stack>
                                <Flex>
                                    <Heading fontSize={'3xl'}>Overview</Heading>
                                    <Spacer />
                                    <Stack gap={2} direction={'row'}>
                                        {githubLink && <motion.div
                                            whileHover={{ scale: 1.07 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                                        >
                                            <a target="_blank" href={githubLink}>
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
                                            <a target="_blank" href={linkedinLink}>
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
                                        {gmailLink && <motion.div
                                            whileHover={{ scale: 1.07 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                                        >
                                            <a target="_blank" href={gmailLink}>
                                                <IconButton
                                                    aria-label='linkedin-post' 
                                                    icon={<CgMail />} 
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
                                <Flex direction={'row'} width={'100%'} alignItems={'center'}>
                                    <Heading fontSize={'xl'}>Highlighted Projects</Heading>
                                    <Spacer />
                                    <ProjectHighLightCard projectIndex={2} projectName='Engine Motoring System' />
                                    <ProjectHighLightCard projectIndex={1} projectName='TableTapp' />
                                </Flex>
                                {overview.map((paragraph: string) => (
                                    <Text>
                                        {paragraph}
                                    </Text>
                                ))}
                            </Stack>
                            <Stack>
                                <Heading fontSize={'3xl'}>Skills</Heading>
                                <Text>
                                    {skillsDescription}
                                </Text>
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

export default AboutModal;