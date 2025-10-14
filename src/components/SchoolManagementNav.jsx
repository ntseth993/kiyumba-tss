import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  Home,
  ChevronDown,
  BarChart3,
  Award,
  Target,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react';

const SchoolManagementNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const schoolFeatures = [
    {
      id: 'overview',
      title: 'School Overview',
      path: '/admin/dashboard',
      icon: Home,
      description: 'Main school dashboard'
    },
    {
      id: 'teachers',
      title: 'Teacher Management',
      path: '/school/teachers',
      icon: Users,
      description: 'Manage teachers and performance'
    },
    {
      id: 'timetable',
      title: 'Timetable & Schedule',
      path: '/school/timetable',
      icon: Calendar,
      description: 'Class schedules and room allocation'
    },
    {
      id: 'exams',
      title: 'Exam Management',
      path: '/school/exams',
      icon: FileText,
      description: 'Exams, results, and grading'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      path: '/school/assignments',
      icon: BookOpen,
      description: 'Homework and project management'
    }
  ];

  const isActive = (path) => currentPath === path;

  return (
    <div className="school-management-nav">
      <div className="nav-header">
        <div className="nav-title">
          <BarChart3 size={20} />
          <span>School Management</span>
        </div>
        <ChevronDown size={16} />
      </div>

      <div className="nav-items">
        {schoolFeatures.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Link
              key={feature.id}
              to={feature.path}
              className={`nav-item ${isActive(feature.path) ? 'active' : ''}`}
            >
              <IconComponent size={18} />
              <div className="nav-item-content">
                <span className="nav-item-title">{feature.title}</span>
                <span className="nav-item-description">{feature.description}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="nav-footer">
        <div className="nav-stats">
          <div className="stat">
            <CheckCircle size={14} color="#10B981" />
            <span>4/4 Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolManagementNav;
