import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyAPI, responseAPI } from '../../services/api';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import Loading from '../Common/Loading';
import ProgressBar from './ProgressBar';
import LikertScale from './LikertScale';

const SurveyQuestion = () => {
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSurvey();
  }, []);

  const loadSurvey = async () => {
    try {
      const [surveyRes, progressRes] = await Promise.all([
        surveyAPI.getActiveSurvey(),
        surveyAPI.getSurveyProgress(1), // Assuming survey ID 1
      ]);

      setSurvey(surveyRes.data.survey);
      setQuestions(surveyRes.data.questions);

      // Load existing responses
      const existingResponses = {};
      progressRes.data.answered_questions.forEach((resp) => {
        existingResponses[resp.question_id] = resp.score;
      });
      setResponses(existingResponses);

      // Find last unanswered question
      const lastAnsweredIndex = surveyRes.data.questions.findIndex(
        (q) => !existingResponses[q.id]
      );
      if (lastAnsweredIndex !== -1) {
        setCurrentQuestionIndex(lastAnsweredIndex);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load survey error:', err);
      setError('Không thể tải khảo sát. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleResponse = async (score) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Update local state
    setResponses({
      ...responses,
      [currentQuestion.id]: score,
    });

    // Save to backend
    setSaving(true);
    try {
      await responseAPI.submitResponse({
        survey_id: survey.id,
        question_id: currentQuestion.id,
        score: score,
      });

      // Auto-advance to next question after a short delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
        setSaving(false);
      }, 300);
    } catch (err) {
      console.error('Save response error:', err);
      setSaving(false);
      alert('Lỗi khi lưu câu trả lời. Vui lòng thử lại.');
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.is_required && !responses[currentQuestion.id]) {
      alert('Vui lòng trả lời câu hỏi này trước khi tiếp tục');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all required questions are answered
    const unansweredRequired = questions.filter(
      (q) => q.is_required && !responses[q.id]
    );

    if (unansweredRequired.length > 0) {
      alert(
        `Bạn còn ${unansweredRequired.length} câu hỏi bắt buộc chưa trả lời. Vui lòng hoàn thành tất cả các câu hỏi.`
      );
      return;
    }

    if (
      !window.confirm(
        'Bạn có chắc chắn muốn nộp bài khảo sát? Sau khi nộp bạn sẽ không thể thay đổi câu trả lời.'
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await responseAPI.completeSurvey(survey.id);
      navigate('/complete');
    } catch (err) {
      console.error('Complete survey error:', err);
      alert('Lỗi khi nộp khảo sát. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Loading message="Đang tải khảo sát..." />
        <Footer />
      </>
    );
  }

  if (error || !survey || questions.length === 0) {
    return (
      <>
        <Header />
        <div style={styles.container}>
          <div style={styles.error}>{error || 'Không có khảo sát nào.'}</div>
        </div>
        <Footer />
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(responses).length;

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.surveyBox}>
          <h2 style={styles.surveyTitle}>{survey.title}</h2>
          {survey.instructions && (
            <p style={styles.instructions}>{survey.instructions}</p>
          )}

          <ProgressBar current={answeredCount} total={questions.length} />

          <div style={styles.questionContainer}>
            <div style={styles.questionHeader}>
              <span style={styles.questionNumber}>
                Câu {currentQuestionIndex + 1}/{questions.length}
              </span>
              {currentQuestion.category_name && (
                <span style={styles.category}>
                  {currentQuestion.category_name}
                </span>
              )}
            </div>

            <h3 style={styles.questionText}>{currentQuestion.question_text}</h3>

            {currentQuestion.is_required && (
              <span style={styles.required}>* Bắt buộc</span>
            )}

            <LikertScale
              scale={survey.likert_scale}
              value={responses[currentQuestion.id]}
              onChange={handleResponse}
              questionId={currentQuestion.id}
            />
          </div>

          <div style={styles.navigation}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || saving}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                ...(currentQuestionIndex === 0 || saving
                  ? styles.buttonDisabled
                  : {}),
              }}
            >
              ← Câu trước
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(saving ? styles.buttonDisabled : {}),
                }}
              >
                {saving ? 'Đang nộp...' : 'Nộp bài khảo sát'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={saving}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(saving ? styles.buttonDisabled : {}),
                }}
              >
                {saving ? 'Đang lưu...' : 'Câu tiếp theo →'}
              </button>
            )}
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
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
  },
  surveyBox: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  surveyTitle: {
    fontSize: '28px',
    color: '#2c3e50',
    marginBottom: '15px',
    textAlign: 'center',
  },
  instructions: {
    fontSize: '15px',
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  questionContainer: {
    marginTop: '30px',
    padding: '25px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  questionNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3498db',
  },
  category: {
    fontSize: '13px',
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  questionText: {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  required: {
    fontSize: '13px',
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
    gap: '15px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  buttonPrimary: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#95a5a6',
    color: 'white',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  error: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '16px',
  },
};

export default SurveyQuestion;
