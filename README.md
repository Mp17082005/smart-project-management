# ProjectFlow - Modern Project Management App

ProjectFlow is a premium, production-ready project management application inspired by Jira and Trello. It focuses on clarity, usability, and modern real-world workflows.

## 🚀 Features

- **Projects Dashboard**: Visual grid of projects with progress bars and member avatars.
- **Kanban & List Views**: Flexible task management with status columns and detailed list views.
- **Admin Control Panel**: Elevated privileges for managing users, projects, and global analytics.
- **My Tasks**: Dedicated focus view for users to see their upcoming and overdue assignments.
- **Activity Log**: Real-time tracking of task creation, assignments, and status changes.
- **Responsive Design**: Glassmorphism UI that looks stunning on desktop and mobile.

## 👥 User Roles

| Action | Admin | Member |
| :--- | :---: | :---: |
| Create Project | ✅ | ❌ |
| Create Task | ✅ | ✅ |
| Delete Task | ✅ | ❌ |
| Assign Task | ✅ | ✅ |
| View Analytics | ✅ | ❌ |

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide Icons, React Router.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Auth**: Google OAuth (via `google-auth-library`).
- **Styling**: Vanilla Tailwind with custom design system tokens.

## 🏗️ App Flow

1. **Login**: User authenticates 
2. **Dashboard**: View all active projects and global progress.
3. **Project Detail**: Manage specific tasks via Kanban Board or List.
4. **Task Detail**: Assign users, set priority/due dates, and comment.
5. **My Tasks**: Personal productivity hub.

## 💻 How to Run Locally

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)

### Setup

1. **Clone the repository**
2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Create a .env file with MONGODB_URI and JWT_SECRET
   npm start
   ```
3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🧠 Design Philosophy
- **Clarity over Complexity**: Reduce cognitive load with consistent spacing and typography.
- **Aesthetic Excellence**: Premium shadows, smooth gradients (#4F46E5), and micro-animations.
- **Real-world Workflows**: Email-based assignments and pending user states.

Developed with ❤️ as a production-level project management solution.
