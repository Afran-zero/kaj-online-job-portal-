# kaj-online-job-portal-
Kaj is a full-stack job portal built with the MERN stack (MongoDB, Express.js, React, Node.js), designed to connect job seekers and recruiters seamlessly. It offers a robust platform for students, job finders, and recruiters to engage in job searching, application processes, and talent acquisition.
Features

    User Roles: Register as a Student/Job Seeker or Recruiter with distinct functionalities.
    Authentication: Secure email verification via links and password change functionality.
    Job Search: Search jobs using keywords, view hot job offers, and explore detailed job listings.
    Recruiter Tools: Recruiters can view CVs uploaded by job seekers and manage job postings.
    Job Applications: Job seekers can apply for jobs directly through the platform.
    Blogs: Access career-related blogs for insights and tips.
    Admin Panel: Comprehensive admin dashboard for managing users, jobs, and content.
    Future Enhancements:
        AI-powered CV creation.
        AI-driven CV strength analysis.

Tech Stack

    Frontend: React, Tailwind CSS/Bootstrap (or other UI framework)
    Backend: Node.js, Express.js
    Database: MongoDB
    Authentication: JWT, Email Verification (Nodemailer or similar)
    Deployment: (Add deployment details if applicable, e.g., Vercel, Heroku, AWS)

Installation

    Clone the repository:
    bash

git clone https://github.com/yourusername/kaj.git
Install dependencies for both frontend and backend:
bash
cd kaj/client && npm install
cd ../server && npm install
Set up environment variables (e.g., MongoDB URI, JWT secret, email service credentials).
Run the application:
bash

    npm run dev (for concurrent frontend and backend)

Usage

    Register as a job seeker or recruiter.
    Job seekers can upload CVs, search jobs, and apply.
    Recruiters can post jobs and review applications.
    Admins can manage the platform via the admin panel.

Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.
License

This project is licensed under the MIT License.
