// Contact service for contact form submissions
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Submit contact form
export const submitContactForm = async (formData) => {
  if (useLocalStorage) {
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const newSubmission = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    const updated = [newSubmission, ...submissions];
    localStorage.setItem('contactSubmissions', JSON.stringify(updated));
    return { success: true, id: newSubmission.id };
  }

  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit contact form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting contact form:', error);
    // Fallback to localStorage if API fails
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const newSubmission = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    const updated = [newSubmission, ...submissions];
    localStorage.setItem('contactSubmissions', JSON.stringify(updated));
    return { success: true, id: newSubmission.id };
  }
};

// Get contact form submissions (admin only)
export const getContactSubmissions = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/contact-submissions`);
    if (!response.ok) {
      throw new Error('Failed to fetch contact submissions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
  }
};
