import { Box, Stack } from '@chakra-ui/react';
import React from 'react';

interface LinesProps {
    hiddenIndex?: number;
}

const Lines: React.FC<LinesProps> = (props: LinesProps) => {
    const { hiddenIndex } = props;

    const lines = [
        "about",
        "projects",
        "experience",
        "contact"
    ];

    return (
        <Stack direction={'column'}>
            {lines.map((line, index) => (
                index !== hiddenIndex && <Box
                    key={index}
                    bg={line} 
                    height={10}
                    width={"100%"} 
                />
            ))}
        </Stack>
    );
}

export default Lines;