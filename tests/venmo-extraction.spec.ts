import { test, expect } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';
import { execSync } from 'child_process';
import { combineExpenses } from '../other_adjacent_tests/combine-like-expenses';

export async function venmoExtraction(currentMonthIndex, fullYear) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const entireADBoutput = await execSync(`adb -s 192.168.1.206:5555 shell content query --uri content://sms/inbox | grep -P "paid you" | grep -iE "house|bills|billz|rent|🍕|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec"`, { encoding: 'utf-8' }); //query phone for matching sms, returns one long string of multiple sms strings mashed together "sms1: date=123, body=Fred paid/n sms2: date=234, body=Arthur paid paid/n"
    const arrayOfSMSStrings = entireADBoutput.split("\n"); //splitting long string by newline /n char into an array of smaller strings : ["sms1: date=123, body=Fred paid", "sms2: date=234, body=Arthur paid"]; 
    const splitStringsIntoArrayOfProperties = arrayOfSMSStrings.map(smsString => smsString.replace(/^Row: \d+\s*/, "").split(", "));
    const splitPropertiiesIntoArrayOfKeyValuePairs = splitStringsIntoArrayOfProperties.map(array => { //for each array, go through each property element and contain it within a subarray
        const keyValueArrays = array.map(keyValue => keyValue.split("=")) // processing array elements to be converted to objects
        return keyValueArrays;
    });
    const arrayOfSMSObjects = splitPropertiiesIntoArrayOfKeyValuePairs.map(smsArray => Object.fromEntries(smsArray)); //convert into objects

    //eventual array of objects for each transaction including date, name, and amount properties
    const arrayOfProcessedSMSObjects = [];
    const combinedProcessedSMSObjects = [];
   
    // for each matching venmo sms, 
    for (var i = 0; i < arrayOfSMSObjects.length-1; i++) { //minus one because the last line of the entireADBoutput is a blank new line
        const date = new Date(Number(arrayOfSMSObjects[i].date)); // create a date out of the date property
        const formattedDate = date.toISOString().split("T")[0];
        const month = date.getMonth();
        const year = date.getFullYear();
        let name, amount;

        if (arrayOfSMSObjects[i].body) { //if message body string is not undefined, then split it into name and amount properties
            const match = arrayOfSMSObjects[i].body.match(/^(.*?) paid you \$([\d.]+) (.+)$/);
            if (match) {
                name = match[1];
                amount = Number(match[2]);
                amount = String(amount);
            } else {
                console.log("")
            }
        } else {
            console.log("")
        }

        const processedSMSobject = {date: formattedDate, name: name, amount: amount}

        if (currentMonthIndex === month && fullYear === year) {
            arrayOfProcessedSMSObjects.push(processedSMSobject);
        };
    }
    await combineExpenses(arrayOfProcessedSMSObjects, combinedProcessedSMSObjects);
    console.log(arrayOfProcessedSMSObjects);
    console.log(combinedProcessedSMSObjects);
    return combinedProcessedSMSObjects; //an array of objects, each one representing an venmo transaction with a date, payer name, and amount property
};

// test('venmoExtraction', async ({ page }) => {
//     test.setTimeout(100000);
//     await venmoExtraction(11,2024);
// });
