import { Box, Center, Heading, Image, Stack, Text, Tooltip, AbsoluteCenter } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState } from "react";
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
    setInfo(false);
    const isMobile = useBreakpointCheckerMobile();

    return (
        <Box 
            bg={'#383838'} 
            p={[10, 10, 10, 10]} 
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
                <AbsoluteCenter>
                    <motion.div
                        // whileHover={{ scale: 1.05 }}
                        // onTap={() => { if (!isMobile) setInfo(!info)}}
                        // transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                    >
                    <Stack direction={!info ? 'column' : 'row'} spacing={4}>
                        {info && !isMobile && <Image src={Kris} height={'380'} borderRadius={0} boxShadow={'2xl'}/>}
                            <Stack direction={'column'} spacing={4} padding={[0,0,2,2]}>
                                {!info && <Heading fontSize={!info ? isMobile ? '6xl' : '9xl' : '7xl'} color={'#F4EEE9'} as={'b'} >
                                    Kristopher Lemieux
                                </Heading>}
                                {info && (
                                    <>
                                        <Heading fontSize={'3xl'} color={'#F4EEE9'} as={'b'}>
                                            Software Engineer
                                        </Heading>    
                                        <Text fontSize={'Body'} color={'#F4EEE9'} as={'b'}>
                                            Primarily deal with full stack development with a preference to frontend. I am currently in my 5th year of Computer Engineering at <Tooltip label="Click to see more" aria-label="A tooltip">
                                                <Text as={'u'} color={'#F4EEE9'}>UVic</Text>
                                            </Tooltip> in British Columbia, Canada.
                                        </Text> 
                                    </>
                                )}
                            </Stack>
                        {!info && <Center>
                            <Stack direction={'row'} gap={3} alignItems={'center'}>
                                <Text fontSize={'xl'} color={'#F4EEE9'} as={'b'}>
                                    Top Projects:
                                </Text>
                                <ProjectHighLightCard projectName={'Engine Monitoring'} projectIndex={2} />
                                <ProjectHighLightCard projectName={'TableTapp'} projectIndex={1} />
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
                                        label="Click to download my resume" 
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
        </Box>
    );
}

export default NameCard;