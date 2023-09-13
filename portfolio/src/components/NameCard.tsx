import { Box, Center, Heading, Image, Stack, Text, Tooltip } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { IconContext } from "react-icons";
import { FiLinkedin, FiGithub, FiDownload } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import styled from "styled-components";
import Kris from "../assets/Kris.png";

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
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            onTap={() => setInfo(!info)}
            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
        >
            <Box bg={'#383838'} p={[10, 10, 10, 10]} borderRadius={20} textAlign={!info ? 'center' : 'start'} boxShadow={'xl'}>
                {info && <IconContext.Provider value={{ size: "25" }}>
                    <Minimize onClick={() => props.close()} />
                </IconContext.Provider>}

                <Stack direction={!info ? 'column' : 'row'} spacing={4}>
                    {info && <Image src={Kris} height={'380'} borderRadius={20} boxShadow={'2xl'}/>}
                    <Stack direction={'column'} spacing={4} padding={[0,0,2,2]}>
                        <Heading fontSize={!info ? '9xl' : '7xl'} color={'#F4EEE9'} as={'b'} >
                            Kristopher Lemieux
                        </Heading>
                        {info && (
                            <>
                                <Heading fontSize={'2xl'} color={'#F4EEE9'} as={'b'}>
                                    Software Engineer
                                </Heading>    
                                <Text fontSize={'Body'} color={'#F4EEE9'} as={'b'}>
                                    Primarily deal with full stack development with an  preference to frontend. I am currently in my 5th year of Computer Engineering at <Tooltip label="Click to see more" aria-label="A tooltip">
                                        <Text as={'u'} color={'#F4EEE9'}>UVic</Text>
                                    </Tooltip> in British Columbia, Canada.
                                </Text> 
                            </>
                        ) }
                    </Stack>
                    {!info && <Center>
                        <Stack direction={'row'} gap={4}>
                            <IconContext.Provider value={{ color: '#F4EEE9', size: "30" }}>
                                <a target="_blank" href="https://github.com/klemie">
                                    <FiGithub />
                                </a>
                                <a target="_blank" href="https://www.linkedin.com/in/krislemie/">
                                    <FiLinkedin />
                                </a>
                                <FiDownload />
                            </IconContext.Provider>
                        </Stack>
                    </Center>}
                </Stack>
            </Box>
        </motion.div>

    );
}

export default NameCard;