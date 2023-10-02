import tableTappAward from '../../public/assets/TableTapp - award.png';
import tableTappTeam from '../../public/assets/TableTapp - team.png';
import tableTappCustomer from '../../public/assets/TableTapp - Customer.png';
import tableTappSetup from '../../public/assets/TableTapp - Table Setup.png';
import tableTappRestaurant from '../../public/assets/TableTapp - restraunt.png';

type project = {
    photos: string[] | [];
    color: string;
    title: string;
    overview: string;
    skills: string[];
    competencies: string[];
    skillsDescription: string;
    timeline: string;
    githubLink?: string;
    websiteLink?: string;
    linkedinLink?: string;
};

type experience = {
    position: string;
    company: string;
    duration : string;
    startDate: string;
    endDate: string;
    coop: boolean;
    points: string[];
};

export const projects: project[] = [
    {
        title: 'Ground Support',
        overview: 'Ground Support is a telemetry visualization and post flight analysis tool developed by the University of Victoria Rocketry Team. It is designed to be a modular and dynamic application that can be used for any configuration of sounding rocket.',
        color: 'projects',
        photos: [
            'https://media.licdn.com/dms/image/D5622AQG3_kI_-ujfuQ/feedshare-shrink_2048_1536/0/1693875908809?e=1698883200&v=beta&t=J-jSNFPfeaPJ70p09YCSVaLbMFkbxBmpPQSjOQLCuRg',
            'https://media.licdn.com/dms/image/D5622AQF4vne1wTtN-g/feedshare-shrink_2048_1536/0/1693875912928?e=1698883200&v=beta&t=QgTeAd5-xrtwozvOi2U54Kk_r996KPGoDLweJ1oCaqM',
            'https://media.licdn.com/dms/image/D5622AQEFr7C3q54NHQ/feedshare-shrink_2048_1536/0/1693875912637?e=1698883200&v=beta&t=hQ3xQRvtyjPq6eQFSGlK9_y2WqiO1HD61aSLCSUCB8o'
        ],
        timeline: 'Sep 2022 - present',
        skillsDescription: 'This project was built using Typescript React . It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Ground-Support',
        linkedinLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
        skills: ['TypeScript', 'React', 'Rust', 'MongooseJS', 'MUI', 'REST'],
        competencies: ['Web Development', 'UI/UX Design', 'API Design']
    },
    {
        title: 'TableTapp',
        color: 'experience',
        overview: 'Small restaurant businesses run on small profit margins and often have to subscribe to multiple software solutions in order to run their business. Our solution to this is TableTapp, an all-in-one service industry solution with the added benefit of serverless in-restaurant ordering. ',
        photos: [
            tableTappTeam,
            tableTappAward,
            tableTappSetup,
            tableTappCustomer,
            tableTappRestaurant
        ],
        timeline: 'May 2023 - Aug 2023',
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Ground-Support',
        websiteLink: 'https://tabletapp.github.io/TableTapp/',
        linkedinLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
        skills: ['TypeScript', 'React', 'MongooseJS', 'ChakraUI', 'REST'],
        competencies: ['Web Development', 'UI/UX Design', 'API Design']
    },
    {
        title: 'Hybrid Monitor System',
        color: 'about',
        timeline: 'Sep 2023 - present',
        overview: `UVic Rocketry has been developing a test hybrid engine for over 
            5 years with a major pain point of the between the valve cart and controls box. 
            This system currently uses a serial usb connection and has proven to be unreliable. 
            Reliability of the system is instrumental to its safe operation at a remote distance. 
            The purpose and scope of this project would be to investigate other communication methods 
            (fibre optic, RF) and integrate the current system with a more robust motoriting/control system. 
            goals would be to simplify setup of the system, increase readability and maintainability of the codebase. 
            If this project is successful it will aid in completing UVic Rocketry’s first ever hotfire test for the test engine.`,
        photos: [
            ''
        ],
        skillsDescription: 'sadas',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        skills: ['Rust', 'Embedded Systems'],
        competencies: [''],
    },
    {
        title: 'AndÚril Flight Computer',
        color: 'contact',
        overview: 'Flight Computer is ',
        timeline: 'Sep 2023 - present',
        photos: [
            ''
        ],
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        linkedinLink: '',
        skills: ['Python', 'Embedded Systems'],
        competencies: [''],
    },
    {
        title: 'Xenia-1 Flight Computer',
        color: 'experience',
        overview: 'Flight Computer is ',
        timeline: 'Sep 2021 - Aug 2022',
        photos: [
            ''
        ],
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        linkedinLink: '',
        skills: ['Python', 'Embedded Systems'],
        competencies: [''],
    },
    {
        title: 'Hybrid Controls System',
        color: 'projects',
        overview: 'Flight Computer is ',
        timeline: 'Dec 2019 - Mar 2021',
        photos: [
            ''
        ],
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        linkedinLink: '',
        skills: ['Python', 'Embedded Systems'],
        competencies: [''],
    }
];

export const experiences: experience[] = [
    {
        company: 'UVic Rocketry',
        position: 'Technical Coordinator',
        startDate: 'Sep 2022',
        endDate: 'Present',
        duration: '1 yr 2 months',
        coop: false,
        points: [
            'Led a team of 5 software developers to create a web application for the UVic Rocketry team',
            'Designed and implemented a REST API to allow the web application to communicate with the rocket and launch site',
            'Designed and implemented a UI/UX for the web application'
        ]
    },
    {
        company: 'UVic Rocketry',
        position: 'Avionics co-lead',
        startDate: 'Mar 2021',
        coop: false,
        endDate: 'Sep 2022',
        duration: '1 yr 7 months',
        points: [
            ''
        ]
    },
    {
        company: 'UVic Rocketry',
        position: 'Media Lead',
        startDate: 'Mar 2021',
        endDate: 'Sep 2022',
        duration: '1 yr 7 months',
        coop: false,
        points: [
            ''
        ]
    },
    {
        company: 'UVic Rocketry',
        position: 'Propulsion Member',
        coop: false,
        startDate: 'Dec 2019',
        endDate: 'Mar 2021',
        duration: '1 yr 4 months',
        points: [
            ''
        ]
    },
    {
        company: 'Helm Operations',
        position: 'Full Stack Developer',
        coop: true,
        startDate: 'Jan 2020',
        endDate: 'Apr 2020',
        duration: '9 months',
        points: [
            ''
        ]
    },
    {
        company: 'Helm Operations',
        position: 'Contract Software Engineer',
        coop: false,
        startDate: 'Sep 2022',
        endDate: 'Jan 2023',
        duration: '5 months',
        points: [
            ''
        ]
    },
    {
        company: 'Island Temperature Controls',
        position: 'Graphics Developer DDC',
        coop: true,
        startDate: 'Sep 2022',
        endDate: 'Jan 2023',
        duration: '4 months',
        points: [
            ''
        ]
    },
];
