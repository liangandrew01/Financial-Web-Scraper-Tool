import { test, expect } from '@playwright/test';
// const { chromium } = require('@playwright/test');
// const fs = require('fs');

test('BoA', async ({ page }) => {
    test.setTimeout(100000);
    await page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2Fb%2F0%2FAddMailService&followup=https%3A%2F%2Faccounts.google.com%2Fb%2F0%2FAddMailService&ifkv=AcMMx-fhz1fKCAzfuUdivGTi6iDpFnBUWaVUAg6gar_S31mWSPizeikz_ub2V-Zo44cTDFNj7Zk3Nw&passive=1209600&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-65362539%3A1731701483596916&ddm=1');
    
    const emailField = await page.locator('#identifierId');
    await emailField.fill('arturosrodrigo@gmail.com');
    const emailNextButton = await page.locator('#identifierNext > div > button');
    await emailNextButton.click();

    await page.waitForSelector('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input', {timeout: 100000});
    const pwdField = await page.locator('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
    await pwdField.fill('Bceltics20!');
    const pwdNextButton = await page.locator('#passwordNext > div > button');
    await pwdNextButton.click();

    // const info = await page.getByText('Compose').getAttribute('jscontroller');

    const waitForCompose = await page.waitForSelector('body > div:nth-child(22) > div.nH > div > div.nH.aqk.aql.bkL > div.aeN.WR.baA.nH.oy8Mbf > div.aic > div > div', {state: "attached", timeout: 100000});
    const extractCompose = await waitForCompose.textContent();
    console.log("********************************")
    console.log(extractCompose);
    console.log("********************************")
});

