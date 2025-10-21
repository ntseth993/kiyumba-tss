import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, BookOpen, Plus, Upload, Calculator, DollarSign, Eye, Edit, Trash2, Send, Download, Filter, Search } from 'lucide-react';
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
import GeneralSubjectDashboard from '../components/departments/GeneralSubjectDashboard';
import { getDepartmentSubjects } from '../services/departmentSubjectsService';
import { studentsService } from '../services/studentsService';
import { marksService, calculateGrade } from '../services/marksService';
import { createAssessment, updateAssessment, fileToBase64 } from '../services/assessmentsService';

const TeacherDashboard = () => {
	const { user } = useAuth();
	const [courses, setCourses] = useState([]);
	const [examsCount, setExamsCount] = useState(0);
	const [activeTab, setActiveTab] = useState('overview');

	// Assessment system state
	const [assessments, setAssessments] = useState([]);
	const [selectedClass, setSelectedClass] = useState('All');
	const [assessmentType, setAssessmentType] = useState('All');
	const [showAssessmentModal, setShowAssessmentModal] = useState(false);
	const [editingAssessment, setEditingAssessment] = useState(null);
	const [newAssessment, setNewAssessment] = useState({
		title: '',
		type: 'exam',
		class: '',
		description: '',
		dueDate: '',
		file: null
	});

	// Marks system state
	const [marks, setMarks] = useState([]);
	const [students, setStudents] = useState([]);
	const [selectedClassForMarks, setSelectedClassForMarks] = useState('');
	const [selectedSubject, setSelectedSubject] = useState(null);
	const [showMarksModal, setShowMarksModal] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [markEntry, setMarkEntry] = useState({ mark: '', maxMark: 100, assessmentType: 'exam', comments: '' });
	const [marksModalMode, setMarksModalMode] = useState('new'); // 'new', 'view', 'edit'
	const [selectedMarkForEdit, setSelectedMarkForEdit] = useState(null);
	const [departmentSubjects, setDepartmentSubjects] = useState([]);

	// Budget system state
	const [budgets, setBudgets] = useState([]);
	const [showBudgetModal, setShowBudgetModal] = useState(false);
	const [newBudget, setNewBudget] = useState({
		class: '',
		title: '',
		description: '',
		amount: '',
		category: 'materials',
		urgency: 'medium'
	});

	useEffect(() => {
		loadDashboardData();
		// Load assessments from localStorage
		const storedAssessments = localStorage.getItem('assessments');
		if (storedAssessments) {
			setAssessments(JSON.parse(storedAssessments));
		}
	}, [user]);

	useEffect(() => {
		if (selectedClassForMarks) {
			loadStudentsForClass();
		}
	}, [selectedClassForMarks, user]);

	// Persist assessments to localStorage whenever they change
	useEffect(() => {
		if (assessments.length > 0) {
			localStorage.setItem('assessments', JSON.stringify(assessments));
		}
	}, [assessments]);

	const loadDashboardData = async () => {
		// Load department-specific subjects
		const dept = user?.department || 'sod'; // Default to SOD if no department
		const subjects = getDepartmentSubjects(dept);
		setDepartmentSubjects(subjects);
		
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

		// Load marks
		await loadMarks();

		// Load exams count
		try {
			setExamsCount(assessments.length);
		} catch (error) {
			console.error('Error loading exams:', error);
			initializeSampleData();
		}
	};

	const loadStudentsForClass = async () => {
		try {
			let classStudents;
			if (user?.department) {
				classStudents = await studentsService.getStudentsByClassAndDepartment(selectedClassForMarks, user.department);
			} else {
				// If no department, load all students for the class
				classStudents = await studentsService.getStudentsByClass(selectedClassForMarks);
			}
			setStudents(classStudents);
		} catch (error) {
			console.error('Error loading students:', error);
			setStudents([]);
		}
	};

	const loadMarks = async () => {
		try {
			const teacherMarks = await marksService.getMarksByTeacher(user?.id);
			setMarks(teacherMarks);
		} catch (error) {
			console.error('Error loading marks:', error);
			setMarks([]);
		}
	};

	const initializeSampleData = () => {
		// Sample assessments
		setAssessments([
			{
				id: 1,
				title: 'Mathematics Midterm Exam',
				type: 'exam',
				class: 'L3',
				description: 'Covers chapters 1-5',
				dueDate: '2024-02-15',
				status: 'active',
				submissions: 25
			},
			{
				id: 2,
				title: 'Physics Quiz 1',
				type: 'quiz',
				class: 'L4',
				description: 'Mechanics fundamentals',
				dueDate: '2024-02-10',
				status: 'active',
				submissions: 18
			},
			{
				id: 3,
				title: 'Chemistry Lab Notes',
				type: 'notes',
				class: 'L5',
				description: 'Organic chemistry reactions',
				dueDate: '2024-02-20',
				status: 'draft',
				submissions: 0
			}
		]);

		// Sample marks data
		setMarks([
			{
				id: 1,
				assessmentId: 1,
				assessmentName: 'Mathematics Midterm Exam',
				class: 'L3',
				students: [
					{ id: 1, name: 'Alice Johnson', mark: 85, maxMark: 100, grade: 'A' },
					{ id: 2, name: 'Bob Smith', mark: 72, maxMark: 100, grade: 'B' },
					{ id: 3, name: 'Carol Davis', mark: 91, maxMark: 100, grade: 'A' }
				]
			}
		]);

		// Sample budgets
		setBudgets([
			{
				id: 1,
				class: 'L3',
				title: 'Lab Equipment',
				description: 'Chemistry lab materials',
				amount: 50000,
				category: 'equipment',
				urgency: 'high',
				status: 'pending',
				approved: false
			}
		]);
	};

	const handleCreateAssessment = async () => {
		if (!newAssessment.title || !newAssessment.class || !newAssessment.dueDate) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			// Convert file to base64 if present
			let fileData = null;
			if (newAssessment.file) {
				fileData = await fileToBase64(newAssessment.file);
			}

			const assessmentData = {
				title: newAssessment.title,
				type: newAssessment.type,
				class: newAssessment.class,
				description: newAssessment.description,
				dueDate: newAssessment.dueDate,
				teacherId: user?.id,
				file: fileData,
				fileName: newAssessment.file?.name
			};

			if (editingAssessment) {
				// Update existing assessment
				const result = await updateAssessment(editingAssessment.id, assessmentData);
				
				// Update local state
				setAssessments(prev => prev.map(assessment => 
					assessment.id === editingAssessment.id 
						? { ...assessment, ...assessmentData, updatedAt: new Date().toISOString() }
						: assessment
				));
				alert('Assessment updated successfully!');
			} else {
				// Create new assessment
				const result = await createAssessment(assessmentData);

				// Update local state with the created assessment
				const newAssessmentItem = {
					id: result.id || assessments.length + 1,
					...assessmentData,
					status: 'active',
					submissions: 0,
					createdAt: new Date().toISOString()
				};

				setAssessments(prev => [...prev, newAssessmentItem]);
				alert('Assessment created successfully!');
			}

			// Reset modal
			setShowAssessmentModal(false);
			setEditingAssessment(null);
			setNewAssessment({
				title: '',
				type: 'exam',
				class: '',
				description: '',
				dueDate: '',
				file: null
			});
		} catch (error) {
			console.error('Error saving assessment:', error);
			alert('Failed to save assessment. Please try again.');
		}
	};

	const handleAddMark = () => {
		if (!selectedClassForMarks || !selectedSubject) {
			alert('Please select both a class and a subject');
			return;
		}
		
		// Initialize marks for all students in the class
		const initialMarks = {};
		students.forEach(student => {
			initialMarks[student.id] = {
				name: student.name,
				mark: '',
				maxMark: 100,
				submitted: false
			};
		});
		
		setMarkEntry({ maxMark: 100, assessmentType: 'exam', comments: '', studentMarks: initialMarks });
		setMarksModalMode('new');
		setShowMarksModal(true);
	};

	const handleSaveMark = async () => {
		if (!selectedSubject || !selectedClassForMarks) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			if (marksModalMode === 'edit' && selectedMarkForEdit) {
				// Update existing mark
				await marksService.updateMark(selectedMarkForEdit.id, {
					mark: parseFloat(markEntry.mark),
					maxMark: parseFloat(markEntry.maxMark),
					assessmentType: markEntry.assessmentType,
					comments: markEntry.comments
				});
				alert('Mark updated successfully!');
				await loadMarks();
				setShowMarksModal(false);
			} else {
				// Create marks for all students
				const studentMarks = markEntry.studentMarks || {};
				let savedCount = 0;
				let skippedCount = 0;
				
				for (const [studentId, markData] of Object.entries(studentMarks)) {
					if (markData.mark !== '' && markData.mark !== null) {
						await marksService.createMark({
							studentId: parseInt(studentId),
							studentName: markData.name,
							subjectId: selectedSubject.id,
							subjectName: selectedSubject.name,
							class: selectedClassForMarks,
							department: user?.department || 'general',
							teacherId: user?.id || 1,
							mark: parseFloat(markData.mark),
							maxMark: parseFloat(markData.maxMark || markEntry.maxMark),
							assessmentType: markEntry.assessmentType,
							comments: markEntry.comments
						});
						savedCount++;
					} else {
						skippedCount++;
					}
				}
				
				alert(`Marks saved successfully!\n${savedCount} students graded, ${skippedCount} skipped.`);
				await loadMarks();
				setShowMarksModal(false);
			}
			
			setMarkEntry({ mark: '', maxMark: 100, assessmentType: 'exam', comments: '' });
			setMarksModalMode('new');
		} catch (error) {
			console.error('Error saving mark:', error);
			alert('Failed to save marks. Please try again.');
		}
	};

	const handleEditMark = (mark) => {
		setSelectedMarkForEdit(mark);
		setMarksModalMode('edit');
		setSelectedStudent(students.find(s => s.id === mark.studentId));
		setSelectedSubject(departmentSubjects.find(s => s.id === mark.subjectId));
		setMarkEntry({
			mark: mark.mark,
			maxMark: mark.maxMark,
			assessmentType: mark.assessmentType,
			comments: mark.comments || ''
		});
		setShowMarksModal(true);
	};

	const handleDeleteMark = async (markId) => {
		if (window.confirm('Are you sure you want to delete this mark?')) {
			try {
				await marksService.deleteMark(markId);
				alert('Mark deleted successfully!');
				await loadMarks();
			} catch (error) {
				console.error('Error deleting mark:', error);
				alert('Failed to delete mark. Please try again.');
			}
		}
	};

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
				return <GeneralSubjectDashboard user={user} subjectName={department.name} subjectColor={department.color} />;
		}
	};

	const handleCreateBudget = () => {
		if (!newBudget.title || !newBudget.class || !newBudget.amount) {
			alert('Please fill in all required fields');
			return;
		}

		const budget = {
			id: budgets.length + 1,
			...newBudget,
			status: 'pending',
			approved: false,
			createdAt: new Date().toISOString()
		};

		setBudgets(prev => [...prev, budget]);
		setShowBudgetModal(false);
		setNewBudget({
			class: '',
			title: '',
			description: '',
			amount: '',
			category: 'materials',
			urgency: 'medium'
		});
		alert('Budget request created successfully!');
	};

	const handleSendAssessment = async (assessment) => {
		try {
			// Get students for the selected class
			const classStudents = courses.find(c => c.name.includes(assessment.class));
			if (!classStudents) {
				alert('No students found for this class');
				return;
			}

			// Generate student IDs for the class (in a real app, these would come from the database)
			const studentIds = Array.from({ length: classStudents.students }, (_, i) => i + 1);

			const result = await sendAssessmentToStudents(assessment.id, studentIds);

			// Update the assessment status to show it's been sent
			setAssessments(prev => prev.map(a =>
				a.id === assessment.id
					? { ...a, status: 'sent', sentAt: new Date().toISOString() }
					: a
			));

			alert(`Assessment sent successfully to ${studentIds.length} students!`);
		} catch (error) {
			console.error('Error sending assessment:', error);
			alert('Failed to send assessment. Please try again.');
		}
	};

	const handleViewAssessment = (assessment) => {
		// TODO: Implement view assessment details
		alert(`Viewing assessment: ${assessment.title}`);
	};

	const handleEditAssessment = (assessment) => {
		setEditingAssessment(assessment);
		setNewAssessment({
			title: assessment.title,
			type: assessment.type,
			class: assessment.class,
			description: assessment.description || '',
			dueDate: assessment.dueDate,
			file: null
		});
		setShowAssessmentModal(true);
	};

	const filteredAssessments = assessments.filter(assessment => {
		if (selectedClass !== 'All' && assessment.class !== selectedClass) return false;
		if (assessmentType !== 'All' && assessment.type !== assessmentType) return false;
		return true;
	});

	return (
		<div className="teacher-dashboard">
			<Navbar />

			<div className="dashboard-container">
				{/* Tab Navigation */}
				<div className="tab-navigation">
					<button
						className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
						onClick={() => setActiveTab('overview')}
					>
						<BookOpen size={20} />
						<span>Overview</span>
					</button>
					<button
						className={`tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
						onClick={() => setActiveTab('assessments')}
					>
						<FileText size={20} />
						<span>Assessments</span>
					</button>
					<button
						className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
						onClick={() => setActiveTab('marks')}
					>
						<Calculator size={20} />
						<span>Marks Entry</span>
					</button>
					<button
						className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
						onClick={() => setActiveTab('budget')}
					>
						<DollarSign size={20} />
						<span>Class Budget</span>
					</button>
				</div>

				{/* Tab Content */}
				{activeTab === 'overview' && (
					<>
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
					</>
				)}

				{activeTab === 'assessments' && (
					<div className="assessments-section">
						<div className="section-header">
							<h2>Assessment Management</h2>
							<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
								<select
									value={selectedClass}
									onChange={(e) => setSelectedClass(e.target.value)}
									style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
								>
									<option value="All">All Classes</option>
									<option value="L3">L3</option>
									<option value="L4">L4</option>
									<option value="L5">L5</option>
								</select>

								<select
									value={assessmentType}
									onChange={(e) => setAssessmentType(e.target.value)}
									style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
								>
									<option value="All">All Types</option>
									<option value="exam">Exams</option>
									<option value="test">Tests</option>
									<option value="quiz">Quizzes</option>
									<option value="notes">Notes</option>
								</select>

								<button className="btn btn-primary" onClick={() => setShowAssessmentModal(true)}>
									<Plus size={16} />
									Create Assessment
								</button>
							</div>
						</div>

						<div className="assessments-grid">
							{filteredAssessments.map((assessment) => (
								<div key={assessment.id} className="assessment-card">
									<div className="assessment-header">
										<h3>{assessment.title}</h3>
										<span className={`assessment-type ${assessment.type}`}>
											{assessment.type.toUpperCase()}
										</span>
									</div>
									<div className="assessment-details">
										<p><strong>Class:</strong> {assessment.class}</p>
										<p><strong>Description:</strong> {assessment.description}</p>
										<p><strong>Due Date:</strong> {new Date(assessment.dueDate).toLocaleDateString()}</p>
										<p><strong>Submissions:</strong> {assessment.submissions}</p>
									</div>
									<div className="assessment-actions">
										<button className="btn btn-sm btn-outline" onClick={() => handleViewAssessment(assessment)}>
											<Eye size={14} />
											View
										</button>
										<button className="btn btn-sm btn-outline" onClick={() => handleEditAssessment(assessment)}>
											<Edit size={14} />
											Edit
										</button>
										<button className="btn btn-sm btn-primary" onClick={() => handleSendAssessment(assessment)}>
											<Send size={14} />
											Send to Students
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeTab === 'marks' && (
				<div className="marks-section">
					<div className="section-header">
						<h2>Student Marks Management</h2>
					</div>

					{/* Filters Section */}
					<div className="marks-filters" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Class</label>
								<select
									value={selectedClassForMarks}
									onChange={(e) => setSelectedClassForMarks(e.target.value)}
									style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
								>
									<option value="">Select Class</option>
									<option value="L3">L3</option>
									<option value="L4">L4</option>
									<option value="L5">L5</option>
								</select>
							</div>

							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Subject</label>
								<select
									value={selectedSubject?.id || ''}
									onChange={(e) => {
										const subject = departmentSubjects.find(s => s.id === parseInt(e.target.value));
										setSelectedSubject(subject);
									}}
									style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
									disabled={!selectedClassForMarks}
								>
									<option value="">Select Subject</option>
									{departmentSubjects.map(subject => (
										<option key={subject.id} value={subject.id}>{subject.name}</option>
									))}
								</select>
							</div>

							<div>
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Student</label>
								<select
									value={selectedStudent?.id || ''}
									onChange={(e) => {
										const student = students.find(s => s.id === parseInt(e.target.value));
										setSelectedStudent(student);
									}}
									style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
									disabled={!selectedClassForMarks || students.length === 0}
								>
									<option value="">Select Student</option>
									{students.map(student => (
										<option key={student.id} value={student.id}>{student.name}</option>
									))}
								</select>
							</div>

							<div style={{ display: 'flex', alignItems: 'flex-end' }}>
								<button 
									className="btn btn-primary" 
									onClick={handleAddMark}
									disabled={!selectedClassForMarks || !selectedSubject || students.length === 0}
									style={{ width: '100%' }}
								>
									<Plus size={16} />
									Enter Marks for All Students
								</button>
							</div>
							
							{selectedClassForMarks && students.length === 0 && (
								<div style={{ gridColumn: '1 / -1', padding: '1rem', background: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
									No students found for {selectedClassForMarks}. Please select a different class.
								</div>
							)}
						</div>
					</div>

					{/* Marks Table */}
					<div className="marks-table-container" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
						<table className="data-table">
							<thead>
								<tr>
									<th>Student Name</th>
									<th>Class</th>
									<th>Subject</th>
									<th>Assessment Type</th>
									<th>Mark</th>
									<th>Max Mark</th>
									<th>Percentage</th>
									<th>Grade</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{marks.length === 0 ? (
									<tr>
										<td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
											No marks entered yet. Select a student and subject to add marks.
										</td>
									</tr>
								) : (
									marks.map((mark) => {
										const percentage = ((mark.mark / mark.maxMark) * 100).toFixed(1);
										return (
											<tr key={mark.id}>
												<td style={{ fontWeight: '600' }}>{mark.studentName}</td>
												<td>{mark.class}</td>
												<td>{mark.subjectName}</td>
												<td>
													<span style={{ 
														padding: '0.25rem 0.75rem', 
														borderRadius: '12px', 
														background: mark.assessmentType === 'exam' ? '#dbeafe' : mark.assessmentType === 'test' ? '#fef3c7' : '#fce7f3',
														color: mark.assessmentType === 'exam' ? '#1e40af' : mark.assessmentType === 'test' ? '#92400e' : '#be185d',
														fontSize: '0.875rem',
														fontWeight: '500'
													}}>
														{mark.assessmentType.charAt(0).toUpperCase() + mark.assessmentType.slice(1)}
													</span>
												</td>
												<td style={{ fontWeight: '600', color: '#667eea' }}>{mark.mark}</td>
												<td>{mark.maxMark}</td>
												<td>
													<span style={{ fontWeight: '600', color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
														{percentage}%
													</span>
												</td>
												<td>
													<span className={`status-badge ${mark.grade === 'A' || mark.grade === 'B' ? 'active' : mark.grade === 'C' || mark.grade === 'D' ? 'warning' : 'inactive'}`}>
														{mark.grade}
													</span>
												</td>
												<td>
													<div style={{ display: 'flex', gap: '0.5rem' }}>
														<button className="btn btn-sm btn-outline" onClick={() => handleEditMark(mark)} title="Edit">
															<Edit size={14} />
														</button>
														<button className="btn btn-sm btn-outline" onClick={() => handleDeleteMark(mark.id)} title="Delete" style={{ color: '#ef4444' }}>
															<Trash2 size={14} />
														</button>
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

				{activeTab === 'budget' && (
					<div className="budget-section">
						<div className="section-header">
							<h2>Class Budget Management</h2>
							<button className="btn btn-primary" onClick={() => setShowBudgetModal(true)}>
								<Plus size={16} />
								Create Budget Request
							</button>
						</div>

						<div className="budget-grid">
							{budgets.map((budget) => (
								<div key={budget.id} className="budget-card">
									<div className="budget-header">
										<h3>{budget.title}</h3>
										<span className={`budget-status ${budget.status}`}>
											{budget.status.toUpperCase()}
										</span>
									</div>
									<div className="budget-details">
										<p><strong>Class:</strong> {budget.class}</p>
										<p><strong>Category:</strong> {budget.category}</p>
										<p><strong>Amount:</strong> RWF {budget.amount.toLocaleString()}</p>
										<p><strong>Urgency:</strong> {budget.urgency}</p>
										<p><strong>Description:</strong> {budget.description}</p>
									</div>
									<div className="budget-actions">
										<button className="btn btn-sm btn-outline">
											<Eye size={14} />
											View Details
										</button>
										{budget.approved && (
											<span className="approved-badge">✓ Approved</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Assessment Creation Modal */}
			{showAssessmentModal && (
				<div className="modal-overlay" onClick={() => setShowAssessmentModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
						<div className="modal-header">
							<h2>{editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}</h2>
							<button className="close-btn" onClick={() => setShowAssessmentModal(false)}>
								×
							</button>
						</div>
						<div className="modal-body">
							<form onSubmit={(e) => { e.preventDefault(); handleCreateAssessment(); }}>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
											Assessment Type *
										</label>
										<select
											value={newAssessment.type}
											onChange={(e) => setNewAssessment({ ...newAssessment, type: e.target.value })}
											style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
											required
										>
											<option value="exam">Exam</option>
											<option value="test">Test</option>
											<option value="quiz">Quiz</option>
											<option value="notes">Notes</option>
										</select>
									</div>

									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
											Class *
										</label>
										<select
											value={newAssessment.class}
											onChange={(e) => setNewAssessment({ ...newAssessment, class: e.target.value })}
											style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
											required
										>
											<option value="">Select Class</option>
											<option value="L3">L3</option>
											<option value="L4">L4</option>
											<option value="L5">L5</option>
										</select>
									</div>
								</div>

								<div style={{ marginBottom: '1.5rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Title *
									</label>
									<input
										type="text"
										value={newAssessment.title}
										onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
										placeholder="Assessment title"
										style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
										required
									/>
								</div>

								<div style={{ marginBottom: '1.5rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Description
									</label>
									<textarea
										value={newAssessment.description}
										onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
										placeholder="Assessment description..."
										rows="3"
										style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', resize: 'vertical' }}
									/>
								</div>

								<div style={{ marginBottom: '1.5rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Due Date *
									</label>
									<input
										type="date"
										value={newAssessment.dueDate}
										onChange={(e) => setNewAssessment({ ...newAssessment, dueDate: e.target.value })}
										min={new Date().toISOString().split('T')[0]}
										style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
										required
									/>
								</div>

								<div style={{ marginBottom: '2rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Upload File (Optional)
									</label>
									<input
										type="file"
										onChange={(e) => setNewAssessment({ ...newAssessment, file: e.target.files[0] })}
										accept=".pdf,.doc,.docx,.txt"
										style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
									/>
								</div>

								<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
									<button type="button" className="btn btn-outline" onClick={() => {
										setShowAssessmentModal(false);
										setEditingAssessment(null);
									}}>
										Cancel
									</button>
									<button type="submit" className="btn btn-primary">
										<Upload size={16} />
										{editingAssessment ? 'Update Assessment' : 'Create Assessment'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Budget Creation Modal */}
			{showBudgetModal && (
				<div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
						<div className="modal-header">
							<h2>Create Budget Request</h2>
							<button className="close-btn" onClick={() => setShowBudgetModal(false)}>
								×
							</button>
						</div>
						<div className="modal-body">
							<form onSubmit={(e) => { e.preventDefault(); handleCreateBudget(); }}>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
											Class *
										</label>
										<select
											value={newBudget.class}
											onChange={(e) => setNewBudget({ ...newBudget, class: e.target.value })}
											style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
											required
										>
											<option value="">Select Class</option>
											<option value="L3">L3</option>
											<option value="L4">L4</option>
											<option value="L5">L5</option>
										</select>
									</div>

									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
											Category *
										</label>
										<select
											value={newBudget.category}
											onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
											style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
										>
											<option value="materials">Materials</option>
											<option value="equipment">Equipment</option>
											<option value="books">Books</option>
											<option value="supplies">Supplies</option>
											<option value="other">Other</option>
										</select>
									</div>
								</div>

								<div style={{ marginBottom: '1.5rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Title *
									</label>
									<input
										type="text"
										value={newBudget.title}
										onChange={(e) => setNewBudget({ ...newBudget, title: e.target.value })}
										placeholder="Budget request title"
										style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
										required
									/>
								</div>

								<div style={{ marginBottom: '1.5rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
										Description
									</label>
									<textarea
										value={newBudget.description}
										onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
										placeholder="Detailed description of budget needs..."
										rows="3"
										style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', resize: 'vertical' }}
									/>
								</div>

								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
											Amount (RWF) *
										</label>
										<input
											type="number"
											min="0"
											value={newBudget.amount}
											onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
											placeholder="50000"
											style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
											required
										/>
									</div>

									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
											Urgency
										</label>
										<select
											value={newBudget.urgency}
											onChange={(e) => setNewBudget({ ...newBudget, urgency: e.target.value })}
											style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
										>
											<option value="low">Low</option>
											<option value="medium">Medium</option>
											<option value="high">High</option>
										</select>
									</div>
								</div>

								<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
									<button type="button" className="btn btn-outline" onClick={() => setShowBudgetModal(false)}>
										Cancel
									</button>
									<button type="submit" className="btn btn-primary">
										<DollarSign size={16} />
										Submit Budget Request
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Marks Entry Modal */}
			{showMarksModal && selectedSubject && (
				<div className="modal-overlay" onClick={() => setShowMarksModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
						<div className="modal-header">
							<h2>Enter Marks - {selectedSubject.name}</h2>
							<button className="close-btn" onClick={() => setShowMarksModal(false)}>
								×
							</button>
						</div>
						<div className="modal-body">
							<div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
								<h3 style={{ margin: '0 0 0.5rem 0' }}>Class {selectedClassForMarks} - {selectedSubject.name}</h3>
								<p style={{ margin: 0, opacity: 0.9 }}>
									Total Students: {students.length} | Enter marks for all students below
								</p>
							</div>

							<form onSubmit={(e) => { e.preventDefault(); handleSaveMark(); }}>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Assessment Type *</label>
										<select
											value={markEntry.assessmentType}
											onChange={(e) => setMarkEntry({ ...markEntry, assessmentType: e.target.value })}
											style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb', fontSize: '0.875rem' }}
											required
										>
											<option value="exam">Exam</option>
											<option value="test">Test</option>
											<option value="quiz">Quiz</option>
											<option value="assignment">Assignment</option>
										</select>
									</div>

									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Max Mark *</label>
										<input
											type="number"
											min="1"
											value={markEntry.maxMark}
											onChange={(e) => setMarkEntry({ ...markEntry, maxMark: e.target.value })}
											style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb', fontSize: '0.875rem' }}
											required
										/>
									</div>

									<div>
										<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Comments</label>
										<input
											type="text"
											value={markEntry.comments || ''}
											onChange={(e) => setMarkEntry({ ...markEntry, comments: e.target.value })}
											style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb', fontSize: '0.875rem' }}
											placeholder="Optional..."
										/>
									</div>
								</div>

								<div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
									<table className="data-table" style={{ margin: 0 }}>
										<thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
											<tr>
												<th style={{ width: '50px' }}>#</th>
												<th>Student Name</th>
												<th style={{ width: '120px' }}>Mark</th>
												<th style={{ width: '100px' }}>%</th>
												<th style={{ width: '80px' }}>Grade</th>
											</tr>
										</thead>
										<tbody>
											{students.map((student, index) => {
												const studentMark = markEntry.studentMarks?.[student.id];
												const mark = studentMark?.mark || '';
												const maxMark = markEntry.maxMark || 100;
												const percentage = mark ? ((parseFloat(mark) / parseFloat(maxMark)) * 100).toFixed(1) : '-';
												const grade = mark ? calculateGrade(parseFloat(mark), parseFloat(maxMark)) : '-';

												return (
													<tr key={student.id}>
														<td style={{ textAlign: 'center', fontWeight: '600', color: '#6b7280' }}>{index + 1}</td>
														<td style={{ fontWeight: '600' }}>{student.name}</td>
														<td>
															<input
																type="number"
																min="0"
																max={maxMark}
																step="0.5"
																value={mark}
																onChange={(e) => {
																	const updatedMarks = {
																		...markEntry.studentMarks,
																		[student.id]: {
																			...studentMark,
																			name: student.name,
																			mark: e.target.value,
																			maxMark: maxMark,
																			submitted: true
																		}
																	};
																	setMarkEntry({ ...markEntry, studentMarks: updatedMarks });
																}}
																style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '2px solid #e5e7eb' }}
																placeholder="0"
															/>
														</td>
														<td style={{ textAlign: 'center', fontWeight: '600', color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
															{percentage !== '-' ? `${percentage}%` : '-'}
														</td>
														<td style={{ textAlign: 'center' }}>
															{grade !== '-' ? (
																<span className={`status-badge ${grade === 'A' || grade === 'B' ? 'active' : grade === 'C' || grade === 'D' ? 'warning' : 'inactive'}`}>
																	{grade}
																</span>
															) : '-'}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>

								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
									<div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
										<strong>Tip:</strong> Leave marks empty for absent students
									</div>
									<div style={{ display: 'flex', gap: '1rem' }}>
										<button type="button" className="btn btn-outline" onClick={() => {
											setShowMarksModal(false);
											setMarkEntry({ mark: '', maxMark: 100, assessmentType: 'exam', comments: '' });
											setMarksModalMode('new');
										}}>
											Cancel
										</button>
										<button type="submit" className="btn btn-primary">
											<Calculator size={16} />
											Save All Marks
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			<Chat />
			<Footer />
		</div>
	);
};

export default TeacherDashboard;
