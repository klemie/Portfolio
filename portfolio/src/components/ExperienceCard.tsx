import React from 'react';
import { Stack, Text, List, ListItem, ListIcon, Tag } from '@chakra-ui/react';
import { StyledBox } from './StyledComponent';
import { motion } from 'framer-motion';
import { MdCheckCircle } from 'react-icons/md';
import { useBreakpointCheckerMobile } from '../utils/breakpointChecker';

interface ExperienceCardProps {
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    coop: boolean;
    points: string[];
}

const ExperienceCard: React.FC<ExperienceCardProps> = (props: ExperienceCardProps) => {
    const { 
        position, 
        company,
        startDate,
        endDate,
        coop,
        points
    } = props;

    const isMobile = useBreakpointCheckerMobile();

    return (
            <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 17, bounce: 0.5 }}
            >
                <StyledBox 
                    width={'100%'} 
                    minWidth={200} 
                    minH={'fit-content'} 
                >
                    <Stack direction={'column'} padding={10}>
                        <Stack direction={ isMobile ? 'column' : 'row' } >
                            <Text as={'b'} fontSize={isMobile ? 'xl' : '2xl'}>
                                {position} 
                            </Text>
                            <Text as={'b'} fontSize={isMobile ? 'lg' :'2xl'} color={'experience'}>
                                @ {company}
                            </Text>
                        </Stack>
                        {coop && <Tag 
                            borderRadius={0}
                            width={'fit-content'} 
                            size={'md'} 
                            variant='solid' 
                            bg={'#1a202c'}
                            color={'whiteAlpha.800'}
                        >   
                            Co-op
                        </Tag>}
                        <Text fontSize={'lg'}>
                            {startDate} - {endDate}
                        </Text>
                        <List spacing={3}>
                            {points.map((point, index) => (
                                <ListItem key={index}>
                                    <ListIcon as={MdCheckCircle} color='green.500' />
                                    {point}
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </StyledBox>
            </motion.div>
    );
}

export default ExperienceCard;