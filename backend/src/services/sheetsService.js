const { getSheets, isSheetsEnabled, getSpreadsheetId } = require('../config/googleSheets');
const { dbGet, dbAll, dbRun } = require('../config/database');

/**
 * Sync a single response to Google Sheets
 */
async function syncResponseToSheets(userId, questionId, surveyId) {
  if (!isSheetsEnabled()) {
    console.log('Google Sheets sync is disabled');
    return;
  }

  try {
    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Get response data
    const response = await dbGet(
      `SELECT r.*, u.employee_id, u.full_name, u.department,
              q.question_text, c.name as category_name
       FROM responses r
       JOIN users u ON r.user_id = u.id
       JOIN questions q ON r.question_id = q.id
       LEFT JOIN question_categories c ON q.category_id = c.id
       WHERE r.user_id = ? AND r.question_id = ? AND r.survey_id = ?`,
      [userId, questionId, surveyId]
    );

    if (!response) {
      return;
    }

    // Prepare row data
    const rowData = [
      new Date(response.submitted_at).toLocaleString('vi-VN'),
      response.employee_id,
      response.full_name,
      response.department || '',
      response.question_id,
      response.question_text,
      response.category_name || '',
      response.score || '',
      response.text_response || '',
    ];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Raw Responses!A:I',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData],
      },
    });

    // Mark as synced
    await dbRun(
      'UPDATE responses SET is_synced_to_sheets = 1 WHERE user_id = ? AND question_id = ? AND survey_id = ?',
      [userId, questionId, surveyId]
    );

    console.log(`✓ Synced response for user ${response.employee_id}, question ${questionId}`);
  } catch (error) {
    console.error('Error syncing response to sheets:', error.message);
    throw error;
  }
}

/**
 * Sync all unsynced responses to Google Sheets
 */
async function syncAllResponsesToSheets(surveyId) {
  if (!isSheetsEnabled()) {
    return {
      status: 'disabled',
      message: 'Google Sheets sync is not configured',
    };
  }

  try {
    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Get all unsynced responses
    const responses = await dbAll(
      `SELECT r.*, u.employee_id, u.full_name, u.department,
              q.question_text, c.name as category_name
       FROM responses r
       JOIN users u ON r.user_id = u.id
       JOIN questions q ON r.question_id = q.id
       LEFT JOIN question_categories c ON q.category_id = c.id
       WHERE r.survey_id = ? AND r.is_synced_to_sheets = 0
       ORDER BY r.submitted_at`,
      [surveyId]
    );

    if (responses.length === 0) {
      return {
        status: 'success',
        message: 'No new responses to sync',
        synced_count: 0,
      };
    }

    // Prepare batch data for Raw Responses sheet
    const rowsData = responses.map((r) => [
      new Date(r.submitted_at).toLocaleString('vi-VN'),
      r.employee_id,
      r.full_name,
      r.department || '',
      r.question_id,
      r.question_text,
      r.category_name || '',
      r.score || '',
      r.text_response || '',
    ]);

    // Append to Raw Responses sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Raw Responses!A:I',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rowsData,
      },
    });

    // Mark all as synced
    const responseIds = responses.map((r) => r.id);
    await dbRun(
      `UPDATE responses SET is_synced_to_sheets = 1 WHERE id IN (${responseIds.join(',')})`,
      []
    );

    // Update summary sheet
    await updateSummarySheet(surveyId);

    // Log sync
    await dbRun(
      `INSERT INTO sync_log (sync_type, records_synced, status)
       VALUES ('manual', ?, 'success')`,
      [responses.length]
    );

    console.log(`✓ Synced ${responses.length} responses to Google Sheets`);

    return {
      status: 'success',
      message: `Successfully synced ${responses.length} responses`,
      synced_count: responses.length,
    };
  } catch (error) {
    console.error('Error syncing to sheets:', error.message);

    // Log error
    await dbRun(
      `INSERT INTO sync_log (sync_type, records_synced, status, error_message)
       VALUES ('manual', 0, 'failed', ?)`,
      [error.message]
    );

    throw error;
  }
}

/**
 * Update summary sheet with aggregated data
 */
async function updateSummarySheet(surveyId) {
  if (!isSheetsEnabled()) {
    return;
  }

  try {
    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Get summary data
    const summaryData = await dbAll(
      `SELECT u.employee_id, u.full_name, u.department,
              COUNT(DISTINCT q.id) as total_questions,
              COUNT(r.id) as answered,
              ROUND((COUNT(r.id) * 100.0 / COUNT(DISTINCT q.id)), 2) as completion_percentage,
              ROUND(AVG(r.score), 2) as average_score,
              sp.completed_at
       FROM users u
       CROSS JOIN questions q
       LEFT JOIN responses r ON u.id = r.user_id AND q.id = r.question_id AND r.survey_id = ?
       LEFT JOIN survey_progress sp ON u.id = sp.user_id AND sp.survey_id = ?
       WHERE q.survey_id = ? AND u.is_admin = 0
       GROUP BY u.id
       ORDER BY u.employee_id`,
      [surveyId, surveyId, surveyId]
    );

    // Prepare summary rows
    const summaryRows = [
      ['Employee ID', 'Full Name', 'Department', 'Total Questions', 'Answered', 'Completion %', 'Average Score', 'Completed At'],
      ...summaryData.map((s) => [
        s.employee_id,
        s.full_name,
        s.department || '',
        s.total_questions,
        s.answered,
        s.completion_percentage,
        s.average_score || '',
        s.completed_at ? new Date(s.completed_at).toLocaleString('vi-VN') : '',
      ]),
    ];

    // Clear and update Summary sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Summary!A:H',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Summary!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: summaryRows,
      },
    });

    console.log('✓ Updated summary sheet');
  } catch (error) {
    console.error('Error updating summary sheet:', error.message);
  }
}

/**
 * Update statistics sheet
 */
async function updateStatisticsSheet(surveyId) {
  if (!isSheetsEnabled()) {
    return;
  }

  try {
    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Get statistics data
    const stats = await dbAll(
      `SELECT c.name as category, q.question_text,
              ROUND(AVG(r.score), 2) as avg_score,
              MIN(r.score) as min_score,
              MAX(r.score) as max_score,
              COUNT(r.id) as total_responses,
              SUM(CASE WHEN r.score = 1 THEN 1 ELSE 0 END) as score_1,
              SUM(CASE WHEN r.score = 2 THEN 1 ELSE 0 END) as score_2,
              SUM(CASE WHEN r.score = 3 THEN 1 ELSE 0 END) as score_3,
              SUM(CASE WHEN r.score = 4 THEN 1 ELSE 0 END) as score_4,
              SUM(CASE WHEN r.score = 5 THEN 1 ELSE 0 END) as score_5
       FROM questions q
       LEFT JOIN question_categories c ON q.category_id = c.id
       LEFT JOIN responses r ON q.id = r.question_id AND r.survey_id = ?
       WHERE q.survey_id = ?
       GROUP BY q.id
       ORDER BY q.display_order`,
      [surveyId, surveyId]
    );

    // Prepare stats rows
    const statsRows = [
      ['Category', 'Question', 'Avg Score', 'Min', 'Max', 'Total Responses', '1', '2', '3', '4', '5'],
      ...stats.map((s) => [
        s.category || '',
        s.question_text,
        s.avg_score || '',
        s.min_score || '',
        s.max_score || '',
        s.total_responses,
        s.score_1,
        s.score_2,
        s.score_3,
        s.score_4,
        s.score_5,
      ]),
    ];

    // Clear and update Statistics sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Statistics!A:K',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Statistics!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: statsRows,
      },
    });

    console.log('✓ Updated statistics sheet');
  } catch (error) {
    console.error('Error updating statistics sheet:', error.message);
  }
}

/**
 * Initialize Google Sheets with headers
 */
async function initializeSheets() {
  if (!isSheetsEnabled()) {
    console.log('Google Sheets sync is disabled - skipping initialization');
    return;
  }

  try {
    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Check if sheets exist
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetNames = spreadsheet.data.sheets.map((s) => s.properties.title);

    // Create Raw Responses sheet if not exists
    if (!sheetNames.includes('Raw Responses')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: { title: 'Raw Responses' },
            },
          }],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Raw Responses!A1:I1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            'Timestamp',
            'Employee ID',
            'Full Name',
            'Department',
            'Question ID',
            'Question Text',
            'Category',
            'Score',
            'Text Response',
          ]],
        },
      });
    }

    // Create Summary sheet if not exists
    if (!sheetNames.includes('Summary')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: { title: 'Summary' },
            },
          }],
        },
      });
    }

    // Create Statistics sheet if not exists
    if (!sheetNames.includes('Statistics')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: { title: 'Statistics' },
            },
          }],
        },
      });
    }

    console.log('✓ Google Sheets initialized');
  } catch (error) {
    console.error('Error initializing sheets:', error.message);
  }
}

module.exports = {
  syncResponseToSheets,
  syncAllResponsesToSheets,
  updateSummarySheet,
  updateStatisticsSheet,
  initializeSheets,
};
