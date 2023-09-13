import React, { useState } from "react";
import { AbsoluteCenter, Container, Flex, Heading, Spacer, Stack, Text } from "@chakra-ui/react";
import NameCard from "../components/NameCard";
import styled from "styled-components";
import { motion } from "framer-motion";
import { AiFillContacts, AiFillProject, AiFillInfoCircle } from "react-icons/ai";
import { MdWork } from "react-icons/md";
import { IconContext } from "react-icons";

const LandingPage: React.FC = () => {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [showTitleCard, setShowTitleCard] = useState<boolean>(true);
    const handleHover = (barId:number) => {
      setHoveredBar(barId);
    };
  
    const handleLeave = () => {
      setHoveredBar(null);
    };
    const sections = [
        { id: 0, color: '#005EB8', title: 'About', icon: styled(AiFillInfoCircle)`color: #F8F3EE` },
        { id: 1, color: '#4588C9', title: 'Project', icon: styled(AiFillProject)`color: #F8F3EE` },
        { id: 2, color: '#D65B4F', title: 'Experience', icon: styled(MdWork)`color: #F8F3EE`  },
        { id: 3, color: '#FFC557', title: 'Contacts', icon: styled(AiFillContacts)`color: #F8F3EE`  }
    ];

    const TitleContainer = styled(motion.div)`
        cursor: pointer;
        z-index: 2;
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

    return (
        <Container margin={0} padding={0}>
            {/* <Grid/> */}
            <AbsoluteCenter zIndex={2}>
                { showTitleCard && <NameCard close={() => setShowTitleCard(false)} /> }
            </AbsoluteCenter>
            <AbsoluteCenter>
                <div style={{ width: "100vw", margin: "none" }}>
                    {sections.map((bar) => (
                        <motion.div
                            key={bar.id}
                            style={{
                                backgroundColor: bar.color,
                                width: !showTitleCard && hoveredBar !== null && hoveredBar !== bar.id ? '10vw' : '100vw',
                                height: '80px',
                                transition: 'width 1s ease',
                                marginTop: '20px'
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
                                <Flex direction={'row'} alignItems={'center'} justifyItems={'center'} marginX={5}>
                                    <Heading as={'b'} fontSize={'5xl'} color={"#F8F3EE"}>
                                        {bar.title}
                                    </Heading>
                                    <Spacer />
                                    <IconContext.Provider value={{ size: "40", color: "#F8F3EE" }}>
                                        {<bar.icon />}
                                    </IconContext.Provider>
                                </Flex>
                            </TitleContainer>
                        </motion.div>
                    ))}
                </div>
            </AbsoluteCenter>
        </Container>
    
    );
}

export default LandingPage;