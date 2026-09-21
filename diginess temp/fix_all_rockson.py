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

print("Starting Global Fix...")

for file_path in files:
    print(f"--------------------------------------------------")
    print(f"Processing {file_path}")
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            players = json.load(f)

        initial_count = len(players)
        to_remove = []
        to_update = []

        for i, p in enumerate(players):
            pmobile = str(p.get('mobile', '')).strip()
            
            # 1. Flag for removal (Duplicate/Wrong Mobile)
            if pmobile == '9940513638':
                print(f"  [REMOVE] Found duplicate/wrong record at index {i}: {p.get('name')} ({pmobile})")
                to_remove.append(i)
            
            # 2. Flag for update (Correct Mobile)
            elif pmobile == '9940513628':
                # Check if status needs update
                if p.get('status') != "Selected for Level 1 and Level 2":
                    print(f"  [UPDATE] Found correct record at index {i} with old status: {p.get('status')}")
                    to_update.append(i)
                else:
                    print(f"  [OK] Found correct record at index {i} with correct status.")

        # Apply Updates
        for i in to_update:
            players[i]['status'] = "Selected for Level 1 and Level 2"
            print(f"  -> Updated status for index {i}")

        # Apply Removals (reverse order)
        for i in sorted(to_remove, reverse=True):
            removed = players.pop(i)
            print(f"  -> Removed index {i}")

        final_count = len(players)

        if final_count < initial_count or to_update:
            print(f"Saving changes to {file_path}...")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(players, f, indent=2)
            print("Save successful.")
        else:
            print("No changes needed/applied.")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
