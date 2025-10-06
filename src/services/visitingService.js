// Visiting day service: try server API first, fall back to localStorage
export const registerVisiting = async (visitor) => {
  const payload = {
    ...visitor,
    email: (visitor.email || '').toString().trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  // Try server API
  if (typeof window !== 'undefined') {
    try {
      const resp = await fetch('/api/visitings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
      console.debug('Server visiting POST responded', resp.status);
    } catch (err) {
      console.debug('Server visiting POST failed', err.message);
    }
  }

  // localStorage fallback
  const items = JSON.parse(localStorage.getItem('visitings') || '[]');
  const newItem = { id: Date.now() + Math.random(), ...payload };
  items.unshift(newItem);
  localStorage.setItem('visitings', JSON.stringify(items));
  return { success: true, visiting: newItem };
};

export const getVisitings = async () => {
  // Try API
  if (typeof window !== 'undefined') {
    try {
      const resp = await fetch('/api/visitings');
      if (resp.ok) return resp.json();
      console.debug('Server visitings GET responded', resp.status);
    } catch (err) {
      console.debug('Server visitings GET failed', err.message);
    }
  }

  // fallback
  return JSON.parse(localStorage.getItem('visitings') || '[]');
};

export const updateVisiting = async (id, updates) => {
  if (typeof window !== 'undefined') {
    try {
      const resp = await fetch(`/api/visitings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (resp.ok) return resp.json();
      console.debug('Server visiting PUT responded', resp.status);
    } catch (err) {
      console.debug('Server visiting PUT failed', err.message);
    }
  }

  const items = JSON.parse(localStorage.getItem('visitings') || '[]');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Not found');
  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem('visitings', JSON.stringify(items));
  return items[idx];
};

export const deleteVisiting = async (id) => {
  if (typeof window !== 'undefined') {
    try {
      const resp = await fetch(`/api/visitings/${id}`, { method: 'DELETE' });
      if (resp.ok) return resp.json();
      console.debug('Server visiting DELETE responded', resp.status);
    } catch (err) {
      console.debug('Server visiting DELETE failed', err.message);
    }
  }

  const items = JSON.parse(localStorage.getItem('visitings') || '[]');
  const filtered = items.filter(i => i.id !== id);
  localStorage.setItem('visitings', JSON.stringify(filtered));
  return { success: true };
};
