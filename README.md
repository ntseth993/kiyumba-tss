# 🎓 Kiyumba School Website

A comprehensive, professional school management website built with React, featuring separate dashboards for students and administrators.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### Public Pages
- **Home Page**: Modern landing page with hero section, features, statistics, and programs showcase
- **About Page**: School history, mission, vision, core values, and achievements
- **Contact Page**: Contact form with school information and interactive map placeholder

### Authentication
- Secure login system with role-based access control
- Separate dashboards for students and administrators
- Demo credentials for testing

### Student Dashboard
- Course progress tracking with grades
- Upcoming events calendar
- Recent announcements
- Assignment management
- Performance statistics

### Admin Dashboard
- Student and teacher statistics
- Course analytics with completion rates
- Recent student list
- Quick action buttons for common tasks
- Upcoming events management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "kiyumba react"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Demo Credentials

### Admin Access
- **Email**: admin@kiyumba.com
- **Password**: admin123

### Student Access
- **Email**: student@kiyumba.com
- **Password**: student123

## 📁 Project Structure

```
kiyumba react/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── context/            # React Context for state management
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── About.jsx
│   │   ├── About.css
│   │   ├── Contact.jsx
│   │   ├── Contact.css
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentDashboard.css
│   │   ├── AdminDashboard.jsx
│   │   └── AdminDashboard.css
│   ├── App.jsx             # Main application component
│   ├── App.css
│   ├── index.css           # Global styles
│   └── main.jsx           # Application entry point
├── public/                 # Static assets
├── package.json
└── README.md
```

## 🎨 Design Features

- **Modern UI**: Clean, professional design with a consistent color scheme
- **Responsive**: Fully responsive design that works on all devices
- **Smooth Animations**: Fade-in effects and smooth transitions
- **Accessible**: Built with accessibility best practices in mind
- **Icon Library**: Lucide React icons for consistent iconography

## 🛠️ Technologies Used

- **React 19.1.1**: Modern React with hooks
- **React Router DOM 6.21.0**: Client-side routing
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful, customizable icons
- **CSS3**: Custom styling with CSS variables

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Authentication Flow

1. User navigates to `/login`
2. Enters credentials (use demo credentials for testing)
3. System validates and stores user info in localStorage
4. Redirects to appropriate dashboard based on role:
   - Admin → `/admin/dashboard`
   - Student → `/student/dashboard`
5. Protected routes prevent unauthorized access

## 🎯 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] File upload functionality
- [ ] Chat/messaging system
- [ ] Grade management system
- [ ] Attendance tracking
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Dark mode toggle

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer Notes

- Authentication is currently mock-based. In production, integrate with a proper backend API.
- User data is stored in localStorage for demo purposes. Use secure backend storage in production.
- All form submissions currently log to console. Implement API calls for production use.
- The map section uses a placeholder. Integrate Google Maps or similar service for production.

## 📞 Support

For support, email info@kiyumba.edu or visit our contact page.

---

Built with ❤️ for education
