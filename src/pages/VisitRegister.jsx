import { useState } from 'react';
import { registerVisiting } from '../services/visitingService';
import './VisitRegister.css';

const VisitRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', preferredDate: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerVisiting(form);
      setMessage('Registration received. You will be contacted by the school.');
      setForm({ name: '', email: '', phone: '', preferredDate: '' });
    } catch (err) {
      setMessage('Failed to register. Please try again later.');
    }
  };

  return (
    <div className="visit-register">
      <h1>Parent Visiting Day Registration</h1>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="visit-form">
        <label>Name</label>
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <label>Phone</label>
        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <label>Preferred Visiting Date</label>
        <input type="date" value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} />
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
    </div>
  );
};

export default VisitRegister;
