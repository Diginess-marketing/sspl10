const fs = require('fs');
const path = require('path');

const testScript = fs.readFileSync('test_ms_graph_email.mjs', 'utf-8');

// We replace the single sendEmail() call at the bottom with our bulk logic
const bulkLogic = `
const xlsx = require('xlsx');

async function sendBulk() {
  const workbook = xlsx.readFile('C:/Users/ADMIN/Downloads/Successful_Registrations_(Coimbatore_Campaign)_List (2).xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(\`Found \${data.length} records. Starting bulk email...\`);
  const accessToken = await getAccessToken();

  for (const row of data) {
    if (!row.email) {
      console.log('Skipping row without email:', row);
      continue;
    }
    
    const emailData = {
      email: row.email,
      playerName: row.name || 'Hero'
    };

    console.log(\`Sending to \${emailData.playerName} <\${emailData.email}>\`);
    
    const htmlBody = generateEmailTemplate(emailData);
    
    const emailPayload = {
      message: {
        subject: \`Welcome to SSPL – Your Trial is Scheduled for 18 July 2026\`,
        body: {
          contentType: 'HTML',
          content: htmlBody
        },
        toRecipients: [
          {
            emailAddress: {
              address: emailData.email,
              name: emailData.playerName
            }
          }
        ],
        from: {
          emailAddress: {
            address: senderEmail,
            name: 'SSPL T10'
          }
        }
      },
      saveToSentItems: true
    };

    const sendMailUrl = \`\${GRAPH_API_BASE}/users/\${senderEmail}/sendMail\`;

    try {
      const response = await fetch(sendMailUrl, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(\`Failed to send to \${emailData.email}: \${response.status} \${error}\`);
      } else {
        console.log(\`Success: \${emailData.email}\`);
      }
    } catch (e) {
      console.error(\`Exception sending to \${emailData.email}: \`, e.message);
    }

    // Delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Bulk email completed.');
}

sendBulk().catch(console.error);
`;

const newScript = testScript.replace('sendEmail().catch(console.error);', bulkLogic);

fs.writeFileSync('bulk_send_coimbatore.mjs', newScript);
console.log('Created bulk_send_coimbatore.mjs');
