import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginDebug = () => {
  const { login } = useAuth();
  const [testResult, setTestResult] = useState('');

  const testLogin = async (email, password) => {
    try {
      const result = await login(email, password);
      setTestResult(`Login test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.error || 'No error'}`);
    } catch (error) {
      setTestResult(`Login test: ERROR - ${error.message}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>Login Debug</h4>
      <button onClick={() => testLogin('staff@kiyumba.com', 'staff123')}>
        Test Staff Login
      </button>
      <button onClick={() => testLogin('admin@kiyumba.com', 'admin123')}>
        Test Admin Login
      </button>
      <div>{testResult}</div>
    </div>
  );
};

export default LoginDebug;
