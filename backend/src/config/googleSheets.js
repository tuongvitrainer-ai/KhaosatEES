const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let sheets = null;
let auth = null;

/**
 * Initialize Google Sheets API
 */
async function initGoogleSheets() {
  try {
    const credentialsPath = path.join(
      __dirname,
      '../../',
      process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-credentials.json'
    );

    // Check if credentials file exists
    if (!fs.existsSync(credentialsPath)) {
      console.warn('⚠ Google credentials file not found. Sheets sync will be disabled.');
      console.warn(`  Expected path: ${credentialsPath}`);
      console.warn('  Please add your Google Service Account credentials to enable sync.');
      return null;
    }

    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    // Create auth client
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create sheets client
    sheets = google.sheets({ version: 'v4', auth });

    console.log('✓ Google Sheets API initialized');
    return sheets;
  } catch (error) {
    console.error('✗ Error initializing Google Sheets API:', error.message);
    return null;
  }
}

/**
 * Get sheets instance
 */
function getSheets() {
  return sheets;
}

/**
 * Check if Google Sheets is enabled
 */
function isSheetsEnabled() {
  return sheets !== null && process.env.GOOGLE_SHEET_ID;
}

/**
 * Get spreadsheet ID from environment
 */
function getSpreadsheetId() {
  return process.env.GOOGLE_SHEET_ID;
}

module.exports = {
  initGoogleSheets,
  getSheets,
  isSheetsEnabled,
  getSpreadsheetId,
};
