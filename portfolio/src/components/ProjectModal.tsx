import { Button, Heading, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text } from '@chakra-ui/react';
import React from 'react';

interface ProjectModalProps {
    open: boolean;
    close: () => void;
}



const ProjectModal: React.FC<ProjectModalProps> = (props: ProjectModalProps) => {
    const { open, close } = props;

    return (
        <Modal isOpen={open} onClose={close} isCentered size={'full'}>
            <ModalOverlay />
            <ModalContent bg={'#E3D1AB'} borderRadius={0}>
                <ModalHeader>
                    <Heading>Modal Title</Heading>
                 </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction={'row'}>
                        <Stack direction={'column'} >
                            <Image alignSelf={'center'} src={'https://media.licdn.com/dms/image/D5622AQF4vne1wTtN-g/feedshare-shrink_2048_1536/0/1693875912928?e=1698278400&v=beta&t=8BnW14NvMG0aer-Wrurfc1tdQ9l7LmgCc8mNi03nt2M'}/>
                        </Stack>
                        <Stack direction={'row'} >
                            <Text>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Nulla euismod, nisl vitae aliquam ultricies, nunc nisl
                                ultricies nunc, vitae aliquam nisl nisl vitae aliquam
                                ultricies, nunc nisl ultricies nunc, vitae aliquam nisl
                            </Text>  
                            <Text>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Nulla euismod, nisl vitae aliquam ultricies, nunc nisl
                                ultricies nunc, vitae aliquam nisl nisl vitae aliquam
                                ultricies, nunc nisl ultricies nunc, vitae aliquam nisl
                            </Text>                             
                        </Stack>
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={close}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ProjectModal;