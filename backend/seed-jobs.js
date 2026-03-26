// Script to seed demo jobs in the database
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';

const demoJobs = [
  {
    title: 'Senior React Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    description:
      'We are looking for an experienced React developer to join our dynamic team. You will work on modern web applications using React, Redux, and Node.js. This is an exciting opportunity to work on cutting-edge technologies and collaborate with top talents in the industry.',
    requirements:
      '5+ years of experience with React, Strong knowledge of JavaScript ES6+, Experience with Redux or Context API, Familiarity with REST APIs and Node.js, Experience with Git and modern development tools',
    salary: '$120,000 - $160,000',
    type: 'full-time',
    category: 'Software Development',
    status: 'approved',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'UX/UI Designer',
    company: 'Creative Digital Agency',
    location: 'New York, NY',
    description:
      'Join our creative team as a UX/UI Designer. You will design beautiful and intuitive user interfaces for web and mobile applications. Work closely with product managers and developers to create exceptional user experiences.',
    requirements:
      '3+ years of UX/UI design experience, Proficiency in Figma or Adobe XD, Strong portfolio demonstrating design skills, Knowledge of user research and usability testing, Understanding of web and mobile design principles',
    salary: '$80,000 - $110,000',
    type: 'full-time',
    category: 'Design',
    status: 'approved',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Full Stack Developer',
    company: 'StartUp Innovations Inc.',
    location: 'Austin, TX',
    description:
      'We are seeking a talented Full Stack Developer to help build scalable web applications. You will work with modern tech stack including React, Node.js, and MongoDB. Be part of a fast-growing startup with great culture and learning opportunities.',
    requirements:
      'Experience with React and Node.js, MongoDB and relational databases, RESTful API design, Experience with Docker and deployment, Strong problem-solving skills',
    salary: '$100,000 - $140,000',
    type: 'full-time',
    category: 'Software Development',
    status: 'approved',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Boston, MA',
    description:
      'Help us drive data-driven decisions! We need a Data Scientist to develop machine learning models and analyze complex datasets. You will work with Python, SQL, and cloud technologies to extract insights from big data.',
    requirements:
      'Strong background in Python and SQL, Experience with machine learning libraries (scikit-learn, TensorFlow), Knowledge of statistics and data visualization, Experience with AWS or Google Cloud, Portfolio with data science projects',
    salary: '$110,000 - $150,000',
    type: 'full-time',
    category: 'Data Science',
    status: 'approved',
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'DevOps Engineer',
    company: 'Cloud Infrastructure Co.',
    location: 'Seattle, WA',
    description:
      'We are looking for a skilled DevOps Engineer to manage and optimize our cloud infrastructure. Work with Kubernetes, Docker, and CI/CD pipelines. Help us scale and maintain our systems.',
    requirements:
      'Expertise with Docker and Kubernetes, CI/CD pipeline experience, AWS or Azure cloud experience, Linux server administration, Infrastructure as Code (Terraform, Ansible)',
    salary: '$130,000 - $170,000',
    type: 'full-time',
    category: 'DevOps',
    status: 'approved',
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Marketing Intern',
    company: 'Digital Marketing Hub',
    location: 'Los Angeles, CA',
    description:
      'Join our marketing team as an intern and gain hands-on experience in digital marketing. You will work on social media campaigns, content creation, and marketing analytics. Great opportunity for recent graduates!',
    requirements:
      'Currently pursuing or recently completed degree in Marketing, Communications, or related field, Excellent written and verbal communication skills, Knowledge of social media platforms, Basic understanding of marketing analytics',
    salary: '$18/hour',
    type: 'internship',
    category: 'Marketing',
    status: 'approved',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Project Manager',
    company: 'Enterprise Solutions Ltd.',
    location: 'Chicago, IL',
    description:
      'Lead and manage cross-functional teams on exciting projects. We need an experienced Project Manager with strong leadership skills and technical background. Competitive salary and benefits.',
    requirements:
      '5+ years of project management experience, Proficiency with project management tools (Jira, Asana), Excellent communication and leadership skills, Knowledge of Agile and Scrum methodologies, PMP certification preferred',
    salary: '$90,000 - $130,000',
    type: 'full-time',
    category: 'Management',
    status: 'approved',
    deadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Backend Developer (Part-time)',
    company: 'Tech Startup XYZ',
    location: 'Remote',
    description:
      'We are looking for a Part-time Backend Developer to help us build robust APIs and microservices. Flexible hours. Work remotely from anywhere!',
    requirements:
      'Experience with Node.js or Python, RESTful API development, Database design skills, English proficiency, Commitment of 20-30 hours per week',
    salary: '$40/hour',
    type: 'part-time',
    category: 'Software Development',
    status: 'approved',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create or find demo recruiter user
    let recruiter = await User.findOne({ email: 'recruiter@demo.com' });

    if (!recruiter) {
      const hashedPassword = await bcryptjs.hash('Demo123!', 10);
      recruiter = await User.create({
        name: 'Demo Recruiter',
        email: 'recruiter@demo.com',
        password: hashedPassword,
        role: 'recruiter',
        company: 'Demo Company',
        phone: '1234567890',
      });
      console.log('✓ Created demo recruiter user');
    } else {
      console.log('✓ Demo recruiter user already exists');
    }

    // Add postedBy to each job and create them
    const jobsWithRecruiter = demoJobs.map((job) => ({
      ...job,
      postedBy: recruiter._id,
    }));

    // Check how many jobs already exist
    const existingJobs = await Job.countDocuments();
    console.log(`\nExisting jobs in database: ${existingJobs}`);

    // Insert demo jobs
    const createdJobs = await Job.insertMany(jobsWithRecruiter);
    console.log(`✓ Created ${createdJobs.length} demo jobs`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDemo Jobs Added:');
    createdJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company}`);
    });

    console.log('\n📝 Demo Recruiter Credentials:');
    console.log('Email: recruiter@demo.com');
    console.log('Password: Demo123!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
