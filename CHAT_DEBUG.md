# Chat Debug Instructions

## To Check if Messages are Stored:

Open your browser console (F12) and run:

```javascript
// Check all messages in storage
console.log('Messages:', JSON.parse(localStorage.getItem('schoolCommunityMessages') || '[]'));

// Count messages
console.log('Total messages:', JSON.parse(localStorage.getItem('schoolCommunityMessages') || '[]').length);

// Clear all messages (if needed)
localStorage.removeItem('schoolCommunityMessages');
console.log('Messages cleared!');
```

## To Send a Test Message from Console:

```javascript
// Send a test message as Admin
const messages = JSON.parse(localStorage.getItem('schoolCommunityMessages') || '[]');
messages.push({
  id: Date.now(),
  sender_id: 1,
  sender_name: 'Admin User',
  sender_role: 'admin',
  sender_avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff',
  message: 'Test message from Admin',
  message_type: 'text',
  created_at: new Date().toISOString(),
  reactions: [],
  is_read: false
});
localStorage.setItem('schoolCommunityMessages', JSON.stringify(messages));
console.log('Test message sent!');

// Refresh the page to see it
location.reload();
```

## Troubleshooting:

1. **Can't see messages?**
   - Open console (F12)
   - Check for errors
   - Run: `localStorage.getItem('schoolCommunityMessages')`
   - If null, no messages exist yet

2. **Messages not updating?**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Clear cache and reload

3. **Want to start fresh?**
   - Run: `localStorage.clear()`
   - Reload page

## Expected Behavior:

- Admin sends message → Stored in `schoolCommunityMessages`
- Teacher opens chat → Sees admin's message
- Teacher replies → Admin sees teacher's reply
- All users share the same chat room
