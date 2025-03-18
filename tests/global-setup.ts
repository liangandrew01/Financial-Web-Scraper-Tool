import { initializeSheetsAPI } from './initialize-sheets-api.spec';
import { createNewSheet } from './create-new-sheet.spec';

async function globalSetup() {
    const [sheets, spreadsheetId] = await initializeSheetsAPI();
    await createNewSheet(sheets, spreadsheetId); // Runs only once
}

export default globalSetup;
