import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import {User} from '../models/user.model.js';
import {Company} from '../models/company.model.js';
import { Job } from "../models/job.model.js";
import {Application} from '../models/application.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Clear existing data
async function clearDatabase() {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Database cleared');
}

// Generate random users
async function createUsers() {
    const users = [];
    const password = await bcrypt.hash('password123', 10);
    
    // Create 5 recruiters
    for (let i = 0; i < 5; i++) {
        users.push({
            fullname: faker.person.fullName(),
            email: `recruiter${i}@example.com`,
            phoneNumber: faker.phone.number('##########'),
            password,
            role: 'recruiter',
            profile: {
                bio: faker.person.bio(),
                profilePhoto: faker.image.avatar()
            },
            isVerified: true
        });
    }
    
    // Create 20 students
    for (let i = 0; i < 20; i++) {
        users.push({
            fullname: faker.person.fullName(),
            email: `student${i}@example.com`,
           // In createUsers() function, replace the phoneNumber generation:
phoneNumber: parseInt(faker.phone.number().replace(/\D/g, '').slice(0, 10)),
            password,
            role: 'student',
            profile: {
                bio: faker.person.bio(),
                skills: Array.from({ length: 5 }, () => faker.person.jobArea()),
                resume: 'resume.pdf',
                resumeOriginalName: 'MyResume.pdf',
                profilePhoto: faker.image.avatar()
            },
            isVerified: true
        });
    }
    
    // Insert all users
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
}

// Generate companies
async function createCompanies(recruiters) {
    const companies = [];
    const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing'];
    
    for (let i = 0; i < 5; i++) {
        companies.push({
            name: faker.company.name(),
            description: faker.company.catchPhrase(),
            website: faker.internet.url(),
            location: `${faker.location.city()}, ${faker.location.country()}`,
            logo: faker.image.urlLoremFlickr({ category: 'business' }),
            userId: recruiters[i]._id
        });
    }
    
    const createdCompanies = await Company.insertMany(companies);
    console.log(`${createdCompanies.length} companies created`);
    
    // Update recruiters with their company info
    for (let i = 0; i < 5; i++) {
        await User.findByIdAndUpdate(recruiters[i]._id, {
            'profile.company': createdCompanies[i]._id
        });
    }
    
    return createdCompanies;
}

// Generate jobs
async function createJobs(companies, recruiters) {
    const jobs = [];
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
    const positions = ['Software Engineer', 'Data Analyst', 'Product Manager', 'UX Designer', 'Marketing Specialist'];
    
    for (let i = 0; i < 20; i++) {
        const companyIndex = i % 5; // Distribute jobs evenly across companies
        jobs.push({
            title: positions[Math.floor(Math.random() * positions.length)],
            description: faker.lorem.paragraphs(3),
            requirements: Array.from({ length: 5 }, () => faker.lorem.sentence()),
            salary: faker.number.int({ min: 30000, max: 150000 }),
            experienceLevel: faker.number.int({ min: 0, max: 10 }),
            location: `${faker.location.city()}, ${faker.location.country()}`,
            jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
            position: faker.number.int({ min: 1, max: 5 }),
            company: companies[companyIndex]._id,
            created_by: recruiters[companyIndex]._id
        });
    }
    
    const createdJobs = await Job.insertMany(jobs);
    console.log(`${createdJobs.length} jobs created`);
    return createdJobs;
}

// Generate applications
async function createApplications(jobs, students) {
    const applications = [];
    const statuses = ['pending', 'accepted', 'rejected'];
    
    // Each student applies to 3-5 random jobs
    for (const student of students) {
        const jobsToApply = jobs.sort(() => 0.5 - Math.random()).slice(0, faker.number.int({ min: 3, max: 5 }));
        
        for (const job of jobsToApply) {
            applications.push({
                job: job._id,
                applicant: student._id,
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
    }
    
    const createdApplications = await Application.insertMany(applications);
    console.log(`${createdApplications.length} applications created`);
    
    // Update jobs with their applications
    for (const application of createdApplications) {
        await Job.findByIdAndUpdate(application.job, {
            $push: { applications: application._id }
        });
    }
    
    return createdApplications;
}

// Main seeding function
async function seedDatabase() {
    try {
        await clearDatabase();
        
        const users = await createUsers();
        const recruiters = users.filter(user => user.role === 'recruiter');
        const students = users.filter(user => user.role === 'student');
        
        const companies = await createCompanies(recruiters);
        const jobs = await createJobs(companies, recruiters);
        await createApplications(jobs, students);
        
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.error('Unhandled rejection during seeding:', err);
    process.exit(1);
});

seedDatabase();