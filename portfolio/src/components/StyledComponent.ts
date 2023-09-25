import styled, { css } from 'styled-components';
import { 
    Box, 
    CloseButton,
    defineStyle,
    defineStyleConfig
} from '@chakra-ui/react';

export const StyledBox = styled(Box)`
    ${() => css`
        background-color: #E3D1AB;
        box-shadow: 10px 10px 1px 0px rgba(72, 72, 72, 0.80);
    `}
`;

export const CloseBtn = styled(CloseButton)`
    ${() => css`
        box-shadow: 5px 5px 1px 0px rgba(72, 72, 72, 0.80);
        border-radius: 0%;
    `}
`;

const custom = defineStyle((props) => {
    const { colour } = props;
    return {
        _hover: {
            bg: colour,
            color: 'white'
        },
        _active: {
            bg: colour,
            transform: "scale(1, 1)",
        },
        border: `2px solid ${colour}`,
        transition: 'transform 0.15s ease-out, background 0.15s ease-out',
    }
});

const baseStyle = defineStyle({
    borderRadius: 0
});
 
export const buttonTheme = defineStyleConfig({
    baseStyle,
    variants: { 
        custom 
    },
});