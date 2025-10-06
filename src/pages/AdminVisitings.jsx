import { useEffect, useState } from 'react';
import { getVisitings, updateVisiting, deleteVisiting } from '../services/visitingService';
import './AdminVisitings.css';

const AdminVisitings = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await getVisitings();
    setItems(Array.isArray(res) ? res : (res.visitings || []));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await updateVisiting(id, { status: 'approved' });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this registration?')) return;
    await deleteVisiting(id);
    load();
  };

  return (
    <div className="admin-visitings">
      <h1>Visiting Registrations</h1>
      <table>
        <thead>
          <tr>
            <th>Parent Name</th>
            <th>Parent ID</th>
            <th>Telephone</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Location</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.parentName}</td>
              <td>{it.parentId}</td>
              <td>{it.phone}</td>
              <td>{it.studentName}</td>
              <td>{it.studentClass}</td>
              <td>{it.studentLocation}</td>
              <td>{it.reason}</td>
              <td>{it.preferredDate || '-'}</td>
              <td>{it.status}</td>
              <td>
                {it.status !== 'approved' && <button onClick={() => approve(it.id)}>Approve</button>}
                <button onClick={() => remove(it.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminVisitings;
