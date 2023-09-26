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