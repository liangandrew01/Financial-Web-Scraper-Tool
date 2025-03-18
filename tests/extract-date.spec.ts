// Import the Google APIs library
import { google } from 'googleapis';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

//based on month of lastSheetTitle, get the date for the newSheet to be passed to every other test so they know the correct date range to extract transactions
export async function extractDate(sheets, spreadsheetId) {
    async function extractNewSheetTitle() {
        try {
            const newMonthTitle = await sheets.spreadsheets.get({
                spreadsheetId: spreadsheetId,
            });
            const sheetsArray = newMonthTitle.data.sheets;
            const sheetsArrayLength = sheetsArray.length;
            const newSheetIndex = sheetsArrayLength - 1;
            const newSheetTitle = sheetsArray[newSheetIndex].properties.title;
            // console.log("Last sheet title: " + lastSheetTitle);
            return newSheetTitle;
        } catch (error) {
            console.error('Error: ', error);
        }
    };
    const newSheetTitle = await extractNewSheetTitle(); //"Nov24"

    //get new MONTH, not create new sheet
    async function extractMonthAndYear() {
        let newMonth = newSheetTitle.slice(0, 3); //"Nov"
        let newYearString = newSheetTitle.slice(3); //"24"
        let newYear = Number(newYearString); //24
        let fullYear = newYear + 2000; //2024

        const monthsArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentMonthIndex = monthsArray.indexOf(newMonth); //10
        return [currentMonthIndex, fullYear];
    };
    const [currentMonthIndex, fullYear] = await extractMonthAndYear();

    // console.log("New month index and year: ");
    // console.log([newSheetTitle, currentMonthIndex, fullYear]);
    return [newSheetTitle, currentMonthIndex, fullYear];
};

// test('createNewSheet', async () => {
//     await extractDate();
// });
