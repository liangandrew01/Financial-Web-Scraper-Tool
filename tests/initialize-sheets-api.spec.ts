// Import the Google APIs library
import { google } from 'googleapis'; // google (main toolbox) - an object that contains different Google API services (Sheets, Drive, etc.)
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export async function initializeSheetsAPI() {
    // .auth (drawer for authentication tools) is a sub-object within google that deals with authentication
    // GoogleAuth (credential manager tool for service account authorization) - a class within google.auth like logging into Google using your service account
    // const auth (passport office that prepares the authentication in the next step) is an object instance of the GoogleAuth class. It prepares the authentication process
    // you use the keyFile to request authentication at the passport office
    const auth = new google.auth.GoogleAuth({ // declaring the authentication setup
        keyFile: '../web-scraper/service-account-file.json', // ID you show at the entrace to get badge (client) in next step
        scopes: ['https://www.googleapis.com/auth/spreadsheets'], // defines what the client (created in the next steps) is allowed to do (e.g. read/write spreadsheets)
    });

    // .getClient: Get an authenticated client (remote control with ID badge that carries credentials) at the passport office (auth) that will be able to send authorized requests
    // authentication token (visa stamp) is generated and attached to remote ensures only authorized requests go through
    // client is remote control (passport) that can interact with Google Sheets API (access restricted rooms)
    // const client (your passport with a valid visa/token) - proves your identity and lets you enter restricted areas (Google APIs)
    // const client (your logged in google account)
    const client = await auth.getClient();

    // Initialize the Sheets API for version 4 using the authenticated client
    // google.sheets() creates an instance of the Sheets API by passing in the authenticated client; like selecting the Google Sheets “channel” on your remote control
    // sheets is like an app on your phone (Google Sheets app) that has the toolset or methods to interact with the spreadsheet like sheets.spreadsheets.values.get()
    // client doesn't know about Google sheets specifically; it just allows access to Google APIs in general. It’s like logging into your Google account—you’re authorized but haven’t opened any specific service yet.
    // sheets is the final API interface that lets your interact with Google Sheets using client's authorization
    const sheets = google.sheets({ version: 'v4', auth: client });

    // const spreadsheetId = '1ZBWRzwUrvm5FxA1i6b3Csc5cFWnQaegYpb02ayo6hSk'; // Replace with your actual Google Spreadsheet ID
    const spreadsheetId = '1HsOYR7bb_kDP_hWvLbKaoBI0X7UICSxj-LroUuFO8yg'; // Replace with your actual Google Spreadsheet ID
    
    return [sheets, spreadsheetId];
};

// test('initializeSheetsAPI', async () => {
//     await initializeSheetsAPI();
// });
