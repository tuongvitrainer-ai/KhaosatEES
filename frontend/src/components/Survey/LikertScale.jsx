import React from 'react';
import { LIKERT_5_LABELS, LIKERT_7_LABELS } from '../../utils/constants';

const LikertScale = ({ scale = 5, value, onChange, questionId }) => {
  const labels = scale === 7 ? LIKERT_7_LABELS : LIKERT_5_LABELS;
  const options = Array.from({ length: scale }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      <div style={styles.scaleContainer}>
        {options.map((option) => (
          <div key={option} style={styles.option}>
            <input
              type="radio"
              id={`q${questionId}_${option}`}
              name={`question_${questionId}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              style={styles.radio}
            />
            <label
              htmlFor={`q${questionId}_${option}`}
              style={{
                ...styles.label,
                ...(value === option ? styles.labelSelected : {}),
              }}
            >
              <span style={styles.number}>{option}</span>
              <span style={styles.text}>{labels[option]}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: '20px 0',
  },
  scaleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
  },
  radio: {
    marginRight: '10px',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  label: {
    flex: 1,
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fff',
  },
  labelSelected: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  number: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#3498db',
    minWidth: '24px',
  },
  text: {
    fontSize: '15px',
    color: '#2c3e50',
  },
};

export default LikertScale;
