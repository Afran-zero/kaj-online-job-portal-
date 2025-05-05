


 🌐 Kaj - Online Job Portal

**Kaj** is a full-stack job portal built using the **MERN stack** (MongoDB, Express.js, React, Node.js). It is designed to seamlessly connect **job seekers** and **recruiters**, providing a streamlined platform for job hunting, applications, and talent acquisition.

---

## 🚀 Features

* **User Roles**
  Register as either a **Student/Job Seeker** or **Recruiter** — each with tailored functionalities.

* **Secure Authentication**
  Includes email verification via secure links and a password change feature.

* **Job Search & Applications**
  Search jobs using keywords, browse hot job offers, and apply directly.

* **Recruiter Tools**
  Post jobs, view applicant CVs, and manage talent pipelines.

* **Blog Section**
  Read and share career advice, job interview tips, and industry insights.

* **Admin Panel**
  Powerful admin dashboard to manage users, job listings, and site content.

* **Planned Enhancements**

  * AI-powered CV creation tool.
  * AI-based CV strength analyzer.

---

## 🛠️ Tech Stack

* **Frontend**: React, Tailwind CSS / Bootstrap
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **Authentication**: JWT, Email verification (via Nodemailer or similar)
* **Deployment**: *(e.g., Vercel, Heroku, AWS — update accordingly)*

---

## 📦 Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/kaj.git
   ```

2. **Install Dependencies**

   ```bash
   cd kaj/client
   npm install

   cd ../server
   npm install
   ```

3. **Environment Variables**

   Create `.env` files in the `server` (and `client` if needed) folder with the following (example):

   ```
MONGO_URI=
PORT=
SECRET_KEY=
CLOUD_NAME=
API_KEY=
API_SECRET =
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:5173

   ```

4. **Run the Application**

   ```bash
   npm run dev
   ```

   > This will concurrently run both the frontend and backend (using a tool like `concurrently`).

---

## 👥 Usage

* **Job Seekers**
  Register, upload your CV, search for jobs, and apply directly through the portal.

* **Recruiters**
  Post new job listings, manage applicants, and view uploaded CVs.

* **Admins**
  Log in to the admin panel to oversee and manage users, jobs, blogs, and more.

---

## 🤝 Contributing

Contributions are welcome and appreciated!
To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/YourFeatureName`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeatureName`
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License**.

---
