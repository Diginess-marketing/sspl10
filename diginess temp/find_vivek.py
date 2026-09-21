import json
import os

files_to_check = [
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players_Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\src\data\level2Data.ts',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\src\data\level3Data.ts'
]

target_mobile = '9833608952'

for file_path in files_to_check:
    print(f"Checking {file_path}...")
    if not os.path.exists(file_path):
        print(f"  File not found.")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if target_mobile in content:
                print(f"  FOUND in {file_path}")
                # Print context if it's JSON
                if file_path.endswith('.json'):
                    try:
                        data = json.loads(content)
                        for p in data:
                            if str(p.get('mobile', '')).strip() == target_mobile:
                                print(f"    Record: {p}")
                    except:
                        pass
            else:
                print(f"  Not found.")
    except Exception as e:
        print(f"  Error reading file: {e}")
