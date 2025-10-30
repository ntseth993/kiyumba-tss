import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TeacherDashboard = () => {
	return (
		<div className="teacher-dashboard">
			<Navbar />
			<main className="container">
				<h1>Teacher Dashboard</h1>
				<p>Welcome to the teacher dashboard. Use the links below to manage your classes and resources.</p>
				<ul>
					<li><Link to="/teacher/settings">Settings</Link></li>
					<li><Link to="/attendance">Mark Attendance</Link></li>
					<li><Link to="/school/timetable">Timetable</Link></li>
				</ul>
			</main>
			<Footer />
		</div>
	);
};

export default TeacherDashboard;
