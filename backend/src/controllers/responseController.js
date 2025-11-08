const { dbGet, dbAll, dbRun } = require('../config/database');
const { syncResponseToSheets } = require('../services/sheetsService');

/**
 * Submit a response to a question
 */
const submitResponse = async (req, res) => {
  try {
    const { survey_id, question_id, score, text_response } = req.body;
    const userId = req.user.id;

    // Validate question belongs to survey
    const question = await dbGet(
      'SELECT * FROM questions WHERE id = ? AND survey_id = ?',
      [question_id, survey_id]
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found in this survey' });
    }

    // Validate score for likert questions
    if (question.question_type === 'likert' && !score) {
      return res.status(400).json({ error: 'Score is required for likert questions' });
    }

    // Check if response already exists
    const existingResponse = await dbGet(
      'SELECT id FROM responses WHERE user_id = ? AND question_id = ? AND survey_id = ?',
      [userId, question_id, survey_id]
    );

    if (existingResponse) {
      // Update existing response
      await dbRun(
        `UPDATE responses
         SET score = ?, text_response = ?, submitted_at = CURRENT_TIMESTAMP, is_synced_to_sheets = 0
         WHERE id = ?`,
        [score, text_response, existingResponse.id]
      );
    } else {
      // Insert new response
      await dbRun(
        `INSERT INTO responses (user_id, question_id, survey_id, score, text_response)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, question_id, survey_id, score, text_response]
      );
    }

    // Update survey progress
    await dbRun(
      `INSERT INTO survey_progress (user_id, survey_id, last_question_id, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, survey_id)
       DO UPDATE SET last_question_id = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, survey_id, question_id, question_id]
    );

    // Get updated progress
    const totalQuestions = await dbGet(
      'SELECT COUNT(*) as count FROM questions WHERE survey_id = ?',
      [survey_id]
    );

    const answeredCount = await dbGet(
      'SELECT COUNT(*) as count FROM responses WHERE user_id = ? AND survey_id = ?',
      [userId, survey_id]
    );

    // Try to sync to Google Sheets (non-blocking)
    syncResponseToSheets(userId, question_id, survey_id).catch((err) => {
      console.error('Background sync error:', err);
    });

    res.json({
      message: 'Response saved successfully',
      progress: {
        total: totalQuestions.count,
        answered: answeredCount.count,
        percentage: Math.round((answeredCount.count / totalQuestions.count) * 100),
      },
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Complete survey
 */
const completeSurvey = async (req, res) => {
  try {
    const { survey_id } = req.body;
    const userId = req.user.id;

    // Check if all required questions are answered
    const requiredQuestions = await dbAll(
      'SELECT id FROM questions WHERE survey_id = ? AND is_required = 1',
      [survey_id]
    );

    const answeredQuestions = await dbAll(
      'SELECT question_id FROM responses WHERE user_id = ? AND survey_id = ?',
      [userId, survey_id]
    );

    const answeredIds = answeredQuestions.map((r) => r.question_id);
    const unansweredRequired = requiredQuestions.filter((q) => !answeredIds.includes(q.id));

    if (unansweredRequired.length > 0) {
      return res.status(400).json({
        error: 'Please answer all required questions before completing',
        unanswered_count: unansweredRequired.length,
      });
    }

    // Mark survey as completed
    await dbRun(
      `UPDATE survey_progress
       SET is_completed = 1, completed_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND survey_id = ?`,
      [userId, survey_id]
    );

    // Update user's completion status
    await dbRun(
      'UPDATE users SET has_completed = 1 WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Survey completed successfully',
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Complete survey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user's responses for a survey
 */
const getUserResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.id;

    const responses = await dbAll(
      `SELECT r.*, q.question_text, q.question_type, c.name as category_name
       FROM responses r
       JOIN questions q ON r.question_id = q.id
       LEFT JOIN question_categories c ON q.category_id = c.id
       WHERE r.user_id = ? AND r.survey_id = ?
       ORDER BY q.display_order`,
      [userId, surveyId]
    );

    res.json({ responses });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitResponse,
  completeSurvey,
  getUserResponses,
};
