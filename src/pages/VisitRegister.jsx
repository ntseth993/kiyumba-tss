import { useState } from 'react';
import { registerVisiting } from '../services/visitingService';
import './VisitRegister.css';

const VisitRegister = () => {
  const [form, setForm] = useState({
    parentName: '',
    parentId: '',
    phone: '',
    studentName: '',
    studentClass: '',
    studentLocation: '',
    reason: '',
    preferredDate: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerVisiting(form);
      setMessage('Registration received. You will be contacted by the school.');
      setForm({
        parentName: '',
        parentId: '',
        phone: '',
        studentName: '',
        studentClass: '',
        studentLocation: '',
        reason: '',
        preferredDate: ''
      });
    } catch (err) {
      setMessage('Failed to register. Please try again later.');
    }
  };

  return (
    <div className="visit-register">
      <h1>Parent Visiting Day Registration</h1>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="visit-form">
        <label>Parent Name</label>
        <input value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} required />
        <label>Parent ID</label>
        <input value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})} required />
        <label>Telephone Number</label>
        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        <label>Student Name</label>
        <input value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} required />
        <label>Student Class</label>
        <input value={form.studentClass} onChange={e => setForm({...form, studentClass: e.target.value})} required />
        <label>Student Location</label>
        <input value={form.studentLocation} onChange={e => setForm({...form, studentLocation: e.target.value})} required />
        <label>Reason for Visit</label>
        <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required />
        <label>Preferred Visiting Date</label>
        <input type="date" value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} required />
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
    </div>
  );
};

export default VisitRegister;
