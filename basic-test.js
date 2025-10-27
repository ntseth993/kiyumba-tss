console.log('=== Basic Node.js Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current working directory:', process.cwd());

try {
  console.log('Testing dotenv...');
  // Simple dotenv test without file path
  process.env.TEST_VAR = 'test_value';
  console.log('Environment variable test:', process.env.TEST_VAR);

  console.log('Testing ES modules...');
  console.log('✅ Basic functionality working');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('=== Test Complete ===');
