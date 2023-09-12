import { Box, Slide, SlideFade, Text, UseDisclosureProps, UseDisclosureReturn } from "@chakra-ui/react";
import React from "react";

interface ITitleBar {
    color: string;
    title: string;
    disclosure: UseDisclosureReturn;
    margin: string;
}

const TitleBar: React.FC<ITitleBar> = (props: ITitleBar) => {
    const { color, title, disclosure, margin } = props;

    return (
       <SlideFade in={disclosure.isOpen} onClick={disclosure.onToggle}>
            <Box w={'100vw'} h={'80px'} bg={color} alignItems='center' marginTop={5}>
                <Text as={'b'} fontSize={'5xl'} color={"#F8F3EE"} marginStart={margin}>
                    {title}
                </Text>
            </Box>
        </SlideFade>  
    );
}

export default TitleBar;