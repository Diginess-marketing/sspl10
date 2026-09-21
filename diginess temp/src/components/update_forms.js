const fs = require('fs');
const path = require('path');

const dir = 'd:/ssplt10.cloud-prod-sync-20251006/httpdocs/src/components';

const filesToUpdate = [
    'PlayerRegistrationStepper.tsx',
    'SelectorRegistrationForm.tsx',
    'TournamentOrganizerRegistration.tsx',
    'SimplePlayerRegistrationForm.tsx'
];

filesToUpdate.forEach(file => {
    let filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace general wrappers
        content = content.replace(/bg-white rounded-\[2rem\] shadow-2xl overflow-hidden border border-slate-100/g, 'bg-[#0A1628] glass-card rounded-[2rem] shadow-2xl overflow-hidden border border-white/10');
        
        // Replace inputs
        content = content.replace(/bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-black font-medium/g, 
            'bg-white/5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-white font-medium');
            
        content = content.replace(/border-slate-200/g, 'border-white/20');
        
        // Replace selects
        content = content.replace(/bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black font-medium/g, 
            'bg-white/5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all text-white font-medium');

        content = content.replace(/focus:border-blue-500/g, 'focus:border-transparent');
        
        // Text colors
        content = content.replace(/text-black/g, 'text-white');
        content = content.replace(/text-slate-500/g, 'text-white/60');
        content = content.replace(/text-gray-700/g, 'text-white/80');

        // Checkbox wrappers
        content = content.replace(/bg-blue-50 rounded-xl border border-blue-100/g, 'bg-white/5 rounded-xl border border-white/10');
        content = content.replace(/text-blue-800/g, 'text-white/80');

        // Replace Summary boxes
        content = content.replace(/bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100/g, 'bg-white/5 rounded-2xl p-6 border-2 border-white/10');
        content = content.replace(/text-emerald-600/g, 'text-[#00B4D8]');
        content = content.replace(/border-emerald-100/g, 'border-white/10');
        content = content.replace(/border-emerald-200/g, 'border-white/10');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + file);
    }
});
