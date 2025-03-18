import { test, expect } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();
import { execSync } from 'child_process';
import fs from 'fs';
import { matchesGlob } from 'path';

export async function signalExtraction(currentMonthIndex, fullYear) {
    // //original export messages command that works
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop export-messages -i -c ="The Boyz Expense Tracker" -d C:\\Users\\andre\\AppData\\Roaming\\Signal -f json"', { stdio: 'inherit' });    //execute Sigtop command in terminal to export latest Signal messages to text file
   
    // // 'dir"' is not recognized as an internal or external command, operable program or batch file.
    // execSync('cmd.exe /c dir', { stdio: 'inherit', shell: 'cmd.exe' }) 
    
    // // works: prints contents of directory
    // execSync('cmd.exe /c dir', { stdio: 'inherit' }); 

    // // works: prints C:\Users\andre\JS
    // execSync('cmd.exe /c "cd C:\\Users\\andre && cd C:\\Users\\andre\\JS && cd"', { stdio: 'inherit' }); 
    
    // // //usage + permission denied
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal -o test.json \"SELECT timestamp, sourceServiceId, body FROM messages WHERE conversationId = \'e365b4e9-828f-40a2-a3e7-48f8964b88c0\';\""', { stdio: 'inherit' });
    
    // // //usage only but incorrect because double makes it \"SELECT
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal -o test.json \\"SELECT timestamp, sourceServiceId, body FROM messages WHERE conversationId = \'e365b4e9-828f-40a2-a3e7-48f8964b88c0\';\\""', { stdio: 'inherit' });

    // // //The system cannot find the path specified
    // execSync('cmd.exe /c cd C:\\Users\\andre', { stdio: 'inherit' });

    // // //successfully gets through to that directory
    // execSync('cmd.exe /c "cd C:\\Users\\andre"', { stdio: 'inherit' });

    // // //not sure what it's doing, but same output as above
    // execSync('cmd.exe /c "cd C:\\Users\\andre" && cd', { stdio: 'inherit' });

    // // // successfully switches AND prints current directory - && must be contained within the double quotes
    // execSync('cmd.exe /c "cd C:\\Users\\andre && cd"', { stdio: 'inherit' });

    // // // switches directory, usage problem, but no permission denied
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop query-database"', { stdio: 'inherit' });

    // // // switches directory, usage problem, permission denied - when I actually try to query the db?
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop query-database "SELECT 1;""', { stdio: 'inherit' });

    // // // usage + permission denied, but the command that fails works in command prompt
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal "SELECT 1;""', { stdio: 'inherit' });

    // // // The filename, directory name, or volume label syntax is incorrect.
    // execSync('cmd.exe /c "cd C:\\Users\\andre && sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal "SELECT 1;""', { stdio: 'inherit', shell: 'cmd.exe' });

    // // NO Defaulting to Windows directory message anymore. Error: spawnSync cmd.exe ENOENT
    // execSync('dir', { stdio: 'inherit', shell: 'cmd.exe', cwd: 'C:\\Users\\andre' });
    
    // // // Microsoft Windows [Version 10.0.19045.5371] (c) Microsoft Corporation. All rights reserved. C:\Windows>
    // execSync('cd C:\\Users\\andre && sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal "SELECT 1;"', { stdio: 'inherit', shell: 'cmd.exe' });

    // // //same as above
    // execSync('dir', { stdio: 'inherit', shell: 'cmd.exe' });

    // // same as above
    // execSync('cd C:\\Users\\andre && cd', { stdio: 'inherit', shell: 'cmd.exe' });

    // // The system cannot find the path specified.
    // //C:\Windows>
    // //sigtop: open C:UsersandreAppDataRoamingSignal/sql/db.sqlite: no such file or directory
    // execSync('cmd.exe /k cd C:\\Users\\andre && sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal -o test.json "SELECT timestamp, sourceServiceId, body FROM messages WHERE conversationId = \'e365b4e9-828f-40a2-a3e7-48f8964b88c0\';"', { stdio: 'inherit' });
    
    // // prints C:\Windows and then the dir contents of web-scraper
    // execSync('cmd.exe /c "cd" && "dir"', { stdio: 'inherit' });

    // // prints C:\Windows
    // execSync('cmd.exe /c "cd"', { stdio: 'inherit' });

    // // dir contents of C:\Windows
    // execSync('cmd.exe /c "dir"', { stdio: 'inherit' });

    // // changes directory and then prints dir contents of andre
    // execSync('cmd.exe /c "cd C:\\Users\\andre && dir"', { stdio: 'inherit' });

    // // // works: runs from andre and prints current directory: C:\Users\andre
    // execSync('cmd.exe /c "cd"', { stdio: 'inherit', cwd: '/mnt/c/Users/andre' });

    // // usage error and /bin/sh: 1: : Permission denied
    // execSync('cmd.exe /c "sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal -o test.json "SELECT timestamp, sourceServiceId, body FROM messages WHERE conversationId = \'e365b4e9-828f-40a2-a3e7-48f8964b88c0\';""', { stdio: 'inherit', cwd: '/mnt/c/Users/andre' });

    // // actually creates a test.json file in users/andre
    // // run once, sigtop.exe: open C:UsersandreAppDataRoamingSignal\sql\db.sqlite: The system cannot find the path specified.
    // // run again, sigtop.exe: open test.json: The file exists.
    // execSync('cmd.exe /c sigtop query-database -d C:\\Users\\andre\\AppData\\Roaming\\Signal -o test.json "SELECT 1;"', { stdio: 'inherit', cwd: '/mnt/c/Users/andre' });

    // // successfully creates test.json file in Users/andre and contains "1"
    // execSync('cmd.exe /c sigtop query-database -d C:\\\\Users\\\\andre\\\\AppData\\\\Roaming\\\\Signal -o test.json "SELECT 1;"', { stdio: 'inherit', cwd: '/mnt/c/Users/andre' });

    // // GREAT SUCCESS
    // execSync('cmd.exe /c sigtop query-database -d C:\\\\Users\\\\andre\\\\AppData\\\\Roaming\\\\Signal -o test.json "SELECT timestamp, sourceServiceId, body FROM messages WHERE conversationId = \'e365b4e9-828f-40a2-a3e7-48f8964b88c0\';"', { stdio: 'inherit', cwd: '/mnt/c/Users/andre' });

    // // Error: Command failed: cmd.exe /c "del /F /Q "C:\Users\andre\The Boyz Expense Tracker (group).json""
    // // /bin/sh: 1: Syntax error: "(" unexpected
    // execSync(`cmd.exe /c "del /F /Q "${filePath}""`); 
     
    if (fs.existsSync('/mnt/c/Users/andre/The Boyz Expense Tracker (group).json')) {
      await execSync('cmd.exe /c del /F /Q "\\Users\\andre\\The Boyz Expense Tracker (group).json"');
    };
    execSync('cmd.exe /c sigtop query-database -d C:\\\\Users\\\\andre\\\\AppData\\\\Roaming\\\\Signal -o "The Boyz Expense Tracker (group).json" "SELECT json_group_array(json_object(\'timestamp\', timestamp\,\'sourceServiceId\', sourceServiceId\,\'body\', body)) AS result FROM messages WHERE conversationId = \'e365b4e9-828f-40a2-a3e7-48f8964b88c0\';"', { stdio: 'inherit', cwd: '/mnt/c/Users/andre' });

    const allMessagesInJSON = JSON.parse(fs.readFileSync('/mnt/c/Users/andre/The Boyz Expense Tracker (group).json', 'utf8')); //reads the exported messages file and converts it from a string to valid JSON
    const personalExpenseMessages = allMessagesInJSON.filter(msg => {
      const date = new Date(msg.timestamp);
      const isFromNewMonth = date.getFullYear() === fullYear && date.getMonth() === currentMonthIndex; //the constant stores true if both conditions are true
    //   const mortgageExpensePattern = /^\+\d{1,4}/;
      const personalExpensePattern = /^\$\d{1,4} for/; //these constants store regex patterns as objects
      const matchesPersonalExpensePattern = personalExpensePattern.test(msg.body); //test evaluates msg.body strings against these patterns, returning true or false
      return isFromNewMonth && matchesPersonalExpensePattern; //if returns true for both, msg will be included in new filtered array of personal expense messages
    });
    // console.log(personalExpenseMessages);
    
    const signalExpenses = []; //empty array to which all processed expense objects will be appended

    //from allExpenseMessages, go through one by one, extract relevant values and insert them into spreadsheet
    for (var i = 0; i < personalExpenseMessages.length; i++) {
        const messageTimestamp = personalExpenseMessages[i].timestamp;
        const date = new Date(messageTimestamp);
        const formattedDate = date.toISOString().split("T")[0];

        const messageBody = personalExpenseMessages[i].body;
        const expenseDescription = messageBody.split("for")[1].trim();
        // console.log(expenseDescription);

        const expenseAmountPattern = messageBody.match(/\$(\d+) for/);
        const expenseAmountString = expenseAmountPattern ? expenseAmountPattern[1] : null; //if message matches pattern, then access index [1], the captured amount portion. Otherwise: null
        const expenseAmountNumber = Number(expenseAmountString);
        // console.log(expenseAmountNumber);

        // iterate through this array
        const expensePayerIds = [
            { sourceServiceId: [null, undefined, "c9e86e74-9443-49ae-94f2-2b19cef78fe1"], name: "Andrew" },
            { sourceServiceId: ["fffc86d4-5adf-4660-9f8c-083993b7bf98"], name: "Arthur" },
            { sourceServiceId: ["fe6d3dd6-9d72-498c-8d38-94d1a8c17cb0"], name: "David" },
            { sourceServiceId: ["a7da1462-f454-4293-b10c-4975754c53d8"], name: "Dustin" },
            { sourceServiceId: ["d22f477e-fcb5-441e-9a2b-aaecc45af256"], name: "Dylan" },
            { sourceServiceId: ["c2dc234c-619d-465f-bf88-948f625630df"], name: "Fred" }
        ];
        const sourceServiceId = personalExpenseMessages[i].sourceServiceId;
        const match = expensePayerIds.find(payer => payer.sourceServiceId.includes(sourceServiceId)); //const match is the element (object) in the array that matches the condition; the condition is that the inner array .includes() the id; go through each element of expensePayerIds array (payer), check condition, if returns true, then method returns object that matches condition 
        const expensePayer = match ? match.name : "Unknown"; //if match exists, return match.name, otherwise return "Unknown"
        // console.log(expensePayer);

        const processedExpenseObject = {
            date: formattedDate,
            description: expenseDescription,
            amount: expenseAmountNumber,
            payer: expensePayer,
        };
        signalExpenses.push(processedExpenseObject);
    };
    console.log("Signal Expenses: ");
    console.log(signalExpenses);
    return signalExpenses; //returns an array of objects, each one representing a transaction with a description, amount, and payer property
};

// test('signalExtraction', async ({ page }) => {
//     test.setTimeout(100000);
//     await signalExtraction(0, 2025);
// });


