import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';
import { ClientSecretCredential } from '@azure/identity';
import xlsx from 'xlsx';
import 'isomorphic-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const TENANT_ID = process.env.MSGRAPH_TENANT_ID;
const CLIENT_ID = process.env.MSGRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.MSGRAPH_CLIENT_SECRET;
const FROM_EMAIL = process.env.MSGRAPH_FROM_EMAIL;
const EXCEL_PATH = "C:\\Users\\ADMIN\\Downloads\\Fully_Selected_List (2) (1).xlsx";

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !FROM_EMAIL) {
    console.error("Missing MSGRAPH environment variables in .env");
    process.exit(1);
}

// 1. Authenticate with Graph
const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
});

const client = Client.initWithMiddleware({
    authProvider
});

// 2. Read Excel File
if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Excel file not found at ${EXCEL_PATH}`);
    process.exit(1);
}

const workbook = xlsx.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log(`Found ${data.length} rows in the Excel file.`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendEmails() {
    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
        // Find columns dynamically in case of whitespace/case issues
        const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name'));
        const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
        const timingKey = Object.keys(row).find(k => k.toLowerCase().includes('timing'));

        const playerName = nameKey ? row[nameKey] : undefined;
        const emailId = emailKey ? row[emailKey] : undefined;
        // Default to '08 Am - 09 Am' if timing column isn't found or is empty
        const timing = (timingKey && row[timingKey]) ? row[timingKey] : '08 Am - 09 Am';

        if (!playerName || !emailId) {
            console.warn("Skipping row due to missing name or email:", row);
            failCount++;
            continue;
        }

        const emailBody = `Dear ${playerName} 🔥

Congratulations! You have qualified for SSPL Level 4 – Technical & Simulation Trials.

📍 Venue:
Nexus, Royapettah
232/272, Avvai Shanmugham Salai,
Azad Nagar, Royapettah,
Chennai, Tamil Nadu – 600014

📍 Location Link:
https://share.google/cmCahPXRtdlQELegl

Date:
Saturday, 18th July 2026

Reporting Time:
${timing}

⚠️ Important Instructions:
* Players must report 30 minutes prior to their allotted reporting time.
* Players must wear proper sports attire and sports shoes.
* Players must carry a printed copy of this email along with a valid Government-issued ID proof.
* Players should bring their own cricket kit if available.

This is your chance to showcase your skills at the next stage of the SSPL selection process. Give it your best and make every moment count! 

All the very best for Level 4!

Warm Regards,
SSPL Team`;

        const message = {
            subject: 'SSPL Level 4 – Technical & Simulation Trials',
            body: {
                contentType: 'Text',
                content: emailBody
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: emailId
                    }
                }
            ]
        };

        try {
            console.log(`Sending email to ${playerName} (${emailId}) ...`);
            await client.api(`/users/${FROM_EMAIL}/sendMail`).post({ message });
            console.log(`✅ Success: ${emailId}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed: ${emailId}`, error.message || error);
            failCount++;
        }

        // Slight delay to prevent rate limits
        await sleep(500);
    }

    console.log(`\nDone. Successfully sent: ${successCount}. Failed: ${failCount}`);
}

sendEmails().catch(console.error);
