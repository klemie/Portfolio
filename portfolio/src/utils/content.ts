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

type about = {
    gmailLink: string;
    overview: string[];
    skills: string[];
    skillsDescription: string;
    githubLink?: string;
    linkedinLink?: string;
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
        skillsDescription: 'This project was built on a micro service architecture with three services, frontend (Typescript React), telemetry (rust and python) and server (MongooseJs). ',
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
        skillsDescription: 'This project was built Rust and C, using STM32 on a custom PCB. ',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        linkedinLink: '',
        skills: ['Rust', 'Embedded Systems', 'HIL Testing'],
        competencies: [''],
    },
    {
        title: 'Software Process',
        color: 'experience',
        overview: `In my almost 2 years a Avionics software Lead I developed a Agile software process for the team. 
            Voluntary positions are hard to manage inside cross-functional teams, with that in mind I developed a process
            to encourage participation, and accountability using scrum techniques.`,
        timeline: 'Sep 2021 - Aug 2022',
        photos: [
            ''
        ],
        skillsDescription: 'The process was built using integrations between Trello and Monday.com.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        websiteLink: 'https://docs.google.com/presentation/d/1gkJjfWnc6jsr0PQ29cYPVdIOYFZum4SubFt4X8ovL-o/edit#slide=id.g15242db26bd_0_4',
        skills: ['Agile', 'Scrum', 'Monday.com', 'Trello', 'Github'],
        competencies: [''],
    },
    {
        title: 'Xenia-1 Flight Computer',
        color: 'about',
        overview: 'Flight Computer is ',
        timeline: 'Sep 2021 - Aug 2022',
        photos: [
            ''
        ],
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
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
        skillsDescription: '',
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
            'Standardized a agile software process for the team',
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
            'Worked with a small to develop a web application for a local HVAC company',
            'Elicited requirements from other teams and validated designs with HVAC technicians to ensure accuracy of the user experience',
            ''
        ]
    },
];

export const about: about = {
    overview: [
        `Hello my name is Kris, and I am an anomaly. I am a technically trained hardware engineer that loves UX/UI.
        I aspire to create visually pleasing and hopefully functional usually web applications.My interest in software 
        development, specifically web development, began in high school when I attempted to create a cool math games 
        clone for a variety of P5JS 2D games developed by my peers.`,
        `Today, I am a fifth-year Computer Engineering student at UVic. I've been involved in a range of projects, from 
        web development to embedded systems, with a majority of them within the UVic Rocketry Team. Along side my 
        technical skills, I've developed a liking for project management and optimizing administrative processes, to the extent 
        that I kanban my day to day life.`,
        `I am currently looking for a 4 month co-op position for the starting May 2024. If you are interested in working with me 
        please feel free to contact me through email or linkedin.`
    ],
    skillsDescription: 'Here are a few technologies I\'ve been working with recently:',
    skills: ['TypeScript', 'React', 'MongooseJS', 'Rust', 'STM32'],
    githubLink: 'https://github.com/klemie',
    gmailLink: 'mailto: lemieuxkristopher@gmail.com',
    linkedinLink: 'https://www.linkedin.com/in/klemie/'
};
