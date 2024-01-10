import React, { useEffect, useState } from "react";
import { AbsoluteCenter, Box, Center, Flex, Heading,  useToast } from "@chakra-ui/react";
import NameCard from "../../components/NameCard";
import styled from "styled-components";
import { motion } from "framer-motion";
import { AiFillContacts, AiFillProject, AiFillInfoCircle } from "react-icons/ai";
import { MdWork } from "react-icons/md";
import { Pages, useViewContext } from "../../utils/ViewContext";
import { useBreakpointCheckerMobile } from "../../utils/breakpointChecker";
import { useIsFirstRender } from 'usehooks-ts'
import AboutModal from "../../components/AboutModal";
import { about } from "../../utils/content";


const LandingPage: React.FC = () => {
  
    const pageContext = useViewContext();
    const isFirstRender = useIsFirstRender();

    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const handleHover = (barId:number) => {
      setHoveredBar(barId);
    };
  
    const handleLeave = () => {
      setHoveredBar(null);
    };

    const sections = [
        { id: 0, color: '#1F77CB', title: 'About', icon: styled(AiFillInfoCircle)`color: #F8F3EE` },
        { id: 1, color: '#5894CE', title: 'Projects', icon: styled(AiFillProject)`color: #F8F3EE` },
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
                setAboutOpen(true);
                break;
            case 'Projects':
                pageContext.setPage(Pages.PROJECTS);
                pageContext.setTitle(false);
                break;
            case 'Experience':
                pageContext.setPage(Pages.EXPERIENCE);
                pageContext.setTitle(false);
                break;
            case 'Contacts':
                pageContext.setPage(Pages.CONTACT);
                pageContext.setTitle(false);
                break;
            default:
                break;
        }
    };

    const [aboutOpen, setAboutOpen] = useState<boolean>(false);
    const isMobile = useBreakpointCheckerMobile();
    const toast = useToast();

    useEffect(() => {
        if (pageContext.showTitle) {
            toast({
                title: "IN DEVELOPMENT",
                description: "Some features are not available & Content maybe missing",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: 'top'
            });
        }
    }, [isFirstRender, toast]);

    return (
        <Box margin={0} padding={0}>
            <AbsoluteCenter zIndex={2}>
                { pageContext.showTitle && <NameCard close={() => pageContext.setTitle(false)} /> }
            </AbsoluteCenter>
            <AbsoluteCenter>
                <div style={{ width: "100vw", margin: 0 }}>
                    {sections.map((bar) => (
                        <motion.div
                            key={bar.id}
                            style={{
                                backgroundColor: bar.color,
                                width: !pageContext.showTitle && hoveredBar !== null && hoveredBar !== bar.id ? '10vw' : '100vw',
                                height: '25vh',
                                transition: 'width 1s ease'
                            }}
                            onMouseEnter={() => handleHover(bar.id)}
                            onMouseLeave={handleLeave}
                        >
                            <TitleContainer
                                key="animation-on-state" 
                                variants={textMotion} 
                                initial="hidden" 
                                animate={hoveredBar === bar.id && !pageContext.showTitle ? 'visible' : 'hidden'} 
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
            <Center>
                <AboutModal 
                    open={aboutOpen} 
                    close={() => setAboutOpen(false)}
                    skills={about.skills}
                    skillsDescription={about.skillsDescription}
                    overview={about.overview}
                    githubLink={about.githubLink}
                    gmailLink={about.gmailLink}
                    linkedinLink={about.linkedinLink}
                />
            </Center>
        </Box>
    );
}

export default LandingPage;