import React from 'react';
import { Flex, Heading, Box } from '@chakra-ui/react';
import Close from './CloseButton';
import { useBreakpointCheckerMobile } from '../utils/breakpointChecker';

interface HeaderProps {
    color: string;
    title: string;
    close: () => void; 
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
    const { title, color, close } = props;

    const isMobile = useBreakpointCheckerMobile();

    return (
        <Flex w={"100%"} justifyContent={!isMobile ? "space-between" : 'center'} alignItems={'center'}>
            <Box>
                <Heading fontSize={"5xl"} as={'b'} p={3}>{title}</Heading>
                <Box marginTop={-5}  paddingX={3} zIndex={-1} w={"100%"} h={6} bg={color} />
            </Box>
            {!isMobile && <Close close={close} color={color} />}
        </Flex>
    );
}

export default Header;