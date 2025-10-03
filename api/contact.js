import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save contact form submission to database
    const result = await sql`
      INSERT INTO contact_submissions (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject}, ${message})
      RETURNING id, created_at as "createdAt"
    `;

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to sender
    
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      id: result[0].id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
