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
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.name}</td>
              <td>{it.email}</td>
              <td>{it.phone}</td>
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
