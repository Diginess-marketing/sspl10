import json
import os

files = [
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players_Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\admin\react-app\src\Players_Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\dist\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\dist\Players_Data.json'
]

target_mobile = '9833608952'
new_name = "VIVEK VISHWAS KAMBLE"

for file_path in files:
    if not os.path.exists(file_path):
        continue
        
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            players = json.load(f)
            
        updated = False
        for p in players:
            if str(p.get('mobile', '')).strip() == target_mobile:
                print(f"  Found {p['name']}, updating to {new_name}")
                p['name'] = new_name
                updated = True
                
        if updated:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(players, f, indent=2)
            print("  Saved.")
        else:
            print("  Mobile not found.")
            
    except Exception as e:
        print(f"  Error: {e}")
