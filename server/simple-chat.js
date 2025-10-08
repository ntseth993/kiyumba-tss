const fs = require('fs');
const path = require('path');

const CHAT_FILE = path.join(__dirname, 'chat-data.json');

// File-based chat storage functions
function readChatData() {
  try {
    if (!fs.existsSync(CHAT_FILE)) {
      fs.writeFileSync(CHAT_FILE, JSON.stringify({
        messages: [],
        users: [],
        lastUpdated: new Date().toISOString()
      }));
    }
    return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading chat data:', error);
    return { messages: [], users: [] };
  }
}

function writeChatData(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CHAT_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing chat data:', error);
  }
}

// Try to use database if available, otherwise use file system
async function getChatMessages(req, res) {
  try {
    // Try database first
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);

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
          await sql`UPDATE chat_messages SET is_read = true, read_at = NOW() WHERE sender_id != ${parseInt(user_id)} AND is_read = false`;
        }

        return res.json(messages.reverse());
      } catch (dbError) {
        console.log('Database error, using file system:', dbError.message);
      }
    }

    // Fallback to file system
    const data = readChatData();
    const { limit = 100 } = req.query;

    // Return last N messages
    const messages = data.messages.slice(-parseInt(limit)).reverse();
    res.json(messages);

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function sendChatMessage(req, res) {
  try {
    const { sender_id, message, message_type = 'text', file_url, file_name } = req.body;

    if (!sender_id || !message) {
      return res.status(400).json({ error: 'Sender ID and message are required' });
    }

    // Try database first
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);

        const result = await sql`
          INSERT INTO chat_messages (sender_id, message, message_type, file_url, file_name, is_read)
          VALUES (${sender_id}, ${message}, ${message_type}, ${file_url || null}, ${file_name || null}, false)
          RETURNING *
        `;

        const messageWithSender = await sql`
          SELECT c.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
          FROM chat_messages c
          JOIN users u ON c.sender_id = u.id
          WHERE c.id = ${result[0].id}
        `;

        return res.status(201).json(messageWithSender[0]);
      } catch (dbError) {
        console.log('Database error, using file system:', dbError.message);
      }
    }

    // Fallback to file system
    const data = readChatData();

    const newMessage = {
      id: Date.now().toString(),
      sender_id: parseInt(sender_id),
      message,
      message_type,
      file_url: file_url || null,
      file_name: file_name || null,
      created_at: new Date().toISOString(),
      is_read: false,
      sender_name: `User ${sender_id}`,
      sender_avatar: null,
      sender_role: 'student'
    };

    data.messages.push(newMessage);
    writeChatData(data);

    res.status(201).json(newMessage);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function deleteChatMessage(req, res) {
  try {
    const { id, user_id } = req.query;

    // Try database first
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);

        await sql`UPDATE chat_messages SET deleted_at = NOW(), deleted_by = ${parseInt(user_id)} WHERE id = ${parseInt(id)}`;
        return res.status(204).end();
      } catch (dbError) {
        console.log('Database error, using file system:', dbError.message);
      }
    }

    // Fallback to file system
    const data = readChatData();
    data.messages = data.messages.filter(msg => msg.id !== id || msg.sender_id !== parseInt(user_id));
    writeChatData(data);

    res.status(204).end();

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

module.exports = {
  getChatMessages,
  sendChatMessage,
  deleteChatMessage
};
