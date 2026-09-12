import { google } from 'googleapis';

export async function appendToSheet(data: any[]) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!privateKey || !clientEmail || !sheetId) {
    throw new Error('Google credentials or Sheet ID are missing in environment variables.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: '工作表1!A:T', // 若您的分頁名稱為英文請改回 'Sheet1!A:T'
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });
    return response.data;
  } catch (error) {
    console.error('The API returned an error: ' + error);
    throw error;
  }
}
