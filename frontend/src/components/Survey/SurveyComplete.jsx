import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import { removeAuthToken } from '../../utils/auth';

const SurveyComplete = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.completeBox}>
          <div style={styles.checkmark}>✓</div>
          <h1 style={styles.title}>Cảm ơn bạn đã hoàn thành khảo sát!</h1>
          <p style={styles.message}>
            Câu trả lời của bạn đã được ghi nhận và sẽ được bảo mật tuyệt đối.
          </p>
          <p style={styles.message}>
            Ý kiến của bạn rất quan trọng và sẽ giúp chúng tôi cải thiện môi
            trường làm việc.
          </p>
          <div style={styles.actions}>
            <button onClick={handleLogout} style={styles.button}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
  },
  completeBox: {
    maxWidth: '600px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '60px 40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  checkmark: {
    fontSize: '80px',
    color: '#27ae60',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    color: '#2c3e50',
    marginBottom: '20px',
    fontWeight: '600',
  },
  message: {
    fontSize: '16px',
    color: '#7f8c8d',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  actions: {
    marginTop: '40px',
  },
  button: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default SurveyComplete;
