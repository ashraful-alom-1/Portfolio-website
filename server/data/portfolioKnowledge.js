const portfolioKnowledge = {
  person: {
    name: 'Ashraful Alom',
    title: 'Full Stack Developer | B.Tech CSE Student',
    location: 'Palwal, Haryana, India',
    email: 'ashraful.abh@gmail.com',
    summary:
      'I am Ashraful Alom, a Full Stack Developer and B.Tech CSE student from Palwal, Haryana, India.',
    experienceStatus: [
      '3+ years of learning experience',
      'Fresher actively seeking first professional role',
      'No prior company employment'
    ],
    strengths: [
      'Quick Learner',
      'Problem Solver',
      'Good Listener',
      'Adaptability',
      'Time Management',
      'Self-Motivated',
      'Teamwork'
    ],
    hobbies: ['Photography', 'Travel', 'Football'],
    languages: [
      {
        name: 'Assamese',
        level: 'Native',
        details: 'I can read, write, and speak Assamese.'
      },
      {
        name: 'Bengali',
        level: 'Fluent',
        details: 'I can read, write, and speak Bengali.'
      },
      {
        name: 'Hindi',
        level: 'Fluent',
        details: 'I can read, write, and speak Hindi.'
      },
      {
        name: 'English',
        level: 'Elementary',
        details: 'I can read, write, and speak English, but not fluently.'
      }
    ]
  },
  education: [
    {
      degree: 'B.Tech CSE',
      institute: 'J.C. Bose University (YMCA), Faridabad',
      period: '2022-2026',
      status: 'Currently pursuing'
    },
    {
      degree: 'Higher Secondary (12th), Science stream',
      institute: 'Lengtisinga H.S. School',
      period: '2022'
    },
    {
      degree: 'HSLC (10th)',
      institute: 'Dr. B.R. Ambedkar High School',
      period: '2020'
    }
  ],
  skills: {
    technical: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'C', 'C++', 'Git', 'GitHub', 'MS Excel'],
    soft: ['Quick Learner', 'Problem Solver', 'Good Listener', 'Adaptability', 'Time Management', 'Self-Motivated', 'Teamwork']
  },
  certifications: [
    'KG Coding: HTML, CSS, Complete Coding',
    'NPTEL: Business Ethics - IIT Kharagpur',
    'NPTEL: Air Pollution - IIT Roorkee',
    'NPTEL: IoT - IIT Kharagpur',
    'NPTEL: Cloud Computing - IIT Kharagpur'
  ],
  awards: ['Mini Soccer - From DCTM'],
  projects: [
    {
      name: 'Abhayapuri Care Hospital',
      technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
      description: 'Hospital management system.'
    },
    {
      name: 'Ecommerce Website',
      technologies: ['Vanilla JavaScript'],
      description: 'Shopping cart, product listing, and responsive design.'
    },
    {
      name: 'E-Learning Platform',
      technologies: ['Responsive design'],
      description: 'Course layout and user-focused UI.'
    },
    {
      name: 'Car Showroom Website',
      technologies: ['Responsive design'],
      description: 'Automotive design and smooth animations.'
    },
    {
      name: 'Justice Desk',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      description: 'Multi-page legal service website.'
    },
    {
      name: 'Travel Website',
      technologies: ['Responsive design'],
      description: 'Destination showcase and interactive UI.'
    },
    {
      name: 'Interactive Calculator',
      technologies: ['JavaScript'],
      description: 'Real-time calculations and keyboard input support.'
    },
    {
      name: 'Basic Login Page',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      description: 'Form validation and authentication UI design.'
    },
    {
      name: 'C Language Programs',
      technologies: ['C'],
      description: 'Fundamental concepts and logic building collection.'
    }
  ],
  assistantPolicy: {
    fallback:
      "I don't have that specific information on my portfolio. Please contact me at ashraful.abh@gmail.com",
    strictRules: [
      'Use only the verified portfolioKnowledge data.',
      'Never guess, estimate, infer, or invent details.',
      'If the requested detail is not present, return the fallback sentence exactly.',
      'Do not answer CGPA, exact marks, age, phone number, salary, family details, JEE rank, semester details, project timelines, database choices, or other missing details.',
      'Match the response language to English or Hinglish when the question is answerable.',
      'Be concise and professional.',
      'ALWAYS speak in FIRST PERSON as "I", "me", "my". You ARE Ashraful Alom, not a third-party assistant. When asked who you are, say "I am Ashraful Alom".'
    ],
    intentAliases: {
      identity: [
        'name', 'who are you', 'who exactly', 'ashraful kaun', 'full name', 'identity',
        'portfolio kiski', 'whose portfolio', 'who owns', 'who created', 'bot', 'real ashraful',
        'tumhara naam', 'tera naam', 'aap kaun', 'tum kaun', 'kaun ho tum', 'pura naam',
        'kis se baat', 'website kiski', 'portfolio kiska', 'exactly kaun', 'naam aur kaam'
      ],
      profession: [
        'profession', 'occupation', 'what do you do', 'line of work', 'area of work',
        'developer', 'programmer', 'build websites', 'websites banate', 'coding karte',
        'tum karte kya ho', 'tumhara kaam', 'professionally kya', 'field mein kaam',
        'job karte ho ya padhai', 'employed ho ya student', 'tech mein ho'
      ],
      location: [
        'where are you from', 'where are you based', 'location', 'palwal', 'haryana',
        'india', 'home', 'native place', 'current base', 'north india', 'delhi ke paas',
        'kahan se ho', 'kahan rehte', 'ghar kahan', 'current location', 'kaunse state',
        'haryana se', 'indian ho'
      ],
      education: [
        'education', 'studying', 'degree', 'b.tech', 'btech', 'cse', 'college',
        'university', 'ymca', 'j.c. bose', '12th', 'hslc', '10th', 'school',
        'academic journey', 'education timeline', 'student life', 'padhai', 'kaunsa college',
        'abhi kya padh', 'education path', 'schooling aur college', 'academic institutions'
      ],
      skills: [
        'skills', 'technical skills', 'html', 'css', 'javascript', 'react', 'next.js',
        'tailwind', 'c++', 'git', 'github', 'ms excel', 'tech stack', 'stack',
        'tumhara skill', 'kaunsi skills', 'exactly tumhara stack', 'frontend libraries'
      ],
      softSkills: [
        'strength', 'strengths', 'soft skills', 'quick learner', 'problem solver',
        'problem solving', 'teamwork', 'self motivated', 'adapt', 'time management',
        'good candidate', 'hire you', 'bring to the team', 'strong points',
        'tumhari strength', 'key strengths', 'main strengths', 'soft skills kya',
        'team mein kya la sakte', 'kyun hire'
      ],
      weakness: [
        'weakness', 'weaknesses', 'weak points', 'limitations', 'drawbacks',
        'areas of improvement', 'not good at', 'struggle with', 'skills do you lack',
        'tumhari weakness', 'weak points kya', 'limitations kya', 'kami hai',
        'english mein weak', 'english acchi'
      ],
      projects: [
        'projects', 'portfolio work', 'flagship project', 'star project', 'best project',
        'hospital project', 'abhayapuri', 'ecommerce', 'e-learning', 'car showroom',
        'justice desk', 'travel website', 'calculator', 'login page', 'c programs',
        'project dikhao', 'kaunsa project', 'hospital project', 'ecommerce site',
        'calculator exactly', 'c programs collection'
      ],
      certifications: [
        'certification', 'certificate', 'nptel', 'kg coding', 'business ethics',
        'air pollution', 'iot', 'cloud computing', 'certifications kyun', 'certificate'
      ],
      awards: ['award', 'mini soccer', 'dctm', 'achievement', 'prized achievement'],
      languages: [
        'languages', 'speak', 'assamese', 'bengali', 'hindi', 'english', 'mother tongue',
        'linguistic', 'read and write', 'language', 'bolte', 'padh sakte', 'likh sakte',
        'english comfortable', 'professional emails english'
      ],
      hobbies: [
        'hobbies', 'free time', 'photography', 'travel', 'football', 'sports',
        'relax', 'hobby', 'kya pasand', 'football', 'travel', 'photography'
      ],
      experience: [
        'experience', 'fresher', 'professional experience', 'company employment',
        'prior company', 'experienced', 'learning experience', 'internship',
        'kya tum fresher', 'professional experience hai', 'experienced ho'
      ],
      contact: ['contact', 'email', 'reach', 'hire', 'project discuss', 'get in touch', 'kaise contact', 'email kya'],
      conversation: ['hi', 'hello', 'hey', 'howdy', 'yo', 'wassup', 'help', 'what can you do', 'kaise ho']
    }
  }
};

module.exports = portfolioKnowledge;