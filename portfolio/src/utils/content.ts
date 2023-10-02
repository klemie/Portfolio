type project = {
    photos: string[];
    color: string;
    title: string;
    overview: string;
    skills: string[];
    competencies: string[];
    skillsDescription: string;
    githubLink?: string;
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
        overview: 'Ground Support is a web application that allows users to view and manage the status of the rocket and its subsystems. It also allows users to view and manage the status of the launch site and its subsystems.',
        color: 'projects',
        photos: [
            'https://media.licdn.com/dms/image/D5622AQG3_kI_-ujfuQ/feedshare-shrink_2048_1536/0/1693875908809?e=1698883200&v=beta&t=J-jSNFPfeaPJ70p09YCSVaLbMFkbxBmpPQSjOQLCuRg',
            'https://media.licdn.com/dms/image/D5622AQF4vne1wTtN-g/feedshare-shrink_2048_1536/0/1693875912928?e=1698883200&v=beta&t=QgTeAd5-xrtwozvOi2U54Kk_r996KPGoDLweJ1oCaqM',
            'https://media.licdn.com/dms/image/D5622AQEFr7C3q54NHQ/feedshare-shrink_2048_1536/0/1693875912637?e=1698883200&v=beta&t=hQ3xQRvtyjPq6eQFSGlK9_y2WqiO1HD61aSLCSUCB8o'
        ],
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Ground-Support',
        linkedinLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
        skills: ['TypeScript', 'React', 'Rust', 'MongooseJS', 'MUI', 'REST'],
        competencies: ['Web Development', 'UI/UX Design', 'API Design']
    },
    {
        title: 'TableTapp',
        color: 'experience',
        overview: 'TableTapp is ',
        photos: [
            ''
        ],
        skillsDescription: 'This project was built using React and Chakra UI. It is hosted on Netlify.',
        githubLink: 'https://github.com/UVicRocketry/Ground-Support',
        linkedinLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
        skills: ['TypeScript', 'React', 'MongooseJS', 'ChakraUI', 'REST'],
        competencies: ['Web Development', 'UI/UX Design', 'API Design']
    },
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
