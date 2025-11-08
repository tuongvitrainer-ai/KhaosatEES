import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setAuthToken, setUser, isAuthenticated, isAdmin } from '../../utils/auth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    employee_id: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated()) {
      navigate(isAdmin() ? '/admin' : '/survey');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      // Save token and user info
      setAuthToken(token);
      setUser(user);

      // Redirect based on role
      if (user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/survey');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>Khảo sát gắn bó nhân viên</h1>
          <p style={styles.subtitle}>Đăng nhập để bắt đầu khảo sát</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label htmlFor="employee_id" style={styles.label}>
              Mã nhân viên
            </label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              value={credentials.employee_id}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Nhập mã nhân viên"
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={styles.info}>
          <p style={styles.infoText}>
            Lưu ý: Thông tin khảo sát của bạn được bảo mật tuyệt đối
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    margin: '0 0 10px 0',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#34495e',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '14px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  info: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #ecf0f1',
  },
  infoText: {
    fontSize: '13px',
    color: '#7f8c8d',
    textAlign: 'center',
    margin: 0,
  },
};

export default Login;
