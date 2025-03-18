import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();
import { execSync } from 'child_process';

export async function boaWaterBillExtraction(currentMonthIndex, fullYear) {
    const decryptedEnv = execSync('sops -d .env', { encoding: 'utf-8' });
    const parsedEnv = dotenv.parse(decryptedEnv);
    Object.assign(process.env, parsedEnv);
    // console.log(process.env);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const boaUsername = process.env.BOA_USERNAME;
    const boaPWD = process.env.BOA_PWD;
    await page.goto('https://secure.bankofamerica.com/login/sign-in/signOnV2Screen.go');
    
    const emailField = await page.locator('#enterID-input');
    await emailField.type(boaUsername);
    const pwdField = await page.locator('#tlpvt-passcode-input');
    await pwdField.click();
    await pwdField.fill(boaPWD);
    const nextButton = await page.locator('#login_button');
    await nextButton.click();

    // extracting OTP using adb shell commands if necessary
    // await page.waitForTimeout(7000);
    const OTPLocator = page.locator('#btnARContinue > span:nth-child(1)') //getByRole('link', { name: 'SEND CODE' })
    await OTPLocator.waitFor();
    if (await OTPLocator.isVisible()) {
        await OTPLocator.click();
        await page.waitForTimeout(15000);
        const OTP = await execSync(`adb -s 192.168.1.206:5555 shell content query --uri content://sms/inbox | grep "BofA" | grep -oP "\\b\\d{6}\\b" | head -n 1`, { encoding: 'utf-8' });
        console.log('Extracted OTP:', OTP.trim());
        // await page.waitForTimeout(10000);
        const enterOTP = await page.locator('#tlpvt-acw-authnum');
        await enterOTP.fill(OTP);
        const rememberComputer = await page.locator('#no-recognize');
        await rememberComputer.click();
        const OTPSubmit = page.locator('#continue-auth-number > span');
        await OTPSubmit.click();
    };

    // await page.waitForTimeout(7000); // Waits for 3 seconds
    const closeWarning = page.getByLabel('close Dialog')
    if (await closeWarning.isVisible()) {
        await closeWarning.click();
    };

    // await page.waitForTimeout(3000); // Waits for 3 seconds
    const checkingAcc = page.locator('#Traditional > li:nth-child(1) > div.AccountItem.AccountItemDeposit > span.AccountName > a');
    await checkingAcc.waitFor();
    await checkingAcc.click();
    // await page.waitForTimeout(3000);

    const viewMoreTransactions = page.locator('#view-more-activity-desktop');
    await viewMoreTransactions.waitFor();
    await viewMoreTransactions.click();
    const viewMoreTransactions2 = page.locator('#view-more-activity-desktop');
    await viewMoreTransactions2.waitFor();
    await viewMoreTransactions2.click();

    //cityOfRichmondDivs is the outer container with description, date, amount as inner containers
    //filters based on the condition of one inner container (match water bill description), then goes back outside and accesses a different inner container (amount and date)
    const allTransactionDivs = await page.locator('#txn-activity-section tr'); //all divs within the txn-list-section (transaction list section)
    const cityOfRichmondDivs = allTransactionDivs.filter({ //among all transaction divs, filter those with... (this stores the outer containers that match the description)
        has: page.locator('td.desc-cell div.desc-row div.desc-text', { //...a description div containing a span which contains
            hasText: 'City of Richmond' //the following description (inner container) //count: 6
        })
    });

    // await page.waitForTimeout(3000); // Waits for 3 seconds
    const waterBillAmount = cityOfRichmondDivs.locator('td.amount-cell.text-rt span.red-money').allTextContents(); //go back to outer shell
    // await page.waitForTimeout(3000); // Waits for 3 seconds
    const waterBillDate = cityOfRichmondDivs.locator('td.date-cell span, td.date-cell a').allTextContents();
    // await page.waitForTimeout(3000); // Waits for 3 seconds

    const waterBillsDatesArray = await waterBillDate;
    const waterBillsAmountsArray = await waterBillAmount;
    console.log("Recent water bill dates: ");
    console.log(waterBillsDatesArray);
    console.log("Recent water bill amounts: ");
    console.log(waterBillsAmountsArray);

    const thisMonthsWaterBillsAmounts = [];
    const thisMonthsWaterBillsDates = [];
    const thisMonthsWaterBillsObjectsArray = [];

    //go through water bill dates array to find one that matches current month and year
    for (var i = 0; i < waterBillsDatesArray.length; i++) {
        const date = new Date(waterBillsDatesArray[i]);
        const month = date.getMonth();
        const year = date.getFullYear();
        // console.log(month);
        // console.log(year);

        //if there is a match, process the water bill string to remove the dollar sign and convert it to a number
        if (currentMonthIndex === month && fullYear === year) {
            // console.log(waterBillsDatesArray[i])
            // console.log(waterBillsAmountsArray[i])            
            const waterBillAmountsNoDollarSign = waterBillsAmountsArray[i].split("$"); 
            const processedWaterBillAmount = Number(waterBillAmountsNoDollarSign[1]);
            thisMonthsWaterBillsAmounts.push(processedWaterBillAmount); //add final amount to array
            thisMonthsWaterBillsDates.push(waterBillsDatesArray[i]);
        }
    }

    //because there may be two transactions pushed to the array that match the date (water and stormwater)
    //set the larger one to the water bill and the smaller one to the stormwater bill

    async function exportWaterBills() {
        const finalWaterBill = Math.max(...thisMonthsWaterBillsAmounts)
        const finalStormwaterBill = Math.min(...thisMonthsWaterBillsAmounts)
        // console.log("waterbill: " + finalWaterBill);
        // console.log("stormwaterbill: " + finalStormwaterBill);

        const waterBillIndex = thisMonthsWaterBillsAmounts.indexOf(finalWaterBill);
        const stormwaterBillIndex = thisMonthsWaterBillsAmounts.indexOf(finalStormwaterBill);

        const waterBillObject = {
            description: "water bill",
            date: thisMonthsWaterBillsDates[waterBillIndex],
            amount: finalWaterBill,
        };

        const stormwaterBillObject = {
            description: "stormwater bill",
            date: thisMonthsWaterBillsDates[stormwaterBillIndex],
            amount: finalStormwaterBill,
        };

        thisMonthsWaterBillsObjectsArray.push(waterBillObject);
        thisMonthsWaterBillsObjectsArray.push(stormwaterBillObject);

        console.log("Append to Google Sheets: ");
        console.log(thisMonthsWaterBillsObjectsArray);
        return thisMonthsWaterBillsObjectsArray;
    }

    if (thisMonthsWaterBillsAmounts.length === 2) {
        const thisMonthsWaterBillsObjectsArray = await exportWaterBills();
        return thisMonthsWaterBillsObjectsArray;
    } else if (thisMonthsWaterBillsAmounts.length === 1) {
        thisMonthsWaterBillsAmounts.push(0);
        thisMonthsWaterBillsDates.push("no stormwater bill this month")
        const thisMonthsWaterBillsObjectsArray = await exportWaterBills();
        return thisMonthsWaterBillsObjectsArray;
    } else if (thisMonthsWaterBillsAmounts.length === 0) {
        thisMonthsWaterBillsAmounts.push(0);
        thisMonthsWaterBillsAmounts.push(0);
        thisMonthsWaterBillsDates.push("no water bills this month yet")
        thisMonthsWaterBillsDates.push("no stormwater bill this month")
        const thisMonthsWaterBillsObjectsArray = await exportWaterBills();
        return thisMonthsWaterBillsObjectsArray;
    };
    //return final array consisting of this months water and stormwater bill amounts
    //these will be appended to spreadsheet
};

// test('boaWaterBillExtraction', async () => {
//     test.setTimeout(100000);
//     await boaWaterBillExtraction();
// });
