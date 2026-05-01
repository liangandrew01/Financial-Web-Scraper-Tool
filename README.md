# Financial Web Scraper Tool

<img width="1191" height="582" alt="screenshot for Web Scraper readme" src="https://github.com/user-attachments/assets/2f2a79d8-780b-4dce-937d-519a0738cd7a" />

Uses Playwright to automatically login to various financial accounts: Bank of America Online Banking, Ally Bank

Retrieves one-time passwords and Venmo transactions from SMS via Android Debug Bridge (requires phone to be connected via USB and Developer Tools enabled)

Extracts messages from Signal Desktop via decryption key

Syncs results to Google Sheets via Google Sheets API

Implemented text parsing and regex-based extraction to structure unformatted financial data

Managed credentials securely using environment variables and SOPS
