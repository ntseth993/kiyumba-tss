import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    type: 'quiz',
    instructions: '',
    questions: [],
    visible: false
  });

  useEffect(() => {
    fetch('/api/courses').then(r=>r.json()).then(setCourses);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetch(`/api/assessments?course_id=${selectedCourse.id}`).then(r=>r.json()).then(setAssessments);
    }
  }, [selectedCourse]);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert('Select a course');
    if (!newAssessment.title.trim()) return alert('Title required');
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAssessment, course_id: selectedCourse.id })
    });
    if (res.ok) {
      alert('Assessment created');
      setNewAssessment({ title: '', type: 'quiz', instructions: '', questions: [], visible: false });
      fetch(`/api/assessments?course_id=${selectedCourse.id}`).then(r=>r.json()).then(setAssessments);
    } else {
      alert('Error creating assessment');
    }
  };

  return (
    <div className="teacher-dashboard">
      <Navbar />
      <div className="dashboard-container">
        <h1>Teacher Dashboard</h1>
        <div>
          <label>Select Course:</label>
          <select value={selectedCourse?.id || ''} onChange={e => setSelectedCourse(courses.find(c => c.id == e.target.value))}>
            <option value="">-- Select --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <form onSubmit={handleCreateAssessment} className="card">
          <h2>Create Assessment</h2>
          <input type="text" placeholder="Title" value={newAssessment.title} onChange={e => setNewAssessment(a => ({ ...a, title: e.target.value }))} required />
          <select value={newAssessment.type} onChange={e => setNewAssessment(a => ({ ...a, type: e.target.value }))}>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="test">Test</option>
          </select>
          <textarea placeholder="Instructions" value={newAssessment.instructions} onChange={e => setNewAssessment(a => ({ ...a, instructions: e.target.value }))} />
          <label><input type="checkbox" checked={newAssessment.visible} onChange={e => setNewAssessment(a => ({ ...a, visible: e.target.checked }))} /> Visible to students</label>
          <button type="submit">Create</button>
        </form>
        <div className="assessments-list card">
          <h2>Assessments for {selectedCourse?.name}</h2>
          {assessments.map(a => (
            <div key={a.id} className="assessment-item">
              <strong>{a.title}</strong> ({a.type}) - {a.visible ? 'Visible' : 'Hidden'}
              <div>{a.instructions}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
