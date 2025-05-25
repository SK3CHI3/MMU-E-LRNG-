// Real data from MMU Kenya website - https://www.mmu.ac.ke/faculties-and-academic-programmes/

export interface Programme {
  name: string;
  level: 'Masters' | 'Bachelors' | 'Diploma' | 'Certificate';
  duration?: string;
}

export interface Department {
  name: string;
  programmes?: Programme[];
}

export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  description: string;
  dean?: string;
  departments: Department[];
  programmes: Programme[];
  icon: string;
  color: string;
}

export const mmuFaculties: Faculty[] = [
  {
    id: 'fobe',
    name: 'Faculty of Business and Economics',
    shortName: 'FoBE',
    description: 'Empowering future business leaders and economists with knowledge, skills, and experiences needed to thrive in today\'s dynamic global marketplace.',
    dean: 'Dr. Dorcas Kerre (PhD, MMSK)',
    departments: [
      { name: 'Department of Finance and Accounting' },
      { name: 'Department of Marketing and Management' },
      { name: 'Department of Procurement and Logistics Management' }
    ],
    programmes: [
      // Masters
      { name: 'Master in Business Administration (MBA)', level: 'Masters' },
      { name: 'Master of Science in Economics', level: 'Masters' },
      { name: 'Master of Science in Supply Chain Management', level: 'Masters' },
      // Bachelors
      { name: 'Bachelor of Commerce', level: 'Bachelors' },
      { name: 'Bachelor of Procurement and Logistics Management', level: 'Bachelors' },
      { name: 'Bachelor of Business Information Technology', level: 'Bachelors' },
      { name: 'Bachelor of Science in Actuarial Science', level: 'Bachelors' },
      { name: 'Bachelor of Science in Economics', level: 'Bachelors' },
      // Diplomas
      { name: 'Diploma in Business Administration', level: 'Diploma' },
      { name: 'Diploma in Human Resource Management', level: 'Diploma' },
      { name: 'Diploma in Procurement and Logistics Management', level: 'Diploma' },
      { name: 'Diploma in Hospitality and Tourism Management', level: 'Diploma' },
      { name: 'Diploma in Marketing', level: 'Diploma' },
      // Certificates
      { name: 'CIPS Professional Courses', level: 'Certificate' }
    ],
    icon: 'TrendingUp',
    color: 'blue'
  },
  {
    id: 'focit',
    name: 'Faculty of Computing and Information Technology',
    shortName: 'FoCIT',
    description: 'Leading in ICT training, research and innovation with state-of-the-art laboratories and partnerships with industry leaders like Huawei, Google, Microsoft, IBM and Cisco.',
    dean: 'Dr. Moses O. Odeo (PhD)',
    departments: [
      { name: 'Department of Computer Science' },
      { name: 'Department of Information Technology' },
      { name: 'Kenya-Korea IAC - Centre' }
    ],
    programmes: [
      // Masters
      { name: 'Master of Science in Information Technology', level: 'Masters' },
      { name: 'Master of Science in Computer Science', level: 'Masters' },
      // Bachelors
      { name: 'Bachelor of Science in Computer Technology', level: 'Bachelors' },
      { name: 'Bachelor of Science in Computer Science', level: 'Bachelors' },
      { name: 'Bachelor of Science in Software Engineering', level: 'Bachelors' },
      { name: 'Bachelor of Science in Information Technology', level: 'Bachelors' },
      // Diplomas
      { name: 'Diploma in ICT', level: 'Diploma' },
      // Certificates
      { name: 'International Computer Driving Licence', level: 'Certificate' },
      { name: 'Huawei Certified Network Associate (HCNA)', level: 'Certificate' },
      { name: 'Cisco Certified Network Associate (CCNA)', level: 'Certificate' }
    ],
    icon: 'Computer',
    color: 'green'
  },
  {
    id: 'foet',
    name: 'Faculty of Engineering and Technology',
    shortName: 'FoET',
    description: 'Providing cutting-edge engineering education and research in electrical, mechanical, civil engineering and emerging technologies.',
    departments: [
      { name: 'Department of Electrical & Communication Engineering (ECE)' },
      { name: 'Department of Mechanical & Mechatronics Engineering (MME)' },
      { name: 'Department of Civil Engineering (CE)' }
    ],
    programmes: [
      // Note: Specific programmes not detailed in the source, but these are typical for engineering faculties
      { name: 'Bachelor of Engineering in Electrical & Communication', level: 'Bachelors' },
      { name: 'Bachelor of Engineering in Mechanical & Mechatronics', level: 'Bachelors' },
      { name: 'Bachelor of Engineering in Civil Engineering', level: 'Bachelors' }
    ],
    icon: 'Cog',
    color: 'orange'
  },
  {
    id: 'fameco',
    name: 'Faculty of Media and Communication',
    shortName: 'FAMECO',
    description: 'Training the next generation of media professionals and communication experts in film, broadcast, journalism and digital media.',
    departments: [
      { name: 'Department of Film and Broadcast' },
      { name: 'Department of Journalism and Communication' }
    ],
    programmes: [
      // Note: Specific programmes not detailed in the source
      { name: 'Bachelor of Arts in Journalism and Communication', level: 'Bachelors' },
      { name: 'Bachelor of Arts in Film and Broadcast Production', level: 'Bachelors' }
    ],
    icon: 'Video',
    color: 'purple'
  },
  {
    id: 'fost',
    name: 'Faculty of Science & Technology',
    shortName: 'FoST',
    description: 'Advancing scientific knowledge and technological innovation through comprehensive programmes in chemistry, physics, and mathematics.',
    departments: [
      { name: 'Department of Chemistry' },
      { name: 'Department of Physics' },
      { name: 'Department of Mathematics' }
    ],
    programmes: [
      { name: 'Bachelor of Science in Chemistry', level: 'Bachelors' },
      { name: 'Bachelor of Science in Physics', level: 'Bachelors' },
      { name: 'Bachelor of Science in Mathematics', level: 'Bachelors' }
    ],
    icon: 'Atom',
    color: 'indigo'
  },
  {
    id: 'fosst',
    name: 'Faculty of Social Sciences and Technology',
    shortName: 'FoSST',
    description: 'Exploring human behavior, society, and governance through interdisciplinary approaches in psychology, sociology, and political science.',
    departments: [
      { name: 'Department of Psychology' },
      { name: 'Department of Sociology' },
      { name: 'Department of Political Science' }
    ],
    programmes: [
      { name: 'Bachelor of Arts in Psychology', level: 'Bachelors' },
      { name: 'Bachelor of Arts in Sociology', level: 'Bachelors' },
      { name: 'Bachelor of Arts in Political Science', level: 'Bachelors' }
    ],
    icon: 'Users',
    color: 'pink'
  }
];

export const mmuInstitutes = [
  {
    id: 'niol',
    name: 'National Institute for Optics & Lasers (NIOL)',
    description: 'Training students in Optics and Lasers at certificate, diploma, undergraduate and postgraduate levels while conducting cutting-edge research.',
    established: 'March 2019',
    focus: 'Optics and Lasers training and research'
  },
  {
    id: 'tvet',
    name: 'MMU TVET Centre',
    description: 'Technical and Vocational Education and Training focusing on practical skills and knowledge for specific trades and occupations.',
    focus: 'Diploma courses with technical skills development'
  },
  {
    id: 'bps',
    name: 'Board of Postgraduate Studies',
    description: 'Managing postgraduate programmes, fostering research excellence, and nurturing professional proficiency across various disciplines.',
    focus: 'Masters and Doctoral programmes coordination'
  }
];

export const mmuStats = {
  faculties: 6,
  departments: 15,
  directorates: 5,
  totalProgrammes: 53,
  mastersProgrammes: 16,
  bachelorsProgrammes: 24,
  diplomaProgrammes: 11,
  certificateProgrammes: 3
};

export const mmuContact = {
  address: 'P.O Box 15653-00503, Nairobi Kenya',
  phone: '+254 20 7252000',
  email: 'info@mmu.ac.ke',
  website: 'https://www.mmu.ac.ke'
};

// Public Notifications Interface
export interface PublicNotification {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'academic' | 'administrative' | 'event' | 'maintenance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishedAt: string;
  expiresAt?: string;
  isActive: boolean;
  authorId: string;
  authorName: string;
  clickable: boolean;
  externalLink?: string;
  attachments?: string[];
}

// Sample notifications (these would come from the database in a real app)
export const sampleNotifications: PublicNotification[] = [
  {
    id: '1',
    title: 'Spring 2024 Semester Registration Now Open',
    content: 'Registration for the Spring 2024 semester is now open for all programmes. Students can access the online registration portal through the student portal. Early registration is encouraged to secure preferred class schedules. Registration deadline is January 15th, 2024.',
    excerpt: 'Registration for Spring 2024 semester is now open for all programmes',
    category: 'academic',
    priority: 'high',
    publishedAt: '2024-01-08T10:00:00Z',
    expiresAt: '2024-01-15T23:59:59Z',
    isActive: true,
    authorId: 'admin-001',
    authorName: 'Academic Registrar',
    clickable: true,
    externalLink: 'https://studentportal.mmu.ac.ke/registration'
  },
  {
    id: '2',
    title: 'New AI Learning Assistant Features Available',
    content: 'We are excited to announce new features in our AI Learning Assistant including personalized study plans, real-time doubt resolution, and interactive practice sessions. All students can access these features through their dashboard.',
    excerpt: 'New AI Learning Assistant features now available to all students',
    category: 'general',
    priority: 'medium',
    publishedAt: '2024-01-05T14:30:00Z',
    isActive: true,
    authorId: 'admin-002',
    authorName: 'IT Services',
    clickable: true
  },
  {
    id: '3',
    title: 'Campus Maintenance Scheduled',
    content: 'Scheduled maintenance will be performed on campus infrastructure this weekend. Online services will remain unaffected. Physical campus access may be limited in certain areas. Students are advised to plan accordingly.',
    excerpt: 'Campus maintenance scheduled for next weekend - online services unaffected',
    category: 'maintenance',
    priority: 'low',
    publishedAt: '2024-01-03T09:00:00Z',
    expiresAt: '2024-01-14T23:59:59Z',
    isActive: true,
    authorId: 'admin-003',
    authorName: 'Facilities Management',
    clickable: true
  }
];
