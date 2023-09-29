import { useBreakpointValue } from "@chakra-ui/react";

const breakpointCheckerMobile = (breakpoint: string): boolean => breakpoint === 'base' || breakpoint === 'sm';
const breakpointCheckerTablet = (breakpoint: string): boolean => breakpoint === 'md';
const breakpointCheckerDesktop = (breakpoint: string): boolean => breakpoint === 'lg' || breakpoint === 'xl';

export const useBreakpointCheckerMobile = (): boolean => {
    const bp = useBreakpointValue({
        base: 'base',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
    }) || 'base';
    return breakpointCheckerMobile(bp);
};

export const useBreakpointCheckerDesktop = (): boolean => {
    const bp = useBreakpointValue({
        base: 'base',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
    }) || 'base';
    return breakpointCheckerDesktop(bp);
};

export const useBreakpointCheckerTablet = (): boolean => {
    const bp = useBreakpointValue({
        base: 'base',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
    }) || 'base';
    return breakpointCheckerTablet(bp);
}
    