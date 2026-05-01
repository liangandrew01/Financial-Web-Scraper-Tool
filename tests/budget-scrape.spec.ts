import { test as base, expect } from '@playwright/test'; //renaming the default playwright test function to "base", but can be called anything
import { initializeSheetsAPI } from './initialize-sheets-api.spec';
import { createNewSheet } from './create-new-sheet.spec';
import { extractDate } from './extract-date.spec';
import { allyExtraction } from './ally-extraction.spec';
import { boaWaterBillExtraction } from './boa-waterbill-extraction.spec';
import { signalExtraction } from './signal-extraction.spec';
import { venmoExtraction } from './venmo-extraction.spec';
import { updateBalanceSheet } from './update-balance-sheet.spec';
import { updatePersonallyPaidCells } from './update-personally-paid-cells.spec';
import { updateMonthlyAverage } from './update-monthly-average.spec';

const test = base.extend<{ //"extend" the default "base" test functionality with the custom fixture functions. "base" can be called anything
    sheets: any; //<fixture type definitions> enclosed in object
    spreadsheetId: string;
    currentMonthIndex: number;
    fullYear: number;
    customContext: BrowserContext;
}>({ //fixture functions which pass their fixture values (sheets and spreadsheetId) to the tests
    sheetsData: async ({}, use) => { //sheetsData (previously initializeSheetsAPI when you only exported one value) is the fixture "key" or name; {} is the context object, which can be used to access other fixtures (like page) but not in this case
        const [sheets, spreadsheetId] = await initializeSheetsAPI();
        await use({ sheets, spreadsheetId }); //use is a playwright function that passes the fixture values to tests
    },

    extractDate: async ({ sheetsData }, use) => { 
        const { sheets, spreadsheetId } = sheetsData;
        const [newSheetTitle, currentMonthIndex, fullYear] = await extractDate(sheets, spreadsheetId);
        await use({ newSheetTitle, currentMonthIndex, fullYear }); //use is a playwright function that passes the fixture values to tests
    },

    customContext: async ({ browser }, use) => {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          }); 
        await use(context); 
        await context.close(); 
    }
});

// the functions to initialize sheets API and createNewSheet will be run once first in global-setup.ts
// test.beforeAll('createNewSheet', async ({ sheetsData }) => { //the arguments page and sheetsData get used as partt of the test function
//     const { sheets, spreadsheetId } = sheetsData;
//     await createNewSheet(sheets, spreadsheetId);
// });

test('allyExtraction', async ({ customContext, sheetsData, extractDate }) => {
    test.setTimeout(1000000);
    const { sheets, spreadsheetId } = sheetsData; //initializing the destructured properties from the sheetsData object, or the result of calling initializeSheetsAPI as part of the fixture function
    const { newSheetTitle, currentMonthIndex, fullYear } = extractDate;
    // const page = await customContext.newPage(); // Use the customized context
    const combinedAllyExpensesArray = await allyExtraction(customContext, currentMonthIndex, fullYear);
    await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, combinedAllyExpensesArray[0]?.amount, "H2", combinedAllyExpensesArray[0]?.date, 1, 7);
    await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, combinedAllyExpensesArray[1]?.amount, "H3", combinedAllyExpensesArray[1]?.date, 2, 7);
    
    if (combinedAllyExpensesArray[2] && combinedAllyExpensesArray[2].name === "DustinPayments") {
        await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, combinedAllyExpensesArray[2].amount, "E21", combinedAllyExpensesArray[2]?.date, 20, 4);
    } else if (combinedAllyExpensesArray[2] && combinedAllyExpensesArray[2].name === "AndrewPayments") {
        await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, combinedAllyExpensesArray[2].amount, "B21", combinedAllyExpensesArray[2]?.date, 20, 1);
    };
    if (combinedAllyExpensesArray[3] && combinedAllyExpensesArray[3].name === "AndrewPayments") {
        await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, combinedAllyExpensesArray[3].amount, "B21", combinedAllyExpensesArray[3]?.date, 20, 1);
    };
});

// test('waterBillExtraction', async ({ sheetsData, extractDate }) => {
//     test.setTimeout(1000000);
//     const { sheets, spreadsheetId } = sheetsData;
//     const { newSheetTitle, currentMonthIndex, fullYear } = extractDate;
//     const thisMonthsWaterBillsObjectsArray = await boaWaterBillExtraction(currentMonthIndex, fullYear);
//     await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, thisMonthsWaterBillsObjectsArray[0].amount, "H4", thisMonthsWaterBillsObjectsArray[0].date, 3, 7);
//     await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, thisMonthsWaterBillsObjectsArray[1].amount, "H5", thisMonthsWaterBillsObjectsArray[1].date, 4, 7);
// });


// test('signalExtraction', async ({ sheetsData, extractDate }) => { //the arguments page and sheetsData get used as partt of the test function
//     const { sheets, spreadsheetId } = sheetsData;
//     const { newSheetTitle, currentMonthIndex, fullYear } = extractDate;
//     const signalExpenses = await signalExtraction(currentMonthIndex, fullYear); //returns an array of objects, each one representing a transaction with a description, amount, and payer property
//     for(var i = 0; i < signalExpenses.length; i++) {
//         await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, signalExpenses[i].description, `A${i+8}`, "", i+7, 0);
//         await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, signalExpenses[i].amount, `H${i+8}`, signalExpenses[i].date, i+7, 7);
//         await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, signalExpenses[i].payer, `I${i+8}`, "", i+7, 8);
//     }
// });

// test('venmoExtraction', async ({ sheetsData, extractDate }) => {
//     test.setTimeout(1000000);
//     const { sheets, spreadsheetId } = sheetsData;
//     const { newSheetTitle, currentMonthIndex, fullYear } = extractDate;
//     const arrayOfVenmoTransactions = await venmoExtraction(currentMonthIndex, fullYear);
//     for (var i = 0; i < arrayOfVenmoTransactions.length; i++) {
//         if (arrayOfVenmoTransactions[i].name === "Arthur Pawlica") {
//             await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, arrayOfVenmoTransactions[i].amount, `C21`, arrayOfVenmoTransactions[i].date, 20, 2);
//         } else if (arrayOfVenmoTransactions[i].name === "David Hastings") {
//             await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, arrayOfVenmoTransactions[i].amount, `D21`, arrayOfVenmoTransactions[i].date, 20, 3);
//         } else if  (
//             arrayOfVenmoTransactions[i].name === "dustin washington" ||
//             arrayOfVenmoTransactions[i].name === "Dustin Washington"
//           ) {
//             const DustinExistingValueResponse = await sheets.spreadsheets.values.get({
//                 spreadsheetId: spreadsheetId,
//                 range: `${newSheetTitle}!E21`,
//             });
//             if (DustinExistingValueResponse.data.values) {
//                 const DustinExistingValue = DustinExistingValueResponse.data.values[0][0];
//                 const DustinCombinedDeposits = `=${DustinExistingValue}+${arrayOfVenmoTransactions[i].amount}`;
//                 await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, DustinCombinedDeposits, `E21`, arrayOfVenmoTransactions[i].date, 20, 4);
//             } else {
//                 await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, arrayOfVenmoTransactions[i].amount, `E21`, arrayOfVenmoTransactions[i].date, 20, 4);
//             };

//         } else if (arrayOfVenmoTransactions[i].name === "Dylan Cloyd") {
//             await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, arrayOfVenmoTransactions[i].amount, `F21`, arrayOfVenmoTransactions[i].date, 20, 5);
//         } else if (arrayOfVenmoTransactions[i].name === "Fred Zhao") {
//             await updateBalanceSheet(sheets, spreadsheetId, newSheetTitle, arrayOfVenmoTransactions[i].amount, `G21`, arrayOfVenmoTransactions[i].date, 20, 6);
//         } 
//     };
// });

// test('updatePersonallyPaidCells', async ({ sheetsData, extractDate }) => {
//     test.setTimeout(1000000);
//     const { sheets, spreadsheetId } = sheetsData;
//     const { newSheetTitle, currentMonthIndex, fullYear } = extractDate;
//     await updatePersonallyPaidCells(sheets, spreadsheetId, newSheetTitle);
// });

// test('updateMonthlyAverage', async ({ sheetsData, extractDate }) => {
//     test.setTimeout(1000000);
//     const { sheets, spreadsheetId } = sheetsData;
//     const { newSheetTitle, currentMonthIndex, fullYear } = extractDate;
//     await updateMonthlyAverage(sheets, spreadsheetId, newSheetTitle);
// });