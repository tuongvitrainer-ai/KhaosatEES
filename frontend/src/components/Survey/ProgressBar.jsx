import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <span style={styles.text}>
          Tiến độ: {current}/{total} câu hỏi
        </span>
        <span style={styles.percentage}>{percentage}%</span>
      </div>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '25px',
  },
  info: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  text: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '500',
  },
  percentage: {
    fontSize: '14px',
    color: '#3498db',
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    transition: 'width 0.3s ease',
  },
};

export default ProgressBar;
