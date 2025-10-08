import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { teacher_id } = req.query;
      
      if (teacher_id) {
        const assignments = await sql`
          SELECT ts.*, s.name as subject_name, s.code as subject_code,
                 c.name as class_name, c.level as class_level, c.program as class_program
          FROM teacher_subjects ts
          JOIN subjects s ON ts.subject_id = s.id
          JOIN classes c ON ts.class_id = c.id
          WHERE ts.teacher_id = ${teacher_id}
          ORDER BY s.name, c.name
        `;
        return res.status(200).json(assignments);
      }
      
      const all = await sql`SELECT * FROM teacher_subjects`;
      return res.status(200).json(all);
    }

    if (req.method === 'POST') {
      const { teacher_id, subject_id, class_id } = req.body;
      if (!teacher_id || !subject_id || !class_id) {
        return res.status(400).json({ error: 'Teacher, subject, and class are required' });
      }
      const result = await sql`
        INSERT INTO teacher_subjects (teacher_id, subject_id, class_id)
        VALUES (${teacher_id}, ${subject_id}, ${class_id})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM teacher_subjects WHERE id = ${id}`;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Teacher Subjects API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
