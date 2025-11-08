import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          © 2024 Khảo sát mức độ gắn bó nhân viên. Thông tin được bảo mật.
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    padding: '20px 0',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center',
  },
  text: {
    margin: 0,
    fontSize: '14px',
  },
};

export default Footer;
