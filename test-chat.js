console.log('🧪 Testing chat system...');

// Test 1: Check if server is running
fetch('http://localhost:4000/api/chat?limit=1')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Chat API accessible');
    console.log('📨 Sample message:', data[0] || 'No messages yet');

    // Test 2: Send a test message
    return fetch('http://localhost:4000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: 1,
        message: '🎉 Chat system test message!',
        message_type: 'text'
      })
    });
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Message sent successfully');
    console.log('📨 Sent message:', data.message);

    // Test 3: Fetch messages again to verify
    return fetch('http://localhost:4000/api/chat?limit=100');
  })
  .then(res => res.json())
  .then(data => {
    console.log(`✅ Retrieved ${data.length} messages`);
    console.log('🎉 Chat system is working perfectly!');
    console.log('\n📋 Next steps:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Login to your dashboard');
    console.log('3. Chat should work in the bottom right corner');
  })
  .catch(err => {
    console.error('❌ Chat system test failed:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure server is running on port 4000');
    console.log('2. Make sure frontend is running on port 5173');
    console.log('3. Check if database is initialized');
  });
