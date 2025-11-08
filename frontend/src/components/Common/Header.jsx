import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, removeAuthToken, isAdmin } from '../../utils/auth';

const Header = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <h1 style={styles.title}>Khảo sát gắn bó nhân viên</h1>
        {user && (
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              {user.full_name} {isAdmin() && '(Admin)'}
            </span>
            {isAdmin() && (
              <button
                onClick={() => navigate('/admin')}
                style={styles.adminButton}
              >
                Quản trị
              </button>
            )}
            <button onClick={handleLogout} style={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '15px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '14px',
  },
  adminButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default Header;
