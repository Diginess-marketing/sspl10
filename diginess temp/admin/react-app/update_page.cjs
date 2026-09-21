const fs = require('fs');

const path = 'd:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\admin\\react-app\\src\\pages\\TrialsWorkflowPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update activeTab default
content = content.replace("const [activeTab, setActiveTab] = useState('completed')", "const [activeTab, setActiveTab] = useState('bucket')");

// Remove Trials List button
const btnStart = content.indexOf("<button\n                        onClick={() => setActiveTab('completed')}");
if (btnStart !== -1) {
    const btnEnd = content.indexOf("</button>", btnStart) + 9;
    content = content.substring(0, btnStart) + content.substring(btnEnd);
}

// Remove Trials List Tab content block
const tabStart = content.indexOf("{/* Trials List Tab */}");
if (tabStart !== -1) {
    const tabEndStr = "</div>\n                        </div>\n                    )}";
    const tabEnd = content.indexOf(tabEndStr, tabStart) + tabEndStr.length;
    if (tabEnd > tabStart) {
        content = content.substring(0, tabStart) + content.substring(tabEnd);
    }
}

// Update hideCalled in Trials Bucket
content = content.replace("<TrialLevelView level={1} hideCalled={true} />", "<TrialLevelView level={1} />");

fs.writeFileSync(path, content);
console.log("Done");
