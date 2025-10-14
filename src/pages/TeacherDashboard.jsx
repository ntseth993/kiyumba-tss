import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import TeacherExamManagement from '../components/TeacherExamManagement';
import SODDashboard from '../components/departments/SODDashboard';
import WODDashboard from '../components/departments/WODDashboard';
import BUCDashboard from '../components/departments/BUCDashboard';
import FashionDashboard from '../components/departments/FashionDashboard';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { getDepartmentById } from '../services/departmentsService';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
	const { user } = useAuth();
	const [courses, setCourses] = useState([]);
	const [examsCount, setExamsCount] = useState(0);

	useEffect(() => {
		loadDashboardData();
	}, [user]);

	const loadDashboardData = async () => {
		// Load department-specific courses
		if (user?.department) {
			const department = getDepartmentById(user.department);
			setCourses([
				{ id: 1, name: `${department.name} - Level 1`, students: 30 },
				{ id: 2, name: `${department.name} - Level 2`, students: 24 },
				{ id: 3, name: `${department.name} - Advanced`, students: 28 },
			]);
		} else {
			setCourses([
				{ id: 1, name: 'General Course 1', students: 30 },
				{ id: 2, name: 'General Course 2', students: 24 },
				{ id: 3, name: 'General Course 3', students: 28 },
			]);
		}

		// Load exams count
		try {
			const exams = await getExamsByTeacher(user.id.toString());
			setExamsCount(exams.length);
		} catch (error) {
			console.error('Error loading exams:', error);
		}
	};

	// Render department-specific dashboard
	const renderDepartmentDashboard = () => {
		if (!user?.department) {
			return (
				<div className="no-department">
					<h3>Please select a department to view your specialized dashboard</h3>
					<p>Go to Department Selection to choose your teaching department</p>
				</div>
			);
		}

		const department = getDepartmentById(user.department);

		switch (user.department) {
			case 'sod':
				return <SODDashboard user={user} />;
			case 'wod':
				return <WODDashboard user={user} />;
			case 'buc':
				return <BUCDashboard user={user} />;
			case 'fashion':
				return <FashionDashboard user={user} />;
			default:
				// General subjects
				return <GeneralSubjectDashboard user={user} subjectName={department.name} subjectColor={department.color} />;
		}
	};
	return (
		<div className="teacher-dashboard">
			<Navbar />

			<div className="dashboard-container">
				{/* Department-specific dashboard content */}
				{renderDepartmentDashboard()}

				{/* General teacher tools */}
				<div className="teacher-tools-section">
					<div className="section-header">
						<h2>Teacher Tools</h2>
					</div>

					<div className="tools-grid">
						<div className="tool-card">
							<div className="tool-icon">
								<FileText size={24} />
							</div>
							<div className="tool-content">
								<h3>Exam Management</h3>
								<p>Create and manage exams for your classes</p>
								<button className="btn btn-primary">Manage Exams</button>
							</div>
						</div>

						<div className="tool-card">
							<div className="tool-icon">
								<BookOpen size={24} />
							</div>
							<div className="tool-content">
								<h3>Course Materials</h3>
								<p>Upload and organize course materials</p>
								<button className="btn btn-secondary">View Materials</button>
							</div>
						</div>

						<div className="tool-card">
							<div className="tool-icon">
								<Users size={24} />
							</div>
							<div className="tool-content">
								<h3>Student Progress</h3>
								<p>Track student performance and grades</p>
								<button className="btn btn-secondary">View Progress</button>
							</div>
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
