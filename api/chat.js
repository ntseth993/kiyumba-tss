import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { limit = 100, user_id } = req.query;
      
      const messages = await sql`
        SELECT c.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
        FROM chat_messages c
        JOIN users u ON c.sender_id = u.id
        WHERE c.deleted_at IS NULL
        ORDER BY c.created_at DESC
        LIMIT ${parseInt(limit)}
      `;

      if (user_id) {
        await sql`
          UPDATE chat_messages
          SET is_read = true, read_at = NOW()
          WHERE sender_id != ${parseInt(user_id)} AND is_read = false
        `;
      }

      return res.status(200).json(messages.reverse());
    }

    if (req.method === 'POST') {
      const { sender_id, message, message_type = 'text', file_url, file_name, file_type, file_size, reply_to_id } = req.body;

      if (!sender_id) {
        return res.status(400).json({ error: 'Sender ID is required' });
      }

      const result = await sql`
        INSERT INTO chat_messages (sender_id, message, message_type, file_url, file_name, file_type, file_size, reply_to_id, is_read)
        VALUES (${sender_id}, ${message || null}, ${message_type}, ${file_url || null}, ${file_name || null}, ${file_type || null}, ${file_size || null}, ${reply_to_id || null}, false)
        RETURNING *
      `;

      const messageWithSender = await sql`
        SELECT c.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
        FROM chat_messages c
        JOIN users u ON c.sender_id = u.id
        WHERE c.id = ${result[0].id}
      `;

      return res.status(201).json(messageWithSender[0]);
    }

    if (req.method === 'DELETE') {
      const { id, user_id } = req.query;
      
      await sql`
        UPDATE chat_messages
        SET deleted_at = NOW(), deleted_by = ${parseInt(user_id)}
        WHERE id = ${parseInt(id)}
      `;
      
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
