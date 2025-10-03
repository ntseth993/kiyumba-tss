import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { userId, adminOnly } = req.query;
      
      let messages;
      if (adminOnly === 'true') {
        // Get all messages for admin
        messages = await sql`
          SELECT 
            m.id,
            m.content,
            m.sender_id as "senderId",
            m.receiver_id as "receiverId",
            m.created_at as "createdAt",
            m.is_read as "isRead",
            u.name as "senderName",
            u.email as "senderEmail",
            u.avatar as "senderAvatar"
          FROM messages m
          LEFT JOIN users u ON m.sender_id = u.id
          ORDER BY m.created_at DESC
        `;
      } else if (userId) {
        // Get messages for a specific user
        messages = await sql`
          SELECT 
            m.id,
            m.content,
            m.sender_id as "senderId",
            m.receiver_id as "receiverId",
            m.created_at as "createdAt",
            m.is_read as "isRead",
            u.name as "senderName",
            u.email as "senderEmail",
            u.avatar as "senderAvatar"
          FROM messages m
          LEFT JOIN users u ON m.sender_id = u.id
          WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
          ORDER BY m.created_at DESC
        `;
      } else {
        return res.status(400).json({ error: 'User ID or admin flag required' });
      }

      res.status(200).json(messages);
    } else if (req.method === 'POST') {
      // Send a new message
      const { content, senderId, receiverId, senderName, senderEmail } = req.body;

      if (!content || !senderId || !receiverId) {
        return res.status(400).json({ error: 'Content, sender ID, and receiver ID are required' });
      }

      const result = await sql`
        INSERT INTO messages (content, sender_id, receiver_id, sender_name, sender_email)
        VALUES (${content}, ${senderId}, ${receiverId}, ${senderName || null}, ${senderEmail || null})
        RETURNING 
          id,
          content,
          sender_id as "senderId",
          receiver_id as "receiverId",
          created_at as "createdAt"
      `;

      res.status(201).json(result[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
