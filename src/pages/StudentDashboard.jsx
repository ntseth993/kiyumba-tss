import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Calendar, Award, FileText, Clock, TrendingUp, Bell, User } from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();

  const courses = [
    { id: 1, name: 'Mathematics', progress: 85, grade: 'A', teacher: 'Mr. Smith', program: 'software' },
    { id: 2, name: 'English Literature', progress: 92, grade: 'A+', teacher: 'Mrs. Johnson', program: 'software' },
    { id: 3, name: 'Physics', progress: 78, grade: 'B+', teacher: 'Dr. Williams', program: 'software' },
    { id: 4, name: 'Chemistry', progress: 88, grade: 'A', teacher: 'Ms. Brown', program: 'fashion' },
  ];

  const [remoteCourses, setRemoteCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const loadRemote = async () => {
      try {
        const c = await fetch('/api/courses').then(r=>r.json()).catch(()=>[]);
        setRemoteCourses(c);
        // load assessments for first course in same program as user
        const program = user.program || (c[0] && c[0].program) || 'software';
        const courseForProgram = c.find(x=>x.program===program) || c[0];
        if (courseForProgram) {
          const a = await fetch(`/api/assessments?course_id=${courseForProgram.id}`).then(r=>r.json()).catch(()=>[]);
          setAssessments(a);
        }
      } catch (e) {
        console.error('remote load failed', e);
      }
    };
    loadRemote();
  }, [user.program]);

  const upcomingEvents = [
    { id: 1, title: 'Math Exam', date: '2024-04-15', type: 'exam' },
    { id: 2, title: 'Science Fair', date: '2024-04-20', type: 'event' },
    { id: 3, title: 'Sports Day', date: '2024-04-25', type: 'event' },
  ];

  const recentAnnouncements = [
    { id: 1, title: 'Mid-term Results Published', date: '2024-04-10', priority: 'high' },
    { id: 2, title: 'Library Hours Extended', date: '2024-04-08', priority: 'normal' },
    { id: 3, title: 'Parent-Teacher Meeting', date: '2024-04-05', priority: 'high' },
  ];

  return (
    <div className="student-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h1>Welcome back, {user.name}!</h1>
              <p>Student ID: {user.studentId} | Grade: {user.grade}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#EEF2FF' }}>
              <BookOpen size={24} color="#4F46E5" />
            </div>
            <div className="stat-content">
              <h3>4</h3>
              <p>Active Courses</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
              <TrendingUp size={24} color="#10B981" />
            </div>
            <div className="stat-content">
              <h3>85.8%</h3>
              <p>Average Grade</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
              <Award size={24} color="#F59E0B" />
            </div>
            <div className="stat-content">
              <h3>12</h3>
              <p>Achievements</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
              <Clock size={24} color="#EF4444" />
            </div>
            <div className="stat-content">
              <h3>3</h3>
              <p>Pending Tasks</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Courses Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <BookOpen size={24} />
                My Courses
              </h2>
            </div>
            <div className="courses-list">
              {courses.map((course) => (
                <div key={course.id} className="course-card card">
                  <div className="course-header">
                    <h3>{course.name}</h3>
                    <span className={`grade-badge grade-${course.grade.charAt(0).toLowerCase()}`}>
                      {course.grade}
                    </span>
                  </div>
                  <p className="course-teacher">
                    <User size={16} />
                    {course.teacher}
                  </p>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Calendar size={24} />
                Upcoming Events
              </h2>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item card">
                  <div className={`event-indicator ${event.type}`}></div>
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <p>{new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                  <span className={`event-type ${event.type}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Bell size={24} />
                Announcements
              </h2>
            </div>
            <div className="announcements-list">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="announcement-item card">
                  <div className="announcement-header">
                    <h4>{announcement.title}</h4>
                    {announcement.priority === 'high' && (
                      <span className="priority-badge">Important</span>
                    )}
                  </div>
                  <p className="announcement-date">{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FileText size={24} />
                Recent Assignments
              </h2>
            </div>
            <div className="assignments-list">
              <div className="assignment-item card">
                <div className="assignment-header">
                  <h4>Physics Lab Report</h4>
                  <span className="status-badge pending">Pending</span>
                </div>
                <p className="assignment-due">Due: April 18, 2024</p>
              </div>
              <div className="assignment-item card">
                <div className="assignment-header">
                  <h4>English Essay</h4>
                  <span className="status-badge submitted">Submitted</span>
                </div>
                <p className="assignment-due">Submitted: April 10, 2024</p>
              </div>
              <div className="assignment-item card">
                <div className="assignment-header">
                  <h4>Math Problem Set</h4>
                  <span className="status-badge graded">Graded (95%)</span>
                </div>
                <p className="assignment-due">Graded: April 12, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
