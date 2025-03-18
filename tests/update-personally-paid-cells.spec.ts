// Import the Google APIs library
import { google } from 'googleapis';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

//based on month of lastSheetTitle, get the date for the newSheet to be passed to every other test so they know the correct date range to extract transactions
export async function updatePersonallyPaidCells(sheets, spreadsheetId, newSheetTitle) {
    const spreadsheetObject = await sheets.spreadsheets.get({ //get whole spreadsheet object
        spreadsheetId: spreadsheetId,
    });
    const sheetsArray = spreadsheetObject.data.sheets; //extract array of sub sheets
    const sheetsArrayLength = sheetsArray.length;
    const lastSheetIndex = sheetsArrayLength - 1; //get last index in sub sheets array
    const lastSheetTitle = sheetsArray[lastSheetIndex].properties.title; //extract title of last sheet
    const lastSheetId = sheetsArray[lastSheetIndex].properties.sheetId; //extract title of last sheet
    

    async function concatenateStrings(array) {
        const arrayC = [""];
        for (var i = 0; i < array.length; i++) {
            if (arrayC.length === 1) {
                const newSegment = arrayC[i] + array[i];
                arrayC.push(newSegment);
            } else {
                const newSegment = arrayC[i] + "+" + array[i]; // "" + "H1"
                arrayC.push(newSegment);
            }
        };
        return arrayC;
    };

    async function updatePersonallyPaidCellFormula(cell, cellFormula) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
              valueInputOption: 'USER_ENTERED', // Write data as raw input (no formatting)
              data: [
                {
                  range: `${newSheetTitle}!${cell}`, // clear personally paid items column
                  values: [[`=${cellFormula}`]],
                },
              ]
            },
        });
    } 

    const personallyPaidColumnI = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${lastSheetTitle}!I2:I16`
    })
    const personallyPaidColumnIArray = personallyPaidColumnI.data.values;
    // console.log(personallyPaidColumnIArray);

    // async function grabPersonallyPaidColumnH(i) {
    //     const response = await sheets.spreadsheets.values.get({
    //         spreadsheetId,
    //         range: `${lastSheetTitle}!H${i+2}`
    //     })
    //     const personallyPaidColumnHArray = response.data.values;
    //     console.log(personallyPaidColumnHArray);
    // } 
    
    // grab neighboring column H value and add to personally paid cell formula

    const HStringArrays = [ [],[],[],[],[],[] ];
    for (var i = 0; i < personallyPaidColumnIArray.length; i++) { // combining all expenses for one person into separate array
        if (personallyPaidColumnIArray[i][0] === "Andrew") {
            HStringArrays[0].push(`H${i+2}`)
        } else if (personallyPaidColumnIArray[i][0] === "Arthur") {
            HStringArrays[1].push(`H${i+2}`)
        } else if (personallyPaidColumnIArray[i][0] === "David") {
            HStringArrays[2].push(`H${i+2}`)
        } else if (personallyPaidColumnIArray[i][0] === "Dustin") {
            HStringArrays[3].push(`H${i+2}`)
        } else if (personallyPaidColumnIArray[i][0] === "Dylan") {
            HStringArrays[4].push(`H${i+2}`)
        } else if (personallyPaidColumnIArray[i][0] === "Fred") {
            HStringArrays[5].push(`H${i+2}`)
        }
    }

    const personallyPaidCellsArray = ["B22", "C22", "D22", "E22", "F22", "G22"];
    for (var i = 0; i < HStringArrays.length; i++) {
        if (HStringArrays[i].length === 0) {
            await updatePersonallyPaidCellFormula(personallyPaidCellsArray[i], 0)
        } else {
            const arrayC = await concatenateStrings(HStringArrays[i])
            const cellFormula = arrayC[arrayC.length - 1]
            await updatePersonallyPaidCellFormula(personallyPaidCellsArray[i], cellFormula)
        }
    }
  };





// test('createNewSheet', async () => {
//     await createNewSheet();
// });
