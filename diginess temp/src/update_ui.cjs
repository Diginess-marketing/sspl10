const fs = require('fs');
const file = 'd:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\src\\components\\PlayerRegistrationStepper.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. PlayerDetails interface
content = content.replace('pincode: string;', 'pincode: string;\n  school_name: string;');

// 2. formData
content = content.replace("pincode: '',\n    utm_campaign: getUTMCampaign(),", "pincode: '',\n    school_name: '',\n    utm_campaign: getUTMCampaign(),");

// 3. newPlayers.push
content = content.replace("position: '',\n              pincode: ''\n            });", "position: '',\n              pincode: '',\n              school_name: ''\n            });");

// 4. validatePlayer
content = content.replace("if (!player.full_name || !player.email || !player.phone || !player.position) return false;", "if (!player.full_name || !player.email || !player.phone || !player.position || !player.school_name.trim()) return false;");

// 5. individual validation
content = content.replace("if (!formData.position) { errors.position = true; isValid = false; }\n      if (!acceptTerms) {", "if (!formData.position) { errors.position = true; isValid = false; }\n      if (!formData.school_name.trim()) { errors.school_name = true; isValid = false; }\n      if (!acceptTerms) {");

// 6. team validation (forEach)
content = content.replace("if (!p.full_name.trim() || !p.email.trim() || !p.email.includes('@') || !p.phone || p.phone.length !== 10 || !p.date_of_birth || !p.position) {", "if (!p.full_name.trim() || !p.email.trim() || !p.email.includes('@') || !p.phone || p.phone.length !== 10 || !p.date_of_birth || !p.position || !p.school_name.trim()) {");

// 7. team validation (some)
content = content.replace("if (!isValid && teamDetails.players.some(p => !p.full_name || !p.email || !p.phone || !p.date_of_birth || !p.position)) {", "if (!isValid && teamDetails.players.some(p => !p.full_name || !p.email || !p.phone || !p.date_of_birth || !p.position || !p.school_name.trim())) {");

// 8. playersPayload
content = content.replace("position: player.position,\n          pincode: player.pincode || null,", "position: player.position,\n          school_name: player.school_name,\n          pincode: player.pincode || null,");

// 9. payload (individual)
content = content.replace("position: formData.position,\n          payment_status: 'pending',", "position: formData.position,\n          school_name: formData.school_name,\n          payment_status: 'pending',");

// 10. Individual UI
const individualUIOrig = `</select>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">`;

const individualUINew = `</select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold !text-black mb-2">School/College Name *</label>
                        <input
                          type="text"
                          name="school_name"
                          value={formData.school_name}
                          onChange={handleInputChange}
                          className={\`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium \${fieldErrors.school_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}\`}
                          placeholder="Enter your school or college name"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mt-4">`;
content = content.replace(individualUIOrig, individualUINew);


// 11. Team UI
const teamUIOrig = `</select>
                            </div>
                          </div>
                        </div>`;

const teamUINew = `</select>
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[10px] font-bold !text-black uppercase mb-1">School/College Name</label>
                              <input type="text" name="school_name" value={player.school_name} onChange={e => handleInputChange(e, index)} placeholder="School name" className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm !text-black font-medium transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent" />
                            </div>
                          </div>
                        </div>`;
content = content.replace(teamUIOrig, teamUINew);

fs.writeFileSync(file, content);
console.log('Replacements completed successfully.');
