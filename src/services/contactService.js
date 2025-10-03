// Contact service for contact form submissions
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Submit contact form
export const submitContactForm = async (formData) => {
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
    throw error;
  }
};

// Get contact form submissions (admin only)
export const getContactSubmissions = async () => {
  try {
    const response = await fetch(`${API_BASE}/contact-submissions`);
    if (!response.ok) {
      throw new Error('Failed to fetch contact submissions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }
};
