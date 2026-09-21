const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const emails = [
"prn0912@gmail.com",
"millenniumsportsclub16@gmail.com",
"mkalaiyarasan92@gmail.com",
"murugan.6374052122@gmail.com",
"ganeshally81@gmail.com",
"praweinpk@gmail.com",
"vickeychandru01@gmail.com",
"psraosubhashini.s@gimail.com",
"ushabhushan2009@gmail.com",
"varkalmohanraj@gmail.com",
"omyamore33@gmail.com",
"devalamsathish2@gmail.com",
"tosifsaiyyad1990@gmail.com",
"singhrakesh95168@gmail.com",
"dokkavijaykumar2@gmail.com",
"basharathussain0123wani@gmail.com",
"sathishsri404@gmail.com",
"rahmancricket3@gmail.com",
"ranjithrandy43@gmail.com",
"ullaskrishnanaik07@gmail.com",
"sabarisekar2111@gmail.com",
"bodakuntisunitha81572@gmail.com",
"manjuajith6671@gmail.com",
"arulnatraj12@gmail.com",
"praveenrajkolakaluri18@gamail.com",
"gunagg153@gmail.com",
"vikasblr016@gmail.com",
"arjunbhosale20@gmail.com",
"naveenkumark2008@gmail.com",
"v.saisantuchinni@gmail.com",
"vengatachalapathy12@gmail.com",
"maheshyalla32@gmail.com",
"shanukhatoon0786@gmail.com",
"krashnvir@gmail.com",
"ssaalliimm7291@gmail.com",
"devstar549@gmail.com",
"aliking99479@gmail.com",
"sahilshaikh39634@gmail.com",
"jackeysingh1995@gmail.com",
"vikas.90.sikarwar@gmail.com",
"s9050908084@gmail.com",
"gvenkeyg84@gmail.com",
"azharshaikh1562003@gmail.com",
"shanukhatoon0786@gmail.com",
"ssurajsharma71@gmail.com",
"oso89216@gmail.com",
"adhikesavan3737@gmail.com",
"praveen.crazetex@gmail.com",
"sathishrathod9346@gmail.com",
"rahimsheikh00109@gmail.com",
"stephensteveb7@gmail.com",
"santhoshthekkada1@gmail.com",
"kherwalnakul6@gmail.com",
"manimony1996@gmail.com",
"prashantkuchabnadiya@gmail.com",
"jacson111rahul@gmail.com",
"shivapeddi6@gmail.com"
];

async function run() {
  const { data, error } = await supabase
    .from('player_registrations')
    .select('*')
    .in('email', emails);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }
  
  // Create a map to ensure we get a row for every requested email, even if missing
  const dataMap = {};
  data.forEach(row => {
      dataMap[row.email.toLowerCase()] = row;
  });
  
  let csvContent = "Email,Name,Mobile\n";
  
  emails.forEach(email => {
      const emailLower = email.toLowerCase().trim();
      const row = dataMap[emailLower];
      if (row) {
          // Fields might be name, first_name, last_name, phone, mobile
          const name = row.full_name || 'N/A';
          const mobile = row.phone || 'N/A';
          csvContent += `"${emailLower}","${name}","${mobile}"\n`;
      } else {
          csvContent += `"${emailLower}","NOT FOUND","NOT FOUND"\n`;
      }
  });

  const outputPath = 'player_contact_info.csv';
  fs.writeFileSync(outputPath, csvContent);
  console.log(`Successfully wrote CSV with ${emails.length} entries to ${outputPath}`);
}

run();
