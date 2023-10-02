import React from 'react';
import { CloseBtn } from './StyledComponent';
import { motion } from 'framer-motion';

interface CloseProps {
    close: () => void; 
    color: string;
}

const Close: React.FC<CloseProps> = (props: CloseProps) => {
    const { close, color } = props;
    return (
        <motion.div

            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
        >
            <CloseBtn
                aria-label='close' 
                bg={color} 
                color={'#1a202c'} 
                onClick={close} 
                borderRadius={0} 
                size={'lg'}
            />
        </motion.div>
    );
}

export default Close;