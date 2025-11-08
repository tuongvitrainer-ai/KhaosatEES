const { dbGet, dbAll, dbRun } = require('../config/database');

/**
 * Get active survey with questions
 */
const getActiveSurvey = async (req, res) => {
  try {
    // Get active survey
    const survey = await dbGet(
      `SELECT id, title, description, instructions, likert_scale, start_date, end_date
       FROM surveys
       WHERE is_active = 1
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (!survey) {
      return res.status(404).json({ error: 'No active survey found' });
    }

    // Get categories
    const categories = await dbAll(
      `SELECT id, name, description, display_order
       FROM question_categories
       WHERE survey_id = ?
       ORDER BY display_order`,
      [survey.id]
    );

    // Get questions
    const questions = await dbAll(
      `SELECT q.id, q.question_text, q.question_type, q.is_required, q.display_order,
              q.category_id, c.name as category_name
       FROM questions q
       LEFT JOIN question_categories c ON q.category_id = c.id
       WHERE q.survey_id = ?
       ORDER BY q.display_order`,
      [survey.id]
    );

    res.json({
      survey,
      categories,
      questions,
    });
  } catch (error) {
    console.error('Get active survey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get survey progress for current user
 */
const getSurveyProgress = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.id;

    // Get or create progress record
    let progress = await dbGet(
      `SELECT * FROM survey_progress
       WHERE user_id = ? AND survey_id = ?`,
      [userId, surveyId]
    );

    if (!progress) {
      // Create new progress record
      const result = await dbRun(
        `INSERT INTO survey_progress (user_id, survey_id)
         VALUES (?, ?)`,
        [userId, surveyId]
      );

      progress = await dbGet(
        'SELECT * FROM survey_progress WHERE id = ?',
        [result.lastID]
      );
    }

    // Get answered questions
    const answeredQuestions = await dbAll(
      `SELECT question_id, score, text_response, submitted_at
       FROM responses
       WHERE user_id = ? AND survey_id = ?`,
      [userId, surveyId]
    );

    // Get total questions count
    const totalQuestions = await dbGet(
      'SELECT COUNT(*) as count FROM questions WHERE survey_id = ?',
      [surveyId]
    );

    res.json({
      progress,
      answered_questions: answeredQuestions,
      total_questions: totalQuestions.count,
      answered_count: answeredQuestions.length,
      completion_percentage: Math.round((answeredQuestions.length / totalQuestions.count) * 100),
    });
  } catch (error) {
    console.error('Get survey progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getActiveSurvey,
  getSurveyProgress,
};
