import React from "react";
import { AbsoluteCenter,  Container, Flex, Stack, useDisclosure, Button, Box, Spacer } from "@chakra-ui/react";
import NameCard from "./NameCard";
import TitleBar from "../components/Titlebar";

const LandingPage: React.FC = () => {

    const sections = [
        { color: '#005EB8', title: 'About', active: true, disclosure: useDisclosure(), margin: "5" },
        { color: '#4588C9', title: 'Project', active: true, disclosure: useDisclosure(), margin: "25%" },
        { color: '#D65B4F', title: 'Experience', active: true, disclosure: useDisclosure(), margin: "50%" },
        { color: '#FFC557', title: 'Contacts', active: true, disclosure: useDisclosure(), margin: "75%" }
    ];
    return (
        <Container w={'100vw'} h={'100vh'} bg={'#F8F3EE'} margin={0} padding={0}>
            <AbsoluteCenter>
                {/* <NameCard /> */}
            </AbsoluteCenter>
            <Button onClick={sections[0].disclosure.onToggle}>About</Button>
            <Button onClick={sections[1].disclosure.onToggle}>Project</Button>
            <Button onClick={sections[2].disclosure.onToggle}>Experience</Button>
            <Button onClick={sections[3].disclosure.onToggle}>Contacts</Button>

            <AbsoluteCenter>    
                <Box w={'100vw'} h={'400'} alignItems={'center'} bg={'#F8F3EE'}>
                    <TitleBar color={sections[0].color} title={sections[0].title} disclosure={sections[0].disclosure} margin={sections[0].margin} />
                    <Spacer />
                    <TitleBar color={sections[1].color} title={sections[1].title} disclosure={sections[1].disclosure} margin={sections[1].margin} />
                    <Spacer />
                    <TitleBar color={sections[2].color} title={sections[2].title} disclosure={sections[2].disclosure} margin={sections[2].margin} />
                    <Spacer />
                    <TitleBar color={sections[3].color} title={sections[3].title} disclosure={sections[3].disclosure} margin={sections[3].margin} />
                </Box>
                    {/* <Flex direction={"column"} gap={5}>
                        {sections.map((section, index) => {
                            return (
                                <>
                                    <TitleBar key={index} color={section.color} title={section.title} disclosure={section.disclosure} margin={section.margin} />
                                    <Spacer />
                                </>
                            )
                        })}
                    </Flex> */}
            </AbsoluteCenter>
        </Container>
    
    );
}

export default LandingPage;