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
    const userData = req.body;
    const { firstName, lastName, email, password, phone, program, level, previousSchool } = userData;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(TRIM(email)) = ${email.trim().toLowerCase()}
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const fullName = `${firstName} ${lastName}`;
    const avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=4F46E5&color=fff`;

    // Insert user
    const userResult = await sql`
      INSERT INTO users (
        email,
        password,
        name,
        role,
        avatar
      )
      VALUES (
        ${email.trim().toLowerCase()},
        ${password},
        ${fullName},
        'student',
        ${avatar}
      )
      RETURNING id, email, name, role, avatar, created_at as "createdAt"
    `;

    const newUser = userResult[0];

    // Insert application
    await sql`
      INSERT INTO applications (
        full_name,
        email,
        phone,
        program,
        level,
        education_level,
        status
      )
      VALUES (
        ${fullName},
        ${email.trim().toLowerCase()},
        ${phone || null},
        ${program || null},
        ${level || null},
        ${previousSchool || null},
        'approved'
      )
    `;

    res.status(201).json({
      success: true,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
