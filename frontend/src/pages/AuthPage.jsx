import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {isLogin ? (
        <>
          <Login onLoginSuccess={onLoginSuccess} />
          <p className="auth-switch">
            Don't have an account?{' '}
            <button onClick={() => setIsLogin(false)}>Register</button>
          </p>
        </>
      ) : (
        <>
          <Register
            onRegisterSuccess={() => {
              alert('Registration successful! Please login.');
              setIsLogin(true);
            }}
          />
          <p className="auth-switch">
            Already have an account?{' '}
            <button onClick={() => setIsLogin(true)}>Login</button>
          </p>
        </>
      )}
    </div>
  );
}
