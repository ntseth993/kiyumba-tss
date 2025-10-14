import { useState, useEffect } from 'react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { Edit2, Save, X, Users, BookOpen } from 'lucide-react';
import './TeacherStudentMarks.css';

const TeacherStudentMarks = ({ department }) => {
  const [students, setStudents] = useState([]);
  const [organizedStudents, setOrganizedStudents] = useState(null);
  const [selectedClass, setSelectedClass] = useState('L3');
  const [editingStudent, setEditingStudent] = useState(null);
  const [marksForm, setMarksForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [department]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const organized = await comprehensiveStudentsService.getStudentsByClassAndTrade();
      setOrganizedStudents(organized);
      
      if (department) {
        // Filter by teacher's department
        const allStudents = await comprehensiveStudentsService.getStudentsByDepartment(department);
        setStudents(allStudents);
      } else {
        // Show all students if no department specified
        const allStudents = await comprehensiveStudentsService.getAllStudents();
        setStudents(allStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMarks = (student) => {
    setEditingStudent(student);
    setMarksForm(student.marks || {});
  };

  const handleSaveMarks = async () => {
    if (!editingStudent) return;

    const result = await comprehensiveStudentsService.updateMarks(editingStudent.id, marksForm);
    if (result.success) {
      alert(`Marks updated successfully for ${editingStudent.name}. New GPA: ${result.student.gpa}`);
      setEditingStudent(null);
      setMarksForm({});
      await loadStudents();
    } else {
      alert('Failed to update marks: ' + result.error);
    }
  };

  const getSubjectsForDepartment = (dept) => {
    const subjectMap = {
      'SOD': ['math', 'english', 'science', 'practical'],
      'Fashion': ['design', 'sewing', 'theory', 'practical'],
      'BUC': ['construction', 'masonry', 'theory', 'practical'],
      'Wood Technology': ['carpentry', 'joinery', 'theory', 'practical']
    };
    return subjectMap[dept] || ['subject1', 'subject2', 'subject3', 'practical'];
  };

  const currentStudents = organizedStudents && department 
    ? organizedStudents[selectedClass][department] || []
    : students.filter(s => s.class === selectedClass);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading students...</div>;
  }

  return (
    <div className="teacher-marks-container">
      <div className="marks-header">
        <div>
          <h2>
            <BookOpen size={24} />
            Student Marks Entry
          </h2>
          <p>Enter and manage student marks for {department || 'all departments'}</p>
        </div>
      </div>

      {/* Class Selector */}
      <div className="class-selector">
        <button 
          className={`class-btn ${selectedClass === 'L3' ? 'active' : ''}`}
          onClick={() => setSelectedClass('L3')}
        >
          L3 ({organizedStudents && department ? organizedStudents.L3[department]?.length || 0 : students.filter(s => s.class === 'L3').length})
        </button>
        <button 
          className={`class-btn ${selectedClass === 'L4' ? 'active' : ''}`}
          onClick={() => setSelectedClass('L4')}
        >
          L4 ({organizedStudents && department ? organizedStudents.L4[department]?.length || 0 : students.filter(s => s.class === 'L4').length})
        </button>
        <button 
          className={`class-btn ${selectedClass === 'L5' ? 'active' : ''}`}
          onClick={() => setSelectedClass('L5')}
        >
          L5 ({organizedStudents && department ? organizedStudents.L5[department]?.length || 0 : students.filter(s => s.class === 'L5').length})
        </button>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="marks-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              {department && getSubjectsForDepartment(department).map(subject => (
                <th key={subject}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</th>
              ))}
              <th>GPA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length === 0 ? (
              <tr>
                <td colSpan={department ? 7 + getSubjectsForDepartment(department).length : 6} style={{ textAlign: 'center', padding: '2rem' }}>
                  No students found in {selectedClass} {department ? `- ${department}` : ''}
                </td>
              </tr>
            ) : (
              currentStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.department}</td>
                  {department && getSubjectsForDepartment(department).map(subject => (
                    <td key={subject}>
                      {student.marks?.[subject] || '-'}
                    </td>
                  ))}
                  <td><strong>{student.gpa || '0.00'}</strong></td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEditMarks(student)}
                      title="Edit Marks"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Marks Modal */}
      {editingStudent && (
        <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Marks - {editingStudent.name}</h2>
              <button className="close-btn" onClick={() => setEditingStudent(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="marks-form">
                <div className="student-info-box">
                  <p><strong>Student ID:</strong> {editingStudent.studentId}</p>
                  <p><strong>Class:</strong> {editingStudent.class}</p>
                  <p><strong>Department:</strong> {editingStudent.department}</p>
                  <p><strong>Current GPA:</strong> {editingStudent.gpa || '0.00'}</p>
                </div>

                <h3>Enter Marks (0-100)</h3>
                <div className="marks-grid">
                  {getSubjectsForDepartment(editingStudent.department).map(subject => (
                    <label key={subject}>
                      <strong>{subject.charAt(0).toUpperCase() + subject.slice(1)}</strong>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marksForm[subject] || ''}
                        onChange={(e) => setMarksForm({ ...marksForm, [subject]: parseInt(e.target.value) || 0 })}
                        placeholder="0-100"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditingStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveMarks}>
                <Save size={16} />
                Save Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentMarks;
