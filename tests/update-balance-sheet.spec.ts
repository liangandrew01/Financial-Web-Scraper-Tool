// Import the Google APIs library
import { google } from 'googleapis';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export async function updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, values, cells, comments, startRowIndex, startColumnIndex) {
    const spreadsheetObject = await sheets.spreadsheets.get({ //get whole spreadsheet object
        spreadsheetId: spreadsheetId,
    });
    const sheetsArray = spreadsheetObject.data.sheets; //extract array of sub sheets
    const lastSheetIndex = sheetsArray.length - 1; //get last index in sub sheets array
    const lastSheetId = sheetsArray[lastSheetIndex].properties.sheetId;

    async function appendExtractedValues() {
        try { //append extracted data as cell contents
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    valueInputOption: 'USER_ENTERED',
                    data: [
                        {
                            range: `${newSheetTitle}!${cells}`, // sheet title and cell location
                            majorDimension: "COLUMNS",
                            values: [
                                [values], // values passed as 4th argument
                            ],
                        },
                    ],
                },

            });

            await sheets.spreadsheets.batchUpdate({ //add comments (metadata) to same cells
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            updateCells: {
                                range: {
                                    sheetId: lastSheetId,
                                    startRowIndex: startRowIndex,
                                    endRowIndex: startRowIndex + 1,
                                    startColumnIndex: startColumnIndex,
                                    endColumnIndex: startColumnIndex + 1
                                },
                                rows: [
                                    {
                                        values: [{ note: comments }]
                                    }
                                ],
                                fields: "note"
                            }
                        }
                    ]
                }
            });

        } catch (error) {
            console.error('Error updating cells: ', error);
        }
    };
    await appendExtractedValues();

    // console.log(`${[values]} successfully written to ${cells}!`);
};

// test('updateBalanceSheet', async () => {
//     await updateBalanceSheet("testValue");
// });
