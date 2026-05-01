import { test, expect } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';
import dotenv from 'dotenv'; // a Node.js library that helps manage environment variables like loading variables from .env files into process.env
dotenv.config(); // loads variables defined in your .env file into process.env
import { execSync } from 'child_process';
import { combineExpenses } from './combine-like-expenses';

export async function allyExtraction(context, currentMonthIndex, fullYear) {
    // const browser = await chromium.launch();

    // const version = await browser.version();
    // console.log(`Browser version: ${version}`);
    // await browser.close();

    // const context = await browser.newContext({
    //     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    //   });

    const page = await context.newPage();

    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.context().storageState({}); // Clears localStorage and sessionStorage
    await page.context().addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    const decryptedEnv = execSync('sops -d .env', { encoding: 'utf-8' });
    const parsedEnv = dotenv.parse(decryptedEnv);
    Object.assign(process.env, parsedEnv);
    // console.log(process.env);

    const allyUsername = process.env.ALLY_USERNAME;
    const allyPWD = process.env.ALLY_PWD;
    await page.goto('https://secure.ally.com/');
    
    const usernameField = await page.locator('#username');
    await usernameField.fill(allyUsername);
    const pwdField = await page.locator('#password');
    await pwdField.click();
    await pwdField.type(allyPWD);
    // const loginButton = await page.locator('#ally-login-login-form > div.sc-iLLODe.ybEzx > button'); //chrome
    const loginButton = page.getByTestId('login-submit'); //above .sc- classes are dynamically generated, not stable long term
    await loginButton.waitFor();
    await loginButton.click();
    // await page.waitForTimeout(15000);

    // extracting OTP using adb shell commands if necessary
    
    // //if "proceed to confirm" button is necessary to click before verifying login
    // const proceedToConfirm = await page.locator('#main > div > div > div > div > div > div.sc-dPZUQH.sc-eTTeRg.jihETP.jkvCZV > button')
    // if (await proceedToConfirm.isVisible()) {
    //     await proceedToConfirm.click();
    // };

    //choose how you'll verify this login
    const selectTextMethod = page.getByLabel('Text: We\'ll text a security');
    await selectTextMethod.waitFor();
    // if (await selectTextMethod.isVisible()) {
        await selectTextMethod.click();
        const nextButton = await page.getByRole('button', { name: /next/i });
        await nextButton.click();
        await page.waitForTimeout(15000);

        const OTP = await execSync(`adb -s 192.168.1.206:5555 shell content query --uri content://sms/inbox | grep "Ally" | grep -oP "\\b\\d{6}\\b" | head -n 1`, { encoding: 'utf-8' });
        console.log('Extracted OTP:', OTP.trim());
        const enterOTP = page.locator('#otpCode');
        await enterOTP.waitFor();
        await enterOTP.fill(OTP);
        const continueSubmitOTP = await page.getByRole('button', { name: /continue/i });
        await continueSubmitOTP.click();
        await page.waitForTimeout(15000);


        // const dontRememberComputer = await page.locator('input[name="registerDevice"][value="No"]');
        // const dontRememberComputer = await page.locator('#radio-button-9a428e1b-5d13-423b-8442-99878a76e7b1');
        const dontRememberComputer = page.getByLabel('No - this is a shared/public computer or device (like a friend\'s or those in a library)');
        await dontRememberComputer.waitFor();
        await page.evaluate(() => {
            const labels = document.querySelectorAll('label');
            labels.forEach(label => {
                label.style.pointerEvents = 'none';
            })
        });
        await dontRememberComputer.click();
        const continueSavePreferences = await page.getByRole('button', { name: /continue/i });
        await continueSavePreferences.click();
    // }

    const checkingAccount = page.getByTestId('account-card-interest-checking').getByTestId('account-link');
    await checkingAccount.waitFor();
    await checkingAccount.click();
    const viewMoreTransactions = page.getByTestId('viewMoreButton');
    await viewMoreTransactions.waitFor();
    await viewMoreTransactions.click();

    
    // tbody (role="rowgroup")
    // > tr (role="row") 
    // > td (role = "cell") 
    // > div 
    // > div (testid = 'private-wrapper')
    // > button(testid = 'transaction-history-desc')
    // > span

    const allTransactionRows = await page.getByRole('rowgroup').locator('tr'); //all table row (tr) elements within the tbody element with role="rowgroup"
    const mortgagePaymentRows = allTransactionRows.filter({ //among all transaction divs, filter those with... (this stores the outer containers that match the description as a forking point)
        has: page.getByTestId('private-wrapper').getByTestId('transaction-history-desc').locator('span', { //...a description div containing a span which contains
            hasText: 'NSM DBAMR.COOPER' //the following description (inner container) //count: 6
        })
    });
    const electricityBillRows = allTransactionRows.filter({ //among all transaction divs, filter those with... (this stores the outer containers that match the description as a forking point)
        has: page.getByTestId('private-wrapper').getByTestId('transaction-history-desc').locator('span', { //...a description div containing a span which contains
            hasText: 'DOMINION ENERGY BILLPAY' //the following description (inner container) //count: 6
        })
    });
    const DustinPaymentRows = allTransactionRows.filter({ //among all transaction divs, filter those with... (this stores the outer containers that match the description as a forking point)
        has: page.getByTestId('private-wrapper').getByTestId('transaction-history-desc').locator('span', { //...a description div containing a span which contains
            hasText: 'DUSTIN C WASHINGTON' //the following description (inner container) //count: 6
        })
    });
    const AndrewPaymentRows = allTransactionRows.filter({ //among all transaction divs, filter those with... (this stores the outer containers that match the description as a forking point)
        has: page.getByTestId('private-wrapper').getByTestId('transaction-history-desc').locator('span', { //...a description div containing a span which contains
            hasText: /ANDREW YU? LIANG/ //the following description (inner container) //count: 6
        })
    });

    //td role="cell" > div > span (testid = posAmount/negAmount)
    const mortgageAmounts = await mortgagePaymentRows.locator('td[role="cell"] div span[data-testid="negAmount"]').allTextContents(); //go back to outer shell
    const mortgageDates = mortgagePaymentRows.locator('td:first-child div span').allTextContents(); //go back to outer shell
    const mortgageAmountsArray = await mortgageAmounts;
    const mortgageDatesArray = await mortgageDates;
    console.log("Recent mortgage amounts: ");
    console.log(mortgageAmountsArray);
    console.log("Recent mortgage dates: ");
    console.log(mortgageDatesArray);

    const electricityBillAmounts = await electricityBillRows.locator('td[role="cell"] div span[data-testid="negAmount"]').allTextContents(); //go back to outer shell
    const electricityBillDates = await electricityBillRows.locator('td:first-child div span').allTextContents(); //go back to outer shell
    const electricityBillAmountsArray = await electricityBillAmounts;
    const electricityBillDatesArray = await electricityBillDates;
    console.log("Recent electricity bill amounts: ");
    console.log(electricityBillAmountsArray);
    console.log("Recent electricity bill dates: ");
    console.log(electricityBillDatesArray);

    const DustinPaymentAmounts = await DustinPaymentRows.locator('td[role="cell"]:nth-of-type(3) div span[data-testid="posAmount"]').allTextContents(); //go back to outer shell 
    const DustinPaymentDates = await DustinPaymentRows.locator('td:first-child div span').allTextContents(); //go back to outer shell
    const DustinPaymentAmountsArray = await DustinPaymentAmounts;
    const DustinPaymentDatesArray = await DustinPaymentDates;
    console.log("Recent Dustin Payment Amounts: ");
    console.log(DustinPaymentAmountsArray);
    console.log("Recent Dustin Payment Dates: ");
    console.log(DustinPaymentDatesArray);

    const AndrewPaymentAmounts = await AndrewPaymentRows.locator('td[role="cell"]:nth-of-type(3) div span[data-testid="posAmount"]').allTextContents(); //go back to outer shell
    const AndrewPaymentDates = await AndrewPaymentRows.locator('td:first-child div span').allTextContents(); //go back to outer shell
    const AndrewPaymentAmountsArray = await AndrewPaymentAmounts;
    const AndrewPaymentDatesArray = await AndrewPaymentDates;
    console.log("Recent Andrew Payment Amounts: ");
    console.log(AndrewPaymentAmountsArray);
    console.log("Recent Andrew Payment dates: ");
    console.log(AndrewPaymentDatesArray);

    const allyExpensesArray = [
        //{mortgage: mortgageAmount},
        //{electricityBill: electricityBillAmount}
        //{DustinPayment: DustinPaymentAmount},
        //{DustinPayment: DustinPaymentAmount},
        //{AndrewPayment: AndrewPaymentAmount}
    ];

    const combinedAllyExpensesArray = [
        //{mortgage: mortgageAmount},
        //{electricityBill: electricityBillAmount}
        //{DustinPayment: DustinPaymentAmount},
        //{AndrewPayment: AndrewPaymentAmount}
    ];

    async function findThisMonthsTransactions(expenseName, amountsArray, datesArray) {
        //check each transaction date, if it matches the current month and year, grab the transaction amount with the corresponding index
        for (var i = 0; i < datesArray.length; i++) {
            const date = new Date(datesArray[i]);
            const month = date.getMonth();
            const year = date.getFullYear();
            // console.log(month);
            // console.log(year);

            //if the month and year match, then process the corresponding amount
            if (currentMonthIndex === month && fullYear === year) {
                // console.log(transferDatesArray[i])
                // console.log(transferAmountsArray[i])
                const processedAmount = Number(amountsArray[i].replace(/[^0-9.]/g, ''));
                const stringAmount = String(processedAmount);
                const expenseObject = {name: expenseName, amount: stringAmount, date: datesArray[i] }
                allyExpensesArray.push(expenseObject);
            }
        }
    };

    await findThisMonthsTransactions("mortgage", mortgageAmountsArray, mortgageDatesArray);
    await findThisMonthsTransactions("electricityBill", electricityBillAmountsArray, electricityBillDatesArray);
    await findThisMonthsTransactions("DustinPayments", DustinPaymentAmountsArray, DustinPaymentDatesArray);
    await findThisMonthsTransactions("AndrewPayments", AndrewPaymentAmountsArray, AndrewPaymentDatesArray);

    await combineExpenses(allyExpensesArray, combinedAllyExpensesArray);
    console.log("All Ally expenses: ")
    console.log(allyExpensesArray);
    console.log("Processed Ally expenses for export: ")
    console.log(combinedAllyExpensesArray);
    return combinedAllyExpensesArray;
};

// test('allyExtraction', async ({ page }) => {
//     test.setTimeout(1000000);
//     await allyExtraction(0, 2025);
// });
