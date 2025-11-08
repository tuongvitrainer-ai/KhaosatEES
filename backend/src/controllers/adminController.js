const bcrypt = require('bcryptjs');
const { dbGet, dbAll, dbRun } = require('../config/database');
const { syncAllResponsesToSheets } = require('../services/sheetsService');

/**
 * Get all users with statistics
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT u.id, u.employee_id, u.full_name, u.department, u.position, u.email,
              u.is_active, u.has_completed, u.created_at,
              sp.is_completed as survey_completed, sp.completed_at
       FROM users u
       LEFT JOIN survey_progress sp ON u.id = sp.user_id
       WHERE u.is_admin = 0
       ORDER BY u.created_at DESC`
    );

    const stats = await dbGet(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN has_completed = 1 THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN has_completed = 0 THEN 1 ELSE 0 END) as pending
       FROM users
       WHERE is_admin = 0`
    );

    res.json({
      users,
      statistics: {
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create new user
 */
const createUser = async (req, res) => {
  try {
    const { employee_id, password, full_name, department, position, email } = req.body;

    // Check if employee_id already exists
    const existing = await dbGet(
      'SELECT id FROM users WHERE employee_id = ?',
      [employee_id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await dbRun(
      `INSERT INTO users (employee_id, password_hash, full_name, department, position, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, passwordHash, full_name, department, position, email]
    );

    const user = await dbGet(
      'SELECT id, employee_id, full_name, department, position, email, is_active FROM users WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, department, position, email, is_active } = req.body;

    // Check if user exists
    const user = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedUser = await dbGet(
      'SELECT id, employee_id, full_name, department, position, email, is_active FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await dbRun('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Reset user password
 */
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    const user = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await dbRun(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all surveys
 */
const getAllSurveys = async (req, res) => {
  try {
    const surveys = await dbAll(
      `SELECT s.*, u.full_name as created_by_name,
              (SELECT COUNT(*) FROM questions WHERE survey_id = s.id) as question_count
       FROM surveys s
       LEFT JOIN users u ON s.created_by = u.id
       ORDER BY s.created_at DESC`
    );

    res.json({ surveys });
  } catch (error) {
    console.error('Get all surveys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create survey
 */
const createSurvey = async (req, res) => {
  try {
    const { title, description, instructions, likert_scale, start_date, end_date } = req.body;
    const createdBy = req.user.id;

    const result = await dbRun(
      `INSERT INTO surveys (title, description, instructions, likert_scale, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, instructions, likert_scale || 5, start_date, end_date, createdBy]
    );

    const survey = await dbGet('SELECT * FROM surveys WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Survey created successfully',
      survey,
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update survey
 */
const updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, instructions, likert_scale, is_active, start_date, end_date } = req.body;

    const survey = await dbGet('SELECT id FROM surveys WHERE id = ?', [id]);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (instructions !== undefined) {
      updates.push('instructions = ?');
      values.push(instructions);
    }
    if (likert_scale !== undefined) {
      updates.push('likert_scale = ?');
      values.push(likert_scale);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(end_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(`UPDATE surveys SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedSurvey = await dbGet('SELECT * FROM surveys WHERE id = ?', [id]);

    res.json({
      message: 'Survey updated successfully',
      survey: updatedSurvey,
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create question
 */
const createQuestion = async (req, res) => {
  try {
    const { survey_id, category_id, question_text, question_type, is_required, display_order } = req.body;

    const result = await dbRun(
      `INSERT INTO questions (survey_id, category_id, question_text, question_type, is_required, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [survey_id, category_id, question_text, question_type || 'likert', is_required !== false ? 1 : 0, display_order]
    );

    const question = await dbGet('SELECT * FROM questions WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update question
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, is_required, display_order } = req.body;

    const question = await dbGet('SELECT id FROM questions WHERE id = ?', [id]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const updates = [];
    const values = [];

    if (question_text !== undefined) {
      updates.push('question_text = ?');
      values.push(question_text);
    }
    if (is_required !== undefined) {
      updates.push('is_required = ?');
      values.push(is_required ? 1 : 0);
    }
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await dbRun(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedQuestion = await dbGet('SELECT * FROM questions WHERE id = ?', [id]);

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete question
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await dbGet('SELECT id FROM questions WHERE id = ?', [id]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await dbRun('DELETE FROM questions WHERE id = ?', [id]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get survey responses
 */
const getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const responses = await dbAll(
      `SELECT r.*, u.employee_id, u.full_name, u.department,
              q.question_text, c.name as category_name
       FROM responses r
       JOIN users u ON r.user_id = u.id
       JOIN questions q ON r.question_id = q.id
       LEFT JOIN question_categories c ON q.category_id = c.id
       WHERE r.survey_id = ?
       ORDER BY u.employee_id, q.display_order`,
      [surveyId]
    );

    res.json({ responses });
  } catch (error) {
    console.error('Get survey responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get survey summary report
 */
const getSurveySummary = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Total users
    const totalUsers = await dbGet(
      'SELECT COUNT(*) as count FROM users WHERE is_admin = 0'
    );

    // Completed users
    const completedUsers = await dbGet(
      'SELECT COUNT(DISTINCT user_id) as count FROM survey_progress WHERE survey_id = ? AND is_completed = 1',
      [surveyId]
    );

    // Average scores by category
    const categoryScores = await dbAll(
      `SELECT c.name, AVG(r.score) as avg_score, COUNT(*) as response_count
       FROM responses r
       JOIN questions q ON r.question_id = q.id
       JOIN question_categories c ON q.category_id = c.id
       WHERE r.survey_id = ? AND r.score IS NOT NULL
       GROUP BY c.id, c.name
       ORDER BY c.display_order`,
      [surveyId]
    );

    // Question statistics
    const questionStats = await dbAll(
      `SELECT q.question_text, c.name as category_name,
              AVG(r.score) as avg_score,
              MIN(r.score) as min_score,
              MAX(r.score) as max_score,
              COUNT(r.id) as response_count
       FROM questions q
       LEFT JOIN responses r ON q.id = r.question_id AND r.survey_id = ?
       LEFT JOIN question_categories c ON q.category_id = c.id
       WHERE q.survey_id = ?
       GROUP BY q.id
       ORDER BY q.display_order`,
      [surveyId, surveyId]
    );

    res.json({
      total_users: totalUsers.count,
      completed: completedUsers.count,
      pending: totalUsers.count - completedUsers.count,
      completion_rate: totalUsers.count > 0 ? Math.round((completedUsers.count / totalUsers.count) * 100) : 0,
      average_scores_by_category: categoryScores,
      question_statistics: questionStats,
    });
  } catch (error) {
    console.error('Get survey summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Sync responses to Google Sheets
 */
const syncToSheets = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const result = await syncAllResponsesToSheets(surveyId);

    res.json(result);
  } catch (error) {
    console.error('Sync to sheets error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllSurveys,
  createSurvey,
  updateSurvey,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getSurveyResponses,
  getSurveySummary,
  syncToSheets,
};
