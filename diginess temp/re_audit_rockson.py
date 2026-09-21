import json
import os

files = [
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players_Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\admin\react-app\src\Players_Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\dist\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\dist\Players_Data.json'
]

targets_mobile = ['9940513638', '9940513628']
target_name = 'rockson'

print("Starting Audit...")

for file_path in files:
    print(f"--- Analyzing {file_path} ---")
    if not os.path.exists(file_path):
        print("File not found.")
        continue
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            players = json.load(f)
            
        found = False
        for i, p in enumerate(players):
            pmobile = str(p.get('mobile', '')).strip()
            pname = str(p.get('name', '')).strip().lower()
            
            if pmobile in targets_mobile or target_name in pname:
                print(f"Index {i}: {json.dumps(p)}")
                found = True
        
        with open('re_audit_result.txt', 'a', encoding='utf-8') as outfile:
            outfile.write(f"--- Analyzing {file_path} ---\n")
            if found:
                # Iterate again or store results
                for i, p in enumerate(players):
                    pmobile = str(p.get('mobile', '')).strip()
                    pname = str(p.get('name', '')).strip().lower()
                    
                    if 'rockson' in pname or '994051' in pmobile:
                        output = f"Index {i}: {json.dumps(p)}\n"
                        print(output.strip())
                        outfile.write(output)
            else:
                msg = "No Rockson records found.\n"
                print(msg.strip())
                outfile.write(msg)
            
    except Exception as e:
        print(f"Error: {e}")
