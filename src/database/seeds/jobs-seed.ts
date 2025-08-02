import { DataSource } from 'typeorm';
import { JobPost } from '../../jobs/entities/job-post.entity';
import { JobType } from '../../common/enums/job-type.enum';
import { JobStatus } from '../../common/enums/job-status.enum';

export const jobsData = [
  // FPT Software (company_id: 1)
  {
    company_id: 1,
    job_title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
    requirements: '• 3+ years of experience in web development\n• Proficiency in React.js, Node.js, and TypeScript\n• Experience with databases (PostgreSQL, MongoDB)\n• Knowledge of AWS/Azure cloud services\n• Strong problem-solving skills',
    benefits: '• Competitive salary up to 2000 USD\n• 13th month salary\n• Health insurance\n• Annual leave 15 days\n• Training and development opportunities',
    location: 'Hà Nội',
    category: 'Software Development',
    salary_min: 25000000,
    salary_max: 50000000,
    salary: '25-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-01')
  },
  {
    company_id: 1,
    job_title: 'DevOps Engineer',
    description: 'Join our DevOps team to build and maintain scalable infrastructure. You will work with cutting-edge technologies to ensure reliable and efficient deployment processes.',
    requirements: '• 2+ years of DevOps experience\n• Proficiency in Docker, Kubernetes\n• Experience with CI/CD pipelines\n• Knowledge of AWS/GCP\n• Scripting skills (Bash, Python)',
    benefits: '• Competitive salary\n• Flexible working hours\n• Remote work options\n• Professional development budget\n• Modern equipment',
    location: 'Hà Nội',
    category: 'DevOps',
    salary_min: 20000000,
    salary_max: 40000000,
    salary: '20-40 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-02-28')
  },
  {
    company_id: 1,
    job_title: 'UI/UX Designer',
    description: 'Create intuitive and visually appealing user interfaces for our software products. Work closely with development teams to implement design solutions.',
    requirements: '• 2+ years of UI/UX design experience\n• Proficiency in Figma, Adobe Creative Suite\n• Understanding of web and mobile design principles\n• Portfolio showcasing design projects\n• Strong communication skills',
    benefits: '• Creative work environment\n• Design tools and software provided\n• Team building activities\n• Career growth opportunities\n• Flexible schedule',
    location: 'Hà Nội',
    category: 'Design',
    salary_min: 18000000,
    salary_max: 35000000,
    salary: '18-35 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-15')
  },
  {
    company_id: 1,
    job_title: 'Business Analyst',
    description: 'Analyze business requirements and translate them into technical specifications. Bridge the gap between business stakeholders and development teams.',
    requirements: '• Bachelor\'s degree in Business, IT, or related field\n• 2+ years of business analysis experience\n• Strong analytical and problem-solving skills\n• Experience with requirement gathering\n• Excellent communication skills',
    benefits: '• Professional development opportunities\n• Competitive compensation package\n• Health and dental insurance\n• Paid vacation and sick leave\n• Performance bonuses',
    location: 'Hà Nội',
    category: 'Business Analysis',
    salary_min: 15000000,
    salary_max: 30000000,
    salary: '15-30 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-10')
  },
  {
    company_id: 1,
    job_title: 'Frontend Developer Intern',
    description: 'Join our frontend development team as an intern. Learn modern web development technologies and gain hands-on experience in real projects.',
    requirements: '• Currently pursuing degree in Computer Science or related field\n• Basic knowledge of HTML, CSS, JavaScript\n• Familiarity with React.js is a plus\n• Eager to learn and grow\n• Good English communication',
    benefits: '• Mentorship from senior developers\n• Real project experience\n• Potential for full-time offer\n• Monthly allowance\n• Learning resources provided',
    location: 'Hà Nội',
    category: 'Internship',
    salary: '5-8 triệu VND',
    job_type: JobType.INTERNSHIP,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-02-20')
  },

  // Viettel Group (company_id: 2)
  {
    company_id: 2,
    job_title: 'Network Engineer',
    description: 'Design, implement, and maintain telecommunications network infrastructure. Work on cutting-edge 5G technology and network optimization.',
    requirements: '• Bachelor\'s degree in Telecommunications or related field\n• 3+ years of network engineering experience\n• Knowledge of TCP/IP, routing protocols\n• Experience with Cisco, Juniper equipment\n• CCNA/CCNP certification preferred',
    benefits: '• Excellent salary package\n• Comprehensive health insurance\n• Training abroad opportunities\n• 13th month salary\n• Transportation allowance',
    location: 'Hà Nội',
    category: 'Network Engineering',
    salary_min: 25000000,
    salary_max: 45000000,
    salary: '25-45 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-05')
  },
  {
    company_id: 2,
    job_title: '5G Technology Specialist',
    description: 'Lead 5G network deployment and optimization initiatives. Work with the latest telecommunications technology and drive innovation.',
    requirements: '• Master\'s degree in Telecommunications or Electrical Engineering\n• 5+ years of mobile network experience\n• Deep knowledge of 5G/LTE technologies\n• Experience with network planning tools\n• Strong project management skills',
    benefits: '• Top-tier compensation\n• International project opportunities\n• Research and development budget\n• Premium healthcare coverage\n• Stock options',
    location: 'Hà Nội',
    category: '5G Technology',
    salary_min: 40000000,
    salary_max: 80000000,
    salary: '40-80 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-01')
  },
  {
    company_id: 2,
    job_title: 'Software Developer',
    description: 'Develop software solutions for telecommunications systems. Work on mission-critical applications serving millions of users.',
    requirements: '• Bachelor\'s degree in Computer Science\n• 3+ years of software development experience\n• Proficiency in Java, C++, or Python\n• Experience with databases and APIs\n• Understanding of telecom protocols',
    benefits: '• Competitive salary\n• Performance bonuses\n• Professional development programs\n• Health insurance for family\n• Annual company trips',
    location: 'Hà Nội',
    category: 'Software Development',
    salary_min: 22000000,
    salary_max: 42000000,
    salary: '22-42 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-12')
  },
  {
    company_id: 2,
    job_title: 'Data Analyst',
    description: 'Analyze telecommunications data to drive business insights and optimize network performance. Work with big data technologies.',
    requirements: '• Bachelor\'s degree in Statistics, Mathematics, or related field\n• 2+ years of data analysis experience\n• Proficiency in SQL, Python, R\n• Experience with data visualization tools\n• Strong analytical thinking',
    benefits: '• Data-driven work environment\n• Modern analytics tools\n• Training in latest technologies\n• Flexible working arrangements\n• Performance-based bonuses',
    location: 'Hà Nội',
    category: 'Data Analysis',
    salary_min: 18000000,
    salary_max: 35000000,
    salary: '18-35 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-02-25')
  },

  // VinGroup (company_id: 3)
  {
    company_id: 3,
    job_title: 'Product Manager',
    description: 'Lead product development initiatives across VinGroup\'s diverse business portfolio. Drive product strategy and execution.',
    requirements: '• MBA or equivalent business degree\n• 5+ years of product management experience\n• Strong analytical and strategic thinking\n• Experience in consumer products\n• Excellent leadership and communication skills',
    benefits: '• Executive compensation package\n• Stock options and equity participation\n• Premium health and wellness benefits\n• International travel opportunities\n• Executive development programs',
    location: 'Hà Nội',
    category: 'Product Management',
    salary_min: 50000000,
    salary_max: 100000000,
    salary: '50-100 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-20')
  },
  {
    company_id: 3,
    job_title: 'Automotive Engineer',
    description: 'Join VinFast team to develop next-generation electric vehicles. Work on cutting-edge automotive technology and sustainable transportation.',
    requirements: '• Bachelor\'s degree in Automotive/Mechanical Engineering\n• 3+ years of automotive industry experience\n• Knowledge of electric vehicle technology\n• Experience with CAD software\n• Problem-solving and innovation mindset',
    benefits: '• Opportunity to shape the future of mobility\n• Competitive salary and benefits\n• Research and development resources\n• International collaboration\n• Career advancement opportunities',
    location: 'Hà Nội',
    category: 'Automotive Engineering',
    salary_min: 30000000,
    salary_max: 60000000,
    salary: '30-60 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-18')
  },
  {
    company_id: 3,
    job_title: 'Digital Marketing Manager',
    description: 'Lead digital marketing initiatives across VinGroup brands. Develop and execute comprehensive digital marketing strategies.',
    requirements: '• Bachelor\'s degree in Marketing or related field\n• 4+ years of digital marketing experience\n• Proficiency in Google Ads, Facebook Ads\n• Experience with marketing automation\n• Data-driven decision making',
    benefits: '• Creative marketing environment\n• Marketing tools and platforms access\n• Performance-based incentives\n• Brand building opportunities\n• Professional marketing conferences',
    location: 'Hà Nội',
    category: 'Digital Marketing',
    salary_min: 25000000,
    salary_max: 50000000,
    salary: '25-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-08')
  },

  // Tiki Corporation (company_id: 4)
  {
    company_id: 4,
    job_title: 'Senior Backend Developer',
    description: 'Build scalable backend systems for Tiki\'s e-commerce platform. Handle millions of transactions and ensure system reliability.',
    requirements: '• 4+ years of backend development experience\n• Proficiency in Java, Spring Boot, or Node.js\n• Experience with microservices architecture\n• Knowledge of databases and caching\n• Understanding of e-commerce systems',
    benefits: '• Competitive salary package\n• Stock options\n• Flexible working hours\n• Modern office environment\n• Continuous learning opportunities',
    location: 'Hồ Chí Minh',
    category: 'Backend Development',
    salary_min: 30000000,
    salary_max: 55000000,
    salary: '30-55 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-14')
  },
  {
    company_id: 4,
    job_title: 'Data Scientist',
    description: 'Apply machine learning and data science to improve customer experience and business operations. Work with big data and AI technologies.',
    requirements: '• Master\'s degree in Data Science, Statistics, or related field\n• 3+ years of data science experience\n• Proficiency in Python, R, SQL\n• Experience with ML frameworks\n• Strong mathematical and statistical background',
    benefits: '• Data science research opportunities\n• Access to large-scale datasets\n• Machine learning infrastructure\n• Conference and training budget\n• Collaborative research environment',
    location: 'Hồ Chí Minh',
    category: 'Data Science',
    salary_min: 35000000,
    salary_max: 65000000,
    salary: '35-65 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-22')
  },
  {
    company_id: 4,
    job_title: 'Mobile App Developer',
    description: 'Develop and maintain Tiki mobile applications for iOS and Android. Create seamless shopping experiences for mobile users.',
    requirements: '• 3+ years of mobile development experience\n• Proficiency in Swift/Kotlin or React Native\n• Experience with mobile app optimization\n• Knowledge of mobile UX/UI principles\n• App store deployment experience',
    benefits: '• Mobile development focused role\n• Latest mobile devices provided\n• App performance bonuses\n• Technical conferences attendance\n• Career growth in mobile technology',
    location: 'Hồ Chí Minh',
    category: 'Mobile Development',
    salary_min: 25000000,
    salary_max: 48000000,
    salary: '25-48 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-16')
  },
  {
    company_id: 4,
    job_title: 'Supply Chain Analyst',
    description: 'Optimize supply chain operations and logistics for efficient product delivery. Analyze data to improve inventory management.',
    requirements: '• Bachelor\'s degree in Supply Chain, Logistics, or related field\n• 2+ years of supply chain experience\n• Proficiency in Excel, SQL\n• Understanding of logistics operations\n• Analytical and problem-solving skills',
    benefits: '• Supply chain optimization projects\n• Data analysis tools access\n• Logistics industry exposure\n• Performance improvement bonuses\n• Professional development in logistics',
    location: 'Hồ Chí Minh',
    category: 'Supply Chain',
    salary_min: 16000000,
    salary_max: 32000000,
    salary: '16-32 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-06')
  },

  // VNG Corporation (company_id: 5)
  {
    company_id: 5,
    job_title: 'Game Developer',
    description: 'Develop engaging mobile games using Unity and other game development frameworks. Create interactive gaming experiences for millions of users.',
    requirements: '• 3+ years of game development experience\n• Proficiency in Unity, C#\n• Experience with mobile game optimization\n• Understanding of game mechanics and design\n• Portfolio of published games',
    benefits: '• Creative game development environment\n• Access to latest gaming technologies\n• Game launch bonuses\n• Gaming industry conferences\n• Creative collaboration opportunities',
    location: 'Hồ Chí Minh',
    category: 'Game Development',
    salary_min: 28000000,
    salary_max: 52000000,
    salary: '28-52 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-28')
  },
  {
    company_id: 5,
    job_title: 'Android Developer',
    description: 'Develop and maintain Android applications including Zalo and other VNG products. Work on applications used by millions of Vietnamese users.',
    requirements: '• 3+ years of Android development experience\n• Proficiency in Kotlin, Java\n• Experience with Android SDK and APIs\n• Knowledge of mobile app architecture\n• Understanding of Android UI/UX guidelines',
    benefits: '• Work on popular Vietnamese apps\n• Android development expertise\n• User impact at scale\n• Technical growth opportunities\n• Modern Android development stack',
    location: 'Hồ Chí Minh',
    category: 'Android Development',
    salary_min: 26000000,
    salary_max: 50000000,
    salary: '26-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-11')
  },
  {
    company_id: 5,
    job_title: 'QA Engineer',
    description: 'Ensure quality of VNG products through comprehensive testing strategies. Implement automated testing and quality assurance processes.',
    requirements: '• 2+ years of QA engineering experience\n• Experience with manual and automated testing\n• Knowledge of testing frameworks\n• Understanding of mobile app testing\n• Attention to detail and quality focus',
    benefits: '• Quality-focused work environment\n• Testing tools and infrastructure\n• Quality improvement initiatives\n• Professional QA development\n• Impact on product quality',
    location: 'Hồ Chí Minh',
    category: 'Quality Assurance',
    salary_min: 18000000,
    salary_max: 38000000,
    salary: '18-38 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-04')
  },

  // Grab Vietnam (company_id: 6)
  {
    company_id: 6,
    job_title: 'Senior Software Engineer',
    description: 'Build and scale Grab\'s ride-hailing and delivery platform. Work on systems that serve millions of users across Southeast Asia.',
    requirements: '• 4+ years of software engineering experience\n• Proficiency in Go, Java, or Python\n• Experience with distributed systems\n• Knowledge of cloud platforms\n• Strong system design skills',
    benefits: '• International technology exposure\n• Stock options and equity\n• Flexible working arrangements\n• Learning and development budget\n• Multicultural work environment',
    location: 'Hồ Chí Minh',
    category: 'Software Engineering',
    salary_min: 35000000,
    salary_max: 70000000,
    salary: '35-70 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-25')
  },
  {
    company_id: 6,
    job_title: 'Data Engineer',
    description: 'Build data infrastructure and pipelines to support Grab\'s data-driven decisions. Work with big data technologies and real-time analytics.',
    requirements: '• 3+ years of data engineering experience\n• Proficiency in Spark, Kafka, Airflow\n• Experience with AWS/GCP data services\n• Knowledge of data warehouse concepts\n• Strong SQL and programming skills',
    benefits: '• Big data technology exposure\n• Data engineering best practices\n• Cloud infrastructure access\n• Data science collaboration\n• Technical excellence culture',
    location: 'Hồ Chí Minh',
    category: 'Data Engineering',
    salary_min: 32000000,
    salary_max: 62000000,
    salary: '32-62 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-19')
  },
  {
    company_id: 6,
    job_title: 'Product Designer',
    description: 'Design user-centered experiences for Grab\'s mobile apps. Create intuitive interfaces that enhance user journey and satisfaction.',
    requirements: '• 3+ years of product design experience\n• Proficiency in Figma, Sketch\n• Strong understanding of mobile UX\n• Experience with design systems\n• User research and testing experience',
    benefits: '• Design impact at scale\n• User-centered design culture\n• Design thinking workshops\n• Cross-functional collaboration\n• Design career advancement',
    location: 'Hồ Chí Minh',
    category: 'Product Design',
    salary_min: 25000000,
    salary_max: 50000000,
    salary: '25-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-13')
  },

  // Momo (company_id: 7)
  {
    company_id: 7,
    job_title: 'Senior Backend Engineer',
    description: 'Build secure and scalable payment systems for MoMo e-wallet. Handle financial transactions and ensure system reliability.',
    requirements: '• 4+ years of backend development experience\n• Strong knowledge of Java, Spring Boot\n• Experience with payment systems\n• Understanding of security best practices\n• Knowledge of database optimization',
    benefits: '• Fintech industry experience\n• Financial services expertise\n• Security-focused development\n• Performance bonuses\n• Career growth in payments',
    location: 'Hồ Chí Minh',
    category: 'Backend Engineering',
    salary_min: 32000000,
    salary_max: 60000000,
    salary: '32-60 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-21')
  },
  {
    company_id: 7,
    job_title: 'Risk Management Analyst',
    description: 'Analyze and mitigate financial risks in digital payment systems. Develop fraud detection and prevention strategies.',
    requirements: '• Bachelor\'s degree in Finance, Economics, or related field\n• 2+ years of risk management experience\n• Knowledge of fraud detection methods\n• Strong analytical and statistical skills\n• Understanding of financial regulations',
    benefits: '• Risk management specialization\n• Financial industry expertise\n• Fraud prevention experience\n• Regulatory compliance knowledge\n• Professional risk certifications',
    location: 'Hồ Chí Minh',
    category: 'Risk Management',
    salary_min: 20000000,
    salary_max: 40000000,
    salary: '20-40 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-07')
  },
  {
    company_id: 7,
    job_title: 'Mobile Developer',
    description: 'Develop and maintain MoMo mobile application. Create seamless payment experiences for millions of Vietnamese users.',
    requirements: '• 3+ years of mobile development experience\n• Proficiency in React Native or native development\n• Experience with payment app development\n• Knowledge of mobile security practices\n• Understanding of UX for financial apps',
    benefits: '• Fintech mobile development\n• Payment technology expertise\n• User experience focus\n• Mobile security knowledge\n• Financial app specialization',
    location: 'Hồ Chí Minh',
    category: 'Mobile Development',
    salary_min: 28000000,
    salary_max: 55000000,
    salary: '28-55 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-17')
  },

  // Shopee Vietnam (company_id: 8)
  {
    company_id: 8,
    job_title: 'Frontend Developer',
    description: 'Develop user-facing features for Shopee\'s e-commerce platform. Create responsive and interactive shopping experiences.',
    requirements: '• 3+ years of frontend development experience\n• Proficiency in React.js, TypeScript\n• Experience with e-commerce platforms\n• Knowledge of responsive design\n• Understanding of web performance optimization',
    benefits: '• E-commerce technology exposure\n• International platform development\n• Frontend technology advancement\n• User experience focus\n• Performance optimization expertise',
    location: 'Hồ Chí Minh',
    category: 'Frontend Development',
    salary_min: 26000000,
    salary_max: 50000000,
    salary: '26-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-09')
  },
  {
    company_id: 8,
    job_title: 'Marketing Data Analyst',
    description: 'Analyze marketing performance and customer behavior data. Provide insights to optimize marketing campaigns and user acquisition.',
    requirements: '• Bachelor\'s degree in Marketing, Statistics, or related field\n• 2+ years of marketing analytics experience\n• Proficiency in SQL, Python, or R\n• Experience with marketing attribution\n• Knowledge of e-commerce metrics',
    benefits: '• Marketing analytics specialization\n• E-commerce data insights\n• Customer behavior analysis\n• Marketing optimization projects\n• Data-driven marketing culture',
    location: 'Hồ Chí Minh',
    category: 'Marketing Analytics',
    salary_min: 18000000,
    salary_max: 38000000,
    salary: '18-38 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-02')
  },
  {
    company_id: 8,
    job_title: 'Seller Operations Specialist',
    description: 'Support and manage seller relationships on Shopee platform. Help sellers optimize their business and improve performance.',
    requirements: '• Bachelor\'s degree in Business or related field\n• 2+ years of account management experience\n• Strong communication and negotiation skills\n• Understanding of e-commerce operations\n• Data analysis and reporting skills',
    benefits: '• E-commerce operations experience\n• Seller relationship management\n• Business development skills\n• Platform operations knowledge\n• Commercial growth opportunities',
    location: 'Hồ Chí Minh',
    category: 'Operations',
    salary_min: 15000000,
    salary_max: 30000000,
    salary: '15-30 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-02-26')
  },

  // Techcombank (company_id: 9)
  {
    company_id: 9,
    job_title: 'Senior Java Developer',
    description: 'Develop banking applications and digital banking solutions. Work on secure and scalable financial systems.',
    requirements: '• 4+ years of Java development experience\n• Strong knowledge of Spring Framework\n• Experience with banking or financial systems\n• Understanding of security best practices\n• Knowledge of microservices architecture',
    benefits: '• Banking industry experience\n• Financial systems expertise\n• Security-focused development\n• Digital banking innovation\n• Financial services career path',
    location: 'Hà Nội',
    category: 'Software Development',
    salary_min: 30000000,
    salary_max: 58000000,
    salary: '30-58 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-23')
  },
  {
    company_id: 9,
    job_title: 'Business Systems Analyst',
    description: 'Analyze banking business processes and translate requirements into technical solutions. Bridge business and technology teams.',
    requirements: '• Bachelor\'s degree in Business, IT, or related field\n• 3+ years of business analysis experience\n• Knowledge of banking operations\n• Strong analytical and documentation skills\n• Experience with requirement gathering',
    benefits: '• Banking business expertise\n• Process improvement projects\n• Business-technology alignment\n• Financial services knowledge\n• Professional development in banking',
    location: 'Hà Nội',
    category: 'Business Analysis',
    salary_min: 22000000,
    salary_max: 42000000,
    salary: '22-42 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-15')
  },

  // VPBank (company_id: 10)
  {
    company_id: 10,
    job_title: 'Digital Banking Product Manager',
    description: 'Lead digital banking product development and strategy. Drive innovation in digital financial services and customer experience.',
    requirements: '• Bachelor\'s degree in Business or related field\n• 4+ years of product management experience\n• Experience in digital banking or fintech\n• Strong analytical and strategic thinking\n• Customer-centric mindset',
    benefits: '• Digital banking innovation\n• Product strategy leadership\n• Fintech product development\n• Customer experience focus\n• Banking transformation projects',
    location: 'Hà Nội',
    category: 'Product Management',
    salary_min: 40000000,
    salary_max: 80000000,
    salary: '40-80 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-05')
  },
  {
    company_id: 10,
    job_title: 'Credit Risk Analyst',
    description: 'Assess and manage credit risk for banking products. Develop risk models and ensure regulatory compliance.',
    requirements: '• Bachelor\'s degree in Finance, Economics, or related field\n• 2+ years of credit risk experience\n• Strong statistical and analytical skills\n• Knowledge of banking regulations\n• Experience with risk modeling',
    benefits: '• Credit risk specialization\n• Banking risk management\n• Regulatory compliance experience\n• Financial modeling expertise\n• Risk management career development',
    location: 'Hà Nội',
    category: 'Credit Risk',
    salary_min: 18000000,
    salary_max: 38000000,
    salary: '18-38 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-12')
  },

  // Got It AI (company_id: 11)
  {
    company_id: 11,
    job_title: 'AI/ML Engineer',
    description: 'Develop artificial intelligence and machine learning solutions for customer service automation. Work with NLP and conversational AI.',
    requirements: '• Master\'s degree in AI, ML, or related field\n• 3+ years of AI/ML development experience\n• Proficiency in Python, TensorFlow, PyTorch\n• Experience with NLP and conversational AI\n• Strong mathematical and statistical background',
    benefits: '• Cutting-edge AI research\n• Machine learning innovation\n• AI product development\n• Research publication opportunities\n• AI technology advancement',
    location: 'Hà Nội',
    category: 'Artificial Intelligence',
    salary_min: 35000000,
    salary_max: 70000000,
    salary: '35-70 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-10')
  },
  {
    company_id: 11,
    job_title: 'NLP Research Scientist',
    description: 'Research and develop natural language processing algorithms for conversational AI systems. Advance the state-of-the-art in NLP.',
    requirements: '• PhD in NLP, AI, or related field\n• 3+ years of NLP research experience\n• Deep knowledge of transformer models\n• Experience with research publications\n• Strong programming and mathematical skills',
    benefits: '• AI research leadership\n• NLP innovation projects\n• Research collaboration opportunities\n• Conference presentation support\n• Academic partnership programs',
    location: 'Hà Nội',
    category: 'NLP Research',
    salary_min: 45000000,
    salary_max: 90000000,
    salary: '45-90 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-15')
  },

  // KMS Technology (company_id: 12)
  {
    company_id: 12,
    job_title: 'Solution Architect',
    description: 'Design and architect software solutions for enterprise clients. Lead technical decision-making and solution design processes.',
    requirements: '• Bachelor\'s degree in Computer Science or related field\n• 6+ years of software architecture experience\n• Strong knowledge of enterprise patterns\n• Experience with cloud platforms\n• Excellent communication and leadership skills',
    benefits: '• Solution architecture expertise\n• Enterprise client exposure\n• Technical leadership opportunities\n• Cloud architecture experience\n• Professional architecture certifications',
    location: 'Hồ Chí Minh',
    category: 'Solution Architecture',
    salary_min: 45000000,
    salary_max: 85000000,
    salary: '45-85 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-08')
  },
  {
    company_id: 12,
    job_title: 'DevOps Consultant',
    description: 'Provide DevOps consulting services to enterprise clients. Implement CI/CD pipelines and infrastructure automation.',
    requirements: '• 4+ years of DevOps experience\n• Expertise in Docker, Kubernetes, Jenkins\n• Experience with AWS/Azure/GCP\n• Strong scripting and automation skills\n• Client-facing and consulting experience',
    benefits: '• DevOps consulting expertise\n• Enterprise client projects\n• Cloud infrastructure experience\n• Automation and tooling focus\n• Professional DevOps certifications',
    location: 'Hồ Chí Minh',
    category: 'DevOps Consulting',
    salary_min: 35000000,
    salary_max: 65000000,
    salary: '35-65 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-30')
  },

  // Base.vn (company_id: 13)
  {
    company_id: 13,
    job_title: 'Digital Marketing Specialist',
    description: 'Execute digital marketing campaigns for e-commerce clients. Manage social media, content marketing, and paid advertising.',
    requirements: '• Bachelor\'s degree in Marketing or related field\n• 2+ years of digital marketing experience\n• Proficiency in Google Ads, Facebook Ads\n• Experience with e-commerce marketing\n• Strong analytical and creative skills',
    benefits: '• Digital marketing expertise\n• E-commerce client exposure\n• Marketing technology tools\n• Creative campaign development\n• Performance marketing focus',
    location: 'Hà Nội',
    category: 'Digital Marketing',
    salary_min: 15000000,
    salary_max: 30000000,
    salary: '15-30 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-05')
  },
  {
    company_id: 13,
    job_title: 'Content Creator',
    description: 'Create engaging content for digital marketing campaigns. Develop visual and written content for various marketing channels.',
    requirements: '• Bachelor\'s degree in Communications, Marketing, or related field\n• 2+ years of content creation experience\n• Proficiency in Adobe Creative Suite\n• Strong writing and visual design skills\n• Understanding of social media trends',
    benefits: '• Creative content development\n• Multi-channel content creation\n• Social media expertise\n• Visual design opportunities\n• Content strategy involvement',
    location: 'Hà Nội',
    category: 'Content Creation',
    salary_min: 12000000,
    salary_max: 25000000,
    salary: '12-25 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-02-28')
  },

  // VinTech (company_id: 14)
  {
    company_id: 14,
    job_title: 'IoT Developer',
    description: 'Develop Internet of Things solutions for smart city applications. Work on connected devices and IoT platforms.',
    requirements: '• Bachelor\'s degree in Computer Science, Electronics, or related field\n• 3+ years of IoT development experience\n• Knowledge of embedded systems\n• Experience with IoT protocols (MQTT, CoAP)\n• Programming skills in C/C++, Python',
    benefits: '• IoT technology innovation\n• Smart city project involvement\n• Embedded systems expertise\n• Connected device development\n• IoT platform architecture',
    location: 'Hà Nội',
    category: 'IoT Development',
    salary_min: 25000000,
    salary_max: 50000000,
    salary: '25-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-27')
  },
  {
    company_id: 14,
    job_title: 'Smart City Solutions Engineer',
    description: 'Design and implement smart city technology solutions. Work on urban planning and technology integration projects.',
    requirements: '• Bachelor\'s degree in Engineering or related field\n• 3+ years of systems engineering experience\n• Knowledge of urban planning principles\n• Experience with system integration\n• Strong project management skills',
    benefits: '• Smart city innovation\n• Urban technology solutions\n• System integration expertise\n• Public sector project exposure\n• Technology impact on society',
    location: 'Hà Nội',
    category: 'Smart City',
    salary_min: 28000000,
    salary_max: 55000000,
    salary: '28-55 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-02')
  },

  // FPT Telecom (company_id: 15)
  {
    company_id: 15,
    job_title: 'Network Operations Engineer',
    description: 'Monitor and maintain telecommunications network infrastructure. Ensure optimal network performance and availability.',
    requirements: '• Bachelor\'s degree in Telecommunications or related field\n• 2+ years of network operations experience\n• Knowledge of network monitoring tools\n• Understanding of TCP/IP and routing\n• Problem-solving and troubleshooting skills',
    benefits: '• Network operations expertise\n• Telecommunications infrastructure\n• 24/7 operations experience\n• Network troubleshooting skills\n• Telecom industry career growth',
    location: 'Hà Nội',
    category: 'Network Operations',
    salary_min: 18000000,
    salary_max: 35000000,
    salary: '18-35 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-08')
  },
  {
    company_id: 15,
    job_title: 'Customer Service Representative',
    description: 'Provide excellent customer service for FPT internet and TV services. Handle customer inquiries and technical support.',
    requirements: '• High school diploma or equivalent\n• 1+ years of customer service experience\n• Strong communication skills\n• Basic technical knowledge\n• Patient and helpful attitude',
    benefits: '• Customer service skills development\n• Telecommunications product knowledge\n• Team collaboration environment\n• Performance-based bonuses\n• Career advancement opportunities',
    location: 'Hà Nội',
    category: 'Customer Service',
    salary_min: 8000000,
    salary_max: 15000000,
    salary: '8-15 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-02-22')
  },

  // Sendo (company_id: 16)
  {
    company_id: 16,
    job_title: 'E-commerce Operations Manager',
    description: 'Manage e-commerce operations and seller support programs. Optimize platform performance and seller satisfaction.',
    requirements: '• Bachelor\'s degree in Business or related field\n• 3+ years of e-commerce operations experience\n• Strong analytical and problem-solving skills\n• Experience with marketplace management\n• Understanding of Vietnamese market',
    benefits: '• E-commerce operations leadership\n• Local market expertise\n• Seller relationship management\n• Platform optimization projects\n• Vietnamese e-commerce growth',
    location: 'Hồ Chí Minh',
    category: 'E-commerce Operations',
    salary_min: 22000000,
    salary_max: 42000000,
    salary: '22-42 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-18')
  },
  {
    company_id: 16,
    job_title: 'Marketing Executive',
    description: 'Execute marketing campaigns to promote Sendo platform and attract new users. Focus on local market marketing strategies.',
    requirements: '• Bachelor\'s degree in Marketing or related field\n• 2+ years of marketing experience\n• Knowledge of Vietnamese consumer behavior\n• Experience with digital marketing channels\n• Creative and analytical mindset',
    benefits: '• Local market marketing expertise\n• Vietnamese e-commerce focus\n• Marketing campaign execution\n• Consumer behavior insights\n• Brand development opportunities',
    location: 'Hồ Chí Minh',
    category: 'Marketing',
    salary_min: 14000000,
    salary_max: 28000000,
    salary: '14-28 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-01')
  },

  // VietinBank (company_id: 17)
  {
    company_id: 17,
    job_title: 'Banking Technology Specialist',
    description: 'Support banking technology systems and digital transformation initiatives. Maintain core banking systems and applications.',
    requirements: '• Bachelor\'s degree in IT or related field\n• 2+ years of banking technology experience\n• Knowledge of core banking systems\n• Understanding of banking operations\n• Strong technical troubleshooting skills',
    benefits: '• Banking technology expertise\n• Core banking systems experience\n• Digital transformation projects\n• Financial services IT career\n• Stable banking industry employment',
    location: 'Hà Nội',
    category: 'Banking Technology',
    salary_min: 20000000,
    salary_max: 38000000,
    salary: '20-38 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-14')
  },
  {
    company_id: 17,
    job_title: 'Relationship Manager',
    description: 'Build and maintain relationships with corporate banking clients. Provide banking solutions and financial advisory services.',
    requirements: '• Bachelor\'s degree in Finance, Business, or related field\n• 3+ years of relationship management experience\n• Strong sales and negotiation skills\n• Knowledge of banking products\n• Excellent communication and interpersonal skills',
    benefits: '• Corporate banking expertise\n• Client relationship management\n• Financial advisory experience\n• Sales and business development\n• Banking career advancement',
    location: 'Hà Nội',
    category: 'Relationship Management',
    salary_min: 25000000,
    salary_max: 50000000,
    salary: '25-50 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-20')
  },

  // Zalo (company_id: 18)
  {
    company_id: 18,
    job_title: 'Social Media Product Manager',
    description: 'Lead product development for Zalo social features. Drive user engagement and social interaction innovations.',
    requirements: '• Bachelor\'s degree in Business, Technology, or related field\n• 4+ years of product management experience\n• Experience with social media products\n• Strong understanding of user behavior\n• Data-driven decision making skills',
    benefits: '• Social media product innovation\n• User engagement optimization\n• Vietnamese social platform impact\n• Product strategy leadership\n• Social technology advancement',
    location: 'Hồ Chí Minh',
    category: 'Social Media Product',
    salary_min: 35000000,
    salary_max: 70000000,
    salary: '35-70 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-12')
  },
  {
    company_id: 18,
    job_title: 'iOS Developer',
    description: 'Develop and maintain Zalo iOS application. Create seamless messaging and social experiences for iOS users.',
    requirements: '• 3+ years of iOS development experience\n• Proficiency in Swift and Objective-C\n• Experience with iOS SDK and frameworks\n• Knowledge of mobile app optimization\n• Understanding of social app features',
    benefits: '• iOS development expertise\n• Social app development\n• Large-scale user impact\n• Mobile technology advancement\n• iOS development best practices',
    location: 'Hồ Chí Minh',
    category: 'iOS Development',
    salary_min: 26000000,
    salary_max: 52000000,
    salary: '26-52 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-26')
  },

  // Sacombank (company_id: 19)
  {
    company_id: 19,
    job_title: 'Digital Transformation Consultant',
    description: 'Lead digital transformation initiatives in banking. Implement new technologies and optimize banking processes.',
    requirements: '• Bachelor\'s degree in Business, IT, or related field\n• 4+ years of digital transformation experience\n• Knowledge of banking operations\n• Experience with process optimization\n• Strong project management skills',
    benefits: '• Digital transformation leadership\n• Banking process optimization\n• Technology implementation projects\n• Change management experience\n• Banking innovation initiatives',
    location: 'Hồ Chí Minh',
    category: 'Digital Transformation',
    salary_min: 30000000,
    salary_max: 60000000,
    salary: '30-60 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-07')
  },
  {
    company_id: 19,
    job_title: 'Treasury Analyst',
    description: 'Analyze treasury operations and manage bank liquidity. Support treasury decision-making and risk management.',
    requirements: '• Bachelor\'s degree in Finance, Economics, or related field\n• 2+ years of treasury or finance experience\n• Strong analytical and quantitative skills\n• Knowledge of financial markets\n• Understanding of banking regulations',
    benefits: '• Treasury expertise development\n• Financial markets knowledge\n• Banking risk management\n• Quantitative analysis skills\n• Financial services career growth',
    location: 'Hồ Chí Minh',
    category: 'Treasury',
    salary_min: 18000000,
    salary_max: 36000000,
    salary: '18-36 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-11')
  },

  // CMC Corporation (company_id: 20)
  {
    company_id: 20,
    job_title: 'Cloud Solutions Architect',
    description: 'Design and implement cloud infrastructure solutions for enterprise clients. Lead cloud migration and optimization projects.',
    requirements: '• Bachelor\'s degree in Computer Science or related field\n• 5+ years of cloud architecture experience\n• Expertise in AWS, Azure, or GCP\n• Experience with enterprise cloud solutions\n• Strong technical leadership skills',
    benefits: '• Cloud architecture expertise\n• Enterprise client projects\n• Cloud migration experience\n• Technical leadership opportunities\n• Cloud certification support',
    location: 'Hà Nội',
    category: 'Cloud Architecture',
    salary_min: 40000000,
    salary_max: 80000000,
    salary: '40-80 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-18')
  },
  {
    company_id: 20,
    job_title: 'Cybersecurity Consultant',
    description: 'Provide cybersecurity consulting services to enterprise clients. Assess security risks and implement protection measures.',
    requirements: '• Bachelor\'s degree in Cybersecurity or related field\n• 3+ years of cybersecurity experience\n• Knowledge of security frameworks\n• Experience with security assessment tools\n• Strong understanding of threat landscape',
    benefits: '• Cybersecurity expertise\n• Enterprise security consulting\n• Security framework implementation\n• Threat assessment experience\n• Security certification opportunities',
    location: 'Hà Nội',
    category: 'Cybersecurity',
    salary_min: 30000000,
    salary_max: 60000000,
    salary: '30-60 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-04-03')
  },
  {
    company_id: 20,
    job_title: 'Software Testing Engineer',
    description: 'Design and execute comprehensive testing strategies for software projects. Ensure quality and reliability of delivered solutions.',
    requirements: '• Bachelor\'s degree in Computer Science or related field\n• 2+ years of software testing experience\n• Knowledge of testing methodologies\n• Experience with automated testing tools\n• Strong attention to detail',
    benefits: '• Software testing expertise\n• Quality assurance leadership\n• Testing automation experience\n• Software quality improvement\n• QA career development',
    location: 'Hà Nội',
    category: 'Software Testing',
    salary_min: 16000000,
    salary_max: 32000000,
    salary: '16-32 triệu VND',
    job_type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    expires_at: new Date('2025-03-16')
  }
];

export async function seedJobs(dataSource: DataSource): Promise<void> {
  const jobRepository = dataSource.getRepository(JobPost);
  
  // Delete all existing jobs using raw query
  await dataSource.query('DELETE FROM job_posts');
  
  // Reset sequence to start from 1
  await dataSource.query('ALTER SEQUENCE job_posts_job_id_seq RESTART WITH 1;');
  
  // Insert new jobs
  for (const jobData of jobsData) {
    const job = jobRepository.create(jobData);
    await jobRepository.save(job);
  }
  
  console.log(`✅ Seeded ${jobsData.length} jobs`);
}