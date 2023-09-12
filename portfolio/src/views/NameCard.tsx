import { Box, Center, Spacer, Stack, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import { IconContext } from "react-icons";
import { FiLinkedin, FiGithub, FiDownload } from "react-icons/fi";
import { FaCircleInfo } from "react-icons/fa6"

const NameCard: React.FC = () => {
    return (
        <Box bg={'#383838'} p={[10, 10, 10, 10]} borderRadius={20} textAlign={'center'} boxShadow={'xl'}>
            <Text fontSize={'9xl'} color={'#F4EEE9'} as={'b'}>
                Kristopher<br/>Lemieux
            </Text>
            <Center>
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
            </Center>
           
        </Box>
    );
}

export default NameCard;