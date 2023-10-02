import React, { useEffect, useState } from "react";
import { AbsoluteCenter, Box, Center, Flex, Heading,  useToast } from "@chakra-ui/react";
import NameCard from "../../components/NameCard";
import styled from "styled-components";
import { motion } from "framer-motion";
import { AiFillContacts, AiFillProject, AiFillInfoCircle } from "react-icons/ai";
import { MdWork } from "react-icons/md";
import { Pages, useViewContext } from "../../utils/ViewContext";
import { useBreakpointCheckerMobile } from "../../utils/breakpointChecker";

const LandingPage: React.FC = () => {
  
    const pageContext = useViewContext();

    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [showTitleCard, setShowTitleCard] = useState<boolean>(true);
    const handleHover = (barId:number) => {
      setHoveredBar(barId);
    };
  
    const handleLeave = () => {
      setHoveredBar(null);
    };

    const sections = [
        { id: 0, color: '#1F77CB', title: 'About', icon: styled(AiFillInfoCircle)`color: #F8F3EE` },
        { id: 1, color: '#5894CE', title: 'Project', icon: styled(AiFillProject)`color: #F8F3EE` },
        { id: 2, color: '#B75950', title: 'Experience', icon: styled(MdWork)`color: #F8F3EE`  },
        { id: 3, color: '#F3C46A', title: 'Contacts', icon: styled(AiFillContacts)`color: #F8F3EE`  }
    ];

    const TitleContainer = styled(motion.div)`
        cursor: pointer;
        z-index: 2;
        height: 100%;
    `;

    const textMotion = {
        hidden: {
            opacity: 0,
            x: -100
        },
        visible: {
            opacity: 1,
            x: 0,
            margin: 0,
            transition: {
                duration: 0.5,
                delay: 0.5
            }
        }
    };

    const handleBarClick = (barTitle: string) => {
        switch (barTitle) {
            case 'About':
                pageContext.setPage(Pages.ABOUT);
                break;
            case 'Project':
                pageContext.setPage(Pages.PROJECTS);
                break;
            case 'Experience':
                pageContext.setPage(Pages.EXPERIENCE);
                break;
            case 'Contacts':
                pageContext.setPage(Pages.CONTACT);
                break;
            default:
                break;
        }
    }

    const isMobile = useBreakpointCheckerMobile();
    const toast = useToast();

    useEffect(() => {
        toast({
            title: "IN DEVELOPMENT",
            description: "Some features are not available & Content maybe missing",
            status: "warning",
            duration: 9000,
            isClosable: true,
            position: 'top'
        });
    }, []);

    return (
        <Box margin={0} padding={0}>
            <AbsoluteCenter zIndex={2}>
                { showTitleCard && <NameCard close={() => setShowTitleCard(false)} /> }
            </AbsoluteCenter>
            <AbsoluteCenter>
                <div style={{ width: "100vw", margin: 0 }}>
                    {sections.map((bar) => (
                        <motion.div
                            key={bar.id}
                            style={{
                                backgroundColor: bar.color,
                                width: !showTitleCard && hoveredBar !== null && hoveredBar !== bar.id ? '10vw' : '100vw',
                                height: isMobile ? '25vh': '80px',
                                transition: 'width 1s ease',
                                marginTop: isMobile ? 0 : '20px'
                            }}
                            onMouseEnter={() => handleHover(bar.id)}
                            onMouseLeave={handleLeave}
                        >
                            <TitleContainer
                                key="animation-on-state" 
                                variants={textMotion} 
                                initial="hidden" 
                                animate={hoveredBar === bar.id && !showTitleCard ? 'visible' : 'hidden'} 
                            >   
                                <Flex 
                                    alignContent={"center"} 
                                    justifyContent={"center"}
                                    onClick={() => handleBarClick(bar.title)}
                                    height={'100%'}
                                >
                                    <Center>
                                        <Heading as={'b'} fontSize={'5xl'} color={"#F8F3EE"}>
                                            {bar.title}
                                        </Heading>
                                    </Center>
                                </Flex>
                            </TitleContainer>
                        </motion.div>
                    ))}
                </div>
            </AbsoluteCenter>
        </Box>
    
    );
}

export default LandingPage;