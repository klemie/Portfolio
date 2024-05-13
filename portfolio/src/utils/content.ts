import tableTappAward from '../../public/assets/TableTapp - award.png';
import tableTappTeam from '../../public/assets/TableTapp - team.png';
import tableTappCustomer from '../../public/assets/TableTapp - Customer.png';
import tableTappSetup from '../../public/assets/TableTapp - Table Setup.png';
import tableTappRestaurant from '../../public/assets/TableTapp - restraunt.png';

import X1FC1 from '../../public/assets/Xenia1-FC-1.png';
import X1FC2 from '../../public/assets/Xenia1-FC-2.png';
import X1FC3 from '../../public/assets/Xenia1-FC-3.png';
import X1FC4 from '../../public/assets/Xenia1-FC-4.png';

import HBC1 from '../../public/assets/HBC-1.png';
import HBC2 from '../../public/assets/HBC-2.png'

import GS1 from '../../public/assets/GS-1.jpg';
import GS2 from '../../public/assets/GS-2.jpg';
import GS3 from '../../public/assets/GS-3.jpg';
import GS4 from '../../public/assets/GS-4.jpg';

type project = {
    photos: string[] | [];
    color: string;
    title: string;
    overview: string[];
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
        overview: [`Ground Support is a telemetry visualization and post flight analysis tool developed by the University of 
        Victoria Rocketry Team. It is designed to be a modular and dynamic 
        application that can be used for any configuration of sounding rocket.`],
        color: 'projects',
        photos: [
            GS1,
            GS2,
            GS3,
            GS4
        ],
        timeline: 'Sep 2022 - present',
        skillsDescription: 'This project was built on a micro service architecture with three services, frontend (Typescript React), telemetry (rust and python) and server (Express and MongooseJs). ',
        githubLink: 'https://github.com/UVicRocketry/Ground-Support',
        linkedinLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
        skills: ['TypeScript', 'React', 'Rust', 'MongooseJS', 'MUI', 'REST'],
        competencies: ['Web Development', 'UI/UX Design', 'API Design']
    },
    {
        title: 'TableTapp',
        color: 'experience',
        overview: [
            `Small restaurant businesses run on small profit margins and often have to subscribe to 
            multiple software solutions in order to run their business. Our solution to this is TableTapp, 
            an all-in-one service industry solution with the added benefit of serverless in-restaurant ordering.`,
            `In the project I took responsibilities of UX/UI Designer, Scrum master, Full stack developer. Since 
            the project was limited to a semester we worked as a team to develop realistic time estimates and design phases 
            delivered through a sprint scrum process. The team as a whole treated the project as a start up
            has it had a high viability and targeted an product area that had minimal innovation as suggested through market research.`,
            `Throughout the deign and development process I created wireframes and prototypes in Figma for all three
            sections (Front of house, back of house, and customer) of the application. These designs were validated and 
            improved through UX surveys and interviews with restaurant owners and front and back of house professionals. 
            These designs then influenced the system design of the entity based mongoDB documents and the REST API. More 
            specifically all sections of the application would share the same entity with different permissions being present depending
            on the solution being used. Towards the end of the project I was responsible for the customer side and reliability 
            of the api and database. For the demonstration we had the customer and restaurant side connected to show off our ticketing system.`,
    ],
        photos: [
            tableTappTeam,
            tableTappAward,
            tableTappSetup,
            tableTappCustomer,
            tableTappRestaurant
        ],
        timeline: 'May 2023 - Aug 2023',
        skillsDescription: 'This project was built with the MERN stack using React and Chakra UI. With a backend in ExpressJS and MongoDB.',
        githubLink: 'https://github.com/UVicRocketry/Ground-Support',
        websiteLink: 'https://tabletapp.github.io/TableTapp/',
        linkedinLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
        skills: ['TypeScript', 'React', 'MongooseJS', 'ChakraUI', 'REST'],
        competencies: ['Web Development', 'UI/UX Design', 'API Design']
    },
    {
        title: 'Hybrid Monitoring System',
        color: 'about',
        timeline: 'Jan 2024 - present',
        overview: [`UVic Rocketry has been developing a test hybrid engine for over 
            5 years with a major pain point of the between the valve cart and controls box. 
            This system currently uses a serial usb connection and has proven to be unreliable. 
            Reliability of the system is instrumental to its safe operation at a remote distance. 
            The purpose and scope of this project would be to investigate other communication methods 
            (fibre optic, RF) and integrate the current system with a more robust motoring/control system. 
            goals would be to simplify setup of the system, increase readability and maintainability of the codebase. 
            If this project is successful it will aid in completing UVic Rocketry’s first ever hotfire test for the test engine.`,
            `This project was taken on as a directed studies course with the goal of developing a 
            functional prototype in 4 months or less. For the scope of the four months I will integrate 
            instrumentation and valve control to communicate with mission control over one communication line.
            The act of integrating instrumentation and control into one platforms will eliminate the need for two separate 
            software platforms (labview and controls) which has been an issue in the past.`,
            `To combine the controls and instrumentation a mini-pc running linux connects directly to the labjack and the arduino. 
            This serves as a middle man relaying packets over a socket network connection to the mission control. The mission 
            control is an addon to the already built Ground Support which is designed to be configurable which allows greater expansion as 
            our propulsion systems evolve. The addition to this system will display instrumentation graphs and controls in one 
            panel, opening the way to automated shut down in case of malfunction detected by the instrumentation. On the Valve 
            cart side a custom python driver leveraging labjacks built in C based library for the U6-pro will extract raw filtered 
            data to the socket connection. Whilst the controls communicates both ways over serial to the socket. In real time operation 
            the system will relay controls and instrumentation separately and display them as they arrive.
            `
        ],
        photos: [
            ''
        ],
        skillsDescription: `The projects main scope is to combine the instrumentation and valve control to communicate with mission 
        control over one connection.`,
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        skills: ['Labjack', 'Arduino', 'Full stack', 'Communication Networks'],
        competencies: [
            'Investigated multiple solutions for communication through weighted objectives chart and cost analysis', 
            'Extracted instrumentation data from a Labjack and control feedback from a Arduino and sent it over a Ethernet connected to mission control computer',
            'Integrated Valve control and instrumentation GUI into ground support system, consulating all ground operations for rocket and engine develop into one system'
        ],
    },
    {
        title: 'AndÚril Flight Computer',
        color: 'contact',
        overview: [
            `This Project is rocketry's first attempt at a developing a rust based 
            flight computer system. My contribution to the project was do an investigation and report 
            into the viability of rust in embedded systems.`,
            `After the an assessment of the viability of rust was done it was determined we needed a stronger base in C 
            before we could move to rust. This lead into the develop of C based drivers for the STM32 microcontroller.`
        ],
        timeline: 'Sep 2023 - present',
        photos: [
            ''
        ],
        skillsDescription: ``,
        githubLink: '',
        linkedinLink: '',
        websiteLink: 'https://drive.google.com/drive/folders/1HmbC9vWZxt-nJ8LGUyFYhisnisMbH3kO?usp=share_link',
        skills: ['Rust', 'Embedded Systems', 'HIL Testing', 'STM32'],
        competencies: [
            'Developed series of technical report focusing on evaluating rusts viability in embedded systems using quantifiable metrics',
            'Migrated Xenia-2 C++ codebase to rust, validated system through HIL testing. Plan to fly in on a L1 certification flight Feb 2024.',
            'Wrote guide on how to use rust in embedded systems to help onboard new members.'
        ],
    },
    {
        title: 'Xenia-1 Flight Computer',
        color: 'about',
        overview: [
            `Xenia-1 was the first rocket that UVR developed coming out of covid-19. Due to the pandemic restrictions the team lost mass of members, 
            therefore the avionics team simplified the system to operate off of a raspberry pi using python. Though the avionics system was simplified the rocket itself was
            contained some of the most ambition projects, such as airbrakes and a deployable payload.`,
            `During this time I was the Software lead of rocketry, making it my responsibility to ensure all embedded systems were tested and 
            developed according to team wide deadlines. As a project manager in collaboration with the electrical lead I developed requirements, epics and throughout development 
            created tasks with clear acceptance criteria. In the development side of thing using the requirement I implemented the foundations of a object oriented design pattern to allow for simple abstraction 
            of the HAL features. In addition I developed sensor fault detection and migration so the airbrakes system would always act on reliable data.`
        ],
        timeline: 'Sep 2021 - Aug 2022',
        photos: [
            X1FC1,
            X1FC2,
            X1FC3,
            X1FC4
        ],
        skillsDescription: 'This project was built using python using adafruit libraries and a raspberry pi.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        skills: ['Python', 'Embedded Systems'],
        competencies: [
            'Use Object Oriented principles in combination with an embedded libraries to develop a reliable data logger',
            'Taught new members and younger students how to use git and python for embedded development',
            'Created a backlog of tasks with concrete goals and acceptance create and assigned them to members by helping them break down the task into smaller pieces'
        ],
    },
    {
        title: 'Software Process',
        color: 'experience',
        overview: [
            `In my almost 2 years a Avionics software Lead I developed a Agile software process for the team. 
            Voluntary positions are hard to manage inside cross-functional teams, with that in mind I developed a process
            to encourage participation, and accountability using scrum techniques.`
        ],
        timeline: 'Sep 2021 - Aug 2022',
        photos: [
            ''
        ],
        skillsDescription: 'The process was built using integrations between Trello and Monday.com.',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        websiteLink: 'https://docs.google.com/presentation/d/1gkJjfWnc6jsr0PQ29cYPVdIOYFZum4SubFt4X8ovL-o/edit#slide=id.g15242db26bd_0_4',
        skills: ['Agile', 'Scrum', 'Monday.com', 'Trello', 'Github'],
        competencies: [
            'Developed a series of presentations to teach new members how to use the process',
            'Recorded a series of video to teach members how the process works, through demonstrating a ticket lifecycle'
        ],
    },

    {
        title: 'Hybrid Controls System',
        color: 'projects',
        overview: [
            `For my first project in the rocketry club I developed multiple iterations of a GUI to 
            interface with and control valves`
        ],
        timeline: 'Dec 2019 - Mar 2021',
        photos: [
            HBC1,
            HBC2
        ],
        skillsDescription: '',
        githubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
        linkedinLink: '',
        skills: ['Python', 'Socket', 'C++', 'Qt'],
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
            'Oversaw a backlog, and assigned tasks through an 3 week sprint to ensure member participation',
            'Ran full stack skilldevs to onboard new members and ensure members are comfortable with the MERN stack',
            'Developed a mirco service based system to allow for open source the project for other rocketry teams to use',
            'Designed UI/UX in Figma and ensured implementation matched design pattern'
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
            'Created series presentations, figma prototypes, and videos to onboard new members',
            'Designed and implemented a object oriented design pattern for the HAL features of the rocket'
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
            'Organized fundraisers and events to raise money and community presence for the team',
            'Developed sponsorship packages and reached out to potential sponsors, landing sponsorship from Lockheed Martian and other aerospace companies',
            'Maintained a social media presence on Instagram and LinkedIn',
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
            'Developed a GUI to interface with and control valves',
            ''
        ]
    },
    {
        company: 'Helm Operations',
        position: 'Full Stack Developer',
        coop: true,
        startDate: 'Jan 2022',
        endDate: 'Sept 2022',
        duration: '9 months',
        points: [
            'Designed, Developed, Tested and implemented a feature that enables the saving filtering presets for a dispatching system.',
            'Created complex API endpoints, data and schema migrations to interact with a LINQ backbone.',
            'Contributed to Quality assurance efforts by identifying bugs and unexpected workflows.'
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
            'Prototype features that were demonstrated at conferences to over 100 representatives from separate companies',
            'Created client requested features to help win bids for large maritime commodities',
            'Communicated with product team to for technical insight into there designs',
            'Developed and alters foundational frontend components for new VueJS'
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
            'Coordinated directly with technicians to improve design by ensuring accuracy and  user experience'
        ]
    },
];

export const about: about = {
    overview: [
        `Hello my name is Kris, I am a avid gravel cyclist, artist, and slightly illiterate Software Engineer. 
        Growing up with Dyslexia my outlet was to express myself visually any way I could, from traditional painting 
        to graphic design. This came to a head when in high school I was introduced to web site development and 
        I became obsessed.`,
        `Today, I am on my cusp of Graduating with a bachelors of Computer Engineering from the University of Victoria, 
        as of December 2024. Throughout the 5 years of university I've been involved in a range of projects, from web 
        development to mechatronics systems, with a majority of them within the UVic Rocketry Team. My favorite type of 
        projects often involves a mix of software and hardware which require a deep understanding of system design. 
        Along side my technical skills, I've developed a liking for project and people management, as there is no greater 
        feeling when match the right person to the right task and see them thrive.`,
        `I am currently looking to finish off my degree on 4 month co-op which would start September 2024. If you are 
        interested in working with me please feel free to contact me through email or linkedin.`
    ],
    skillsDescription: 'Here are a few technologies I\'ve been working with recently:',
    skills: ['TypeScript', 'React', 'MongooseJS', 'Rust', 'Commination Networks', 'Asynchronous Python'],
    githubLink: 'https://github.com/klemie',
    gmailLink: 'mailto: lemieuxkristopher@gmail.com',
    linkedinLink: 'https://www.linkedin.com/in/krislemie/'
};
