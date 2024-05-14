import { Box, Center, Heading, Image, Stack, Text, Tooltip, AbsoluteCenter, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FiLinkedin, FiGithub, FiDownload } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import styled from "styled-components";
import Kris from "../assets/Kris.png";

import resume from "../assets/Kris Lemieux Resume 2024.pdf";
import { useBreakpointCheckerMobile } from "../utils/breakpointChecker";
import ProjectHighLightCard from "./ProjectHighLightCard";

const Minimize = styled(AiOutlineClose)`
    &:hover {
        cursor: pointer;
    }
    position: absolute;
    top: 0;
    right: 0;
    margin: 40px;
    color: #F4EEE9;
`;

interface NameCardProps {
    close: () => void;
}

const NameCard: React.FC<NameCardProps> = (props: NameCardProps) => {
    const [info, setInfo] = useState<boolean>(false);

    useEffect(() => {
        setInfo(false);
    }, []);

    const lines = [
        "about",
        "projects",
        "experience",
        "contact"
    ];

    const animationDelay: number = 2;

    const titleAnimationVariants = {
        initial: { x: 0, y: 100, scale: 1 },
        animate: { x: 120, y: 50, scale: 0.75, TextAlign: 'left', transition: { duration: 1.25, delay: animationDelay }},
    };

    const subtitleAnimationVariants = {
        initial: { x: 0, y: 0, opacity: 0, hidden: true, scale: 0.9 },
        animate: { x: 0, y: 0, scale: 1.0, hidden: false, opacity: 1.0, transition: { duration: 0.4, delay: animationDelay+0.3 }},
    };

    const pictureAnimationVariants = {
        initial: { x: 25, y: 135, opacity: 0, hidden: true, scale: 0.9 },
        animate: { x: 25, y: 135, scale: 1.2, hidden: false, opacity: 1.0, transition: { duration: 0.8, delay: animationDelay+0.6 }},
    };


    const isMobile = useBreakpointCheckerMobile();

    return (
        <Box 
            bg={'#383838'} 
            borderRadius={0} 
            textAlign={!info ? 'center' : 'start'}
            width={"100vw"}
            height={"100vh"}
            sx={{ 
                'box-shadow': '10px 10px 1px 0px rgba(72, 72, 72, 0.80)'
            }}
        >
            <IconContext.Provider value={{ size: "25" }}>
                <Minimize onClick={() => props.close()} />
            </IconContext.Provider>
                <AbsoluteCenter px={150} bg={'#383838'}>
                    <motion.div 
                        style={{ position: 'absolute' }}
                        initial="initial"
                        animate="animate"
                        variants={pictureAnimationVariants}
                    >
                        <Image src={Kris} alt="Kris" boxSize="150px" objectFit={'cover'} />
                    </motion.div>
                    <motion.div>
                        <Stack direction={!info ? 'column' : 'row'} spacing={4}>
                            {info && !isMobile && <Image src={Kris} height={'380'} borderRadius={0} boxShadow={'2xl'}/>}
                                <Stack direction={'column'} spacing={4} padding={[0,0,2,2]}>
                                    <motion.div 
                                        initial="initial"
                                        animate="animate"
                                        variants={titleAnimationVariants}
                                    >
                                        {!info && <Heading fontSize={!info ? isMobile ? '6xl' : '9xl' : '7xl'} color={'#F4EEE9'} as={'b'} >
                                            Kristopher Lemieux
                                        </Heading>}
                                    </motion.div>
                                    <motion.div 
                                        initial="initial"
                                        animate="animate"
                                        variants={subtitleAnimationVariants}
                                    >
                                        <Stack>
                                            <Heading fontSize={'3xl'} color={'#F4EEE9'} as={'b'} textAlign={'left'}>
                                                Software Engineer
                                            </Heading>    
                                            <Text fontSize={'Body'} color={'#F4EEE9'} as={'b'} textAlign={'left'}>
                                                Primarily deal with full stack development with a preference to frontend. I am currently in my 5th year of Computer Engineering at <Tooltip label="Click to see more" aria-label="A tooltip">
                                                    <Link href="https://www.uvic.ca/" isExternal color={'contact'}>UVic</Link>
                                                </Tooltip> in British Columbia, Canada. Planned graduation is December 2024.
                                            </Text> 
                                        </Stack>
                                   </motion.div>
                                </Stack>
                            {!info && <Center>
                                <Stack direction={'row'} gap={3} alignItems={'center'}>
                                    <Text fontSize={'xl'} color={'#F4EEE9'} as={'b'}>
                                        Top Projects
                                    </Text>
                                    <ProjectHighLightCard color='projects' projectName={'Engine Monitoring'} projectIndex={1} />
                                    <ProjectHighLightCard color='experience' projectName={'TableTapp'} projectIndex={0} />
                                </Stack>
                            </Center>}
                            {!info && <Center>
                                <Stack direction={'row'} gap={4}>
                                    <IconContext.Provider value={{ color: '#F4EEE9', size: "30" }}>
                                        <a target="_blank" href="https://github.com/klemie">
                                            <FiGithub />
                                        </a>
                                        <a target="_blank" href="https://www.linkedin.com/in/krislemie/">
                                            <FiLinkedin />
                                        </a>
                                        <Tooltip 
                                            label="Click to download resume pdf" 
                                            aria-label="A tooltip" 
                                            placement={'bottom'} 
                                            bg={'red.500'}
                                        >
                                        <a 
                                            target="_blank" 
                                            href={resume} 
                                            download
                                            >
                                            <FiDownload />
                                        </a>
                                        </Tooltip>
                                    </IconContext.Provider>
                                </Stack>
                            </Center>}
                        </Stack>
                    </motion.div>
                </AbsoluteCenter>
                <Stack 
                    height={"100%"} 
                    direction={'column'} 
                    justifyContent={'center'}  
                    alignItems={'center'}
                    gap={5}
                >
                    {lines.map((color, index) => (
                        <Box
                            key={index}
                            bg={color} 
                            height={20}
                            width={"100%"} 
                        />
                    ))}
                </Stack>
        </Box>
    );
}

export default NameCard;