import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import { BookOpen, Calendar, FileText, User } from 'lucide-react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
	const { user } = useAuth();
	const [courses, setCourses] = useState([]);

	useEffect(() => {
		// placeholder: in the real app this would call a service
		setCourses([
			{ id: 1, name: 'Mathematics 101', students: 30 },
			{ id: 2, name: 'Physics 201', students: 24 },
			{ id: 3, name: 'Chemistry 110', students: 28 },
		]);
	}, []);

	return (
		<div className="teacher-dashboard">
			<Navbar />

			<div className="dashboard-container">
				<div className="dashboard-header">
					<div className="welcome-section">
						<img src={user?.avatar} alt={user?.name} className="user-avatar" />
						<div>
							<h1>Welcome, {user?.name}</h1>
							<p>Teacher Dashboard</p>
						</div>
					</div>
				</div>

				<div className="stats-grid">
					<div className="stat-card card">
						<div className="stat-icon" style={{ backgroundColor: '#EEF2FF' }}>
							<BookOpen size={24} color="#4F46E5" />
						</div>
						<div className="stat-content">
							<h3>{courses.length}</h3>
							<p>Courses</p>
						</div>
					</div>

					<div className="stat-card card">
						<div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
							<User size={24} color="#10B981" />
						</div>
						<div className="stat-content">
							<h3>{courses.reduce((sum, c) => sum + c.students, 0)}</h3>
							<p>Total Students</p>
						</div>
					</div>

					<div className="stat-card card">
						<div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
							<Calendar size={24} color="#F59E0B" />
						</div>
						<div className="stat-content">
							<h3>3</h3>
							<p>Upcoming Events</p>
						</div>
					</div>

					<div className="stat-card card">
						<div className="stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
							<FileText size={24} color="#EF4444" />
						</div>
						<div className="stat-content">
							<h3>5</h3>
							<p>Assignments</p>
						</div>
					</div>
				</div>

				<div className="dashboard-grid">
					<div className="dashboard-section">
						<div className="section-header">
							<h2>
								<BookOpen size={20} /> My Courses
							</h2>
						</div>
						<div className="courses-list">
							{courses.map((c) => (
								<div key={c.id} className="course-card card">
									<h3>{c.name}</h3>
									<p>{c.students} students</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<Chat />
			<Footer />
		</div>
	);
};

export default TeacherDashboard;
