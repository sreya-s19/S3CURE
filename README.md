# S3CURE - Cybercrime Investigation Game Platform

 
<!-- Note: You should replace this with a screenshot of your own running application! -->

> "You are not a player. You are the investigator."

S3CURE is a fully gamified web platform designed to immerse users in the role of cybercrime investigators. Operating under the fictional agency "Cyber Diaries," users tackle complex cybercrime missions, solve interactive, multi-layered challenges, and earn digital badges that reflect their expertise. This project focuses on realistic, skill-based learning over simple memorization, creating an engaging educational experience for aspiring cybersecurity professionals.

---

## ✨ Core Features

*   **Immersive Investigation:** Realistic cybercrime scenarios that require critical thinking and proficiency with simulated forensic tools.
*   **Progressive Difficulty:** Missions scale in complexity, demanding deeper analytical skills and advanced techniques as the user progresses.
*   **Skill-Based Progression:** Users earn ranks and badges based on demonstrated investigative prowess, not just mission completion.
*   **Dynamic Content Engine:** A robust backend and admin system (in development) allows for the creation and modification of intricate, evolving cybercrime narratives.
*   **Personalized Dashboard:** A central hub for investigators to track their progress, view completed missions, and display their collection of earned badges.
*   **Simulated Toolkits:** Includes interactive modules simulating real-world tools for log analysis, file forensics, packet analysis, OSINT, and more.

---

## 🛠️ Tech Stack

This project is a full-stack monorepo application built with a modern, scalable architecture.

*   **Frontend:**
    *   **Framework:** React (with Vite)
    *   **Styling:** Tailwind CSS
    *   **Animations:** Framer Motion
    *   **State Management:** React Context API
    *   **Routing:** React Router

*   **Backend & Database:**
    *   **Backend Logic:** Firebase Functions (Node.js)
    *   **Database:** Cloud Firestore
    *   **Authentication:** Firebase Authentication
    *   **Hosting:** Firebase Hosting (for deployment)

*   **Development Environment:**
    *   **Local Simulation:** Firebase Emulator Suite
    *   **Version Control:** Git & GitHub
    *   **Node Version Management:** NVM

---

## 🚀 Running the Project Locally

To set up and run this project on your local machine, you will need Node.js (v18 is recommended), NVM, and the Firebase CLI installed.

### 1. Clone the Repository
```bash
git clone https://github.com/sreya-s19/S3CURE.git
cd S3CURE

##Install Dependencies
This project has two separate package.json files. You must install dependencies for both the backend (functions) and the frontend (client).
Generated bash
# Install backend dependencies
cd functions
npm install

# Install frontend dependencies
cd ../client
npm install
Use code with caution.
Bash
Setup Firebase
You will need a serviceAccountKey.json file from your own Firebase project to run the admin scripts.
Place this key in the root directory of the project. This file is included in .gitignore and should never be committed.
Run the Application
The application requires two terminals running simultaneously: one for the Firebase backend emulators and one for the React frontend server.
Terminal 1: Start the Backend Emulators
Generated bash
# From the project root directory (S3CURE-V2/)
npm run emu
Use code with caution.
Bash
This will start the Firebase emulators for Authentication, Functions, and Firestore.
Terminal 2: Start the Frontend Development Server
Generated bash
# From the project root directory (S3CURE-V2/)
cd client
npm run dev
Use code with caution.
Bash
This will start the React application. You can now access it in your browser at the local address provided (usually http://localhost:5173).
