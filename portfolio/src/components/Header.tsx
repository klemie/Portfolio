import React from 'react';
import { Flex, Heading, Box } from '@chakra-ui/react';
import { CloseBtn } from './StyledComponent';
import { motion } from 'framer-motion';

interface HeaderProps {
    color: string;
    title: string;
    close: () => void; 
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
    const { title, color, close } = props;
    return (
        <Flex w={"100%"} justifyContent={"space-between"} alignItems={'center'}>
            <Box>
                <Heading fontSize={"5xl"} as={'b'} p={3}>{title}</Heading>
                <Box marginTop={-5}  paddingX={3} zIndex={-1} w={"100%"} h={6} bg={color} />
            </Box>
            <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
            >
                <CloseBtn 
                    aria-label='close' 
                    bg={color} 
                    color={'white'} 
                    onClick={close} 
                    borderRadius={0} 
                    size={'lg'}
                />
            </motion.div>
        </Flex>
    );
}

export default Header;