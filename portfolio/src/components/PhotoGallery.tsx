import { Box, Image, Flex, IconButton, Spacer, Stack, ScaleFade, useDisclosure } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PhotoGalleryProps {
    photoUrls: string[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = (props: PhotoGalleryProps) => {
    const { photoUrls } = props;
    const [ currentPhotoIndex, setCurrentPhotoIndex ] = useState<number>(0);
    const { isOpen, onToggle, onOpen } = useDisclosure();
    const [ transition, setTransition ] = useState<boolean>(false);


    const handleNextIndex = () => {
        setTransition(true);
        if (currentPhotoIndex === photoUrls.length - 1) {
            setCurrentPhotoIndex(0);
        } else {
            setCurrentPhotoIndex(currentPhotoIndex + 1);
        }
    };

    const handlePreviousIndex = () => {
        onToggle();
        if (currentPhotoIndex === 0) {
            setCurrentPhotoIndex(photoUrls.length - 1);
        } else {
            setCurrentPhotoIndex(currentPhotoIndex - 1);
        }
    };


    return (
        <Stack direction={'column'}>
            <Image src={photoUrls[currentPhotoIndex]} zIndex={-1} transform={{ transition: 'opacity 500ms ease-in-out' }}/>
            <Stack direction={'row'} marginTop={-14} padding={2}>
                <motion.div
                    whileHover={{ scale: 1.07 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                >
                    <IconButton 
                        icon={<FiChevronLeft />} 
                        aria-label='left' 
                        borderRadius={0}
                        size={'sm'}
                        onClick={handleNextIndex}
                    />
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.07 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
                >
                    <IconButton 
                        icon={<FiChevronRight />} 
                        aria-label='right' 
                        borderRadius={0}
                        size={'sm'}
                        onClick={handlePreviousIndex}
                    />
                </motion.div>
            </Stack>
        </Stack>
    );
}

export default PhotoGallery;