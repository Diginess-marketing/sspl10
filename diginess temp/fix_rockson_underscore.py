import json
import os

file_path = r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players_Data.json'

print(f"Processing {file_path}")

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        players = json.load(f)

    initial_count = len(players)
    print(f"Initial count: {initial_count}")

    # 1. Identify records to remove and update
    to_remove = []
    to_update = []

    for i, p in enumerate(players):
        pmobile = str(p.get('mobile', '')).strip()
        
        # Mark duplicate for removal
        if pmobile == '9940513638':
            print(f"Found duplicate to remove at index {i}: {p.get('name')} ({pmobile})")
            to_remove.append(i)
        
        # Mark correct record for update
        elif pmobile == '9940513628':
            print(f"Found correct record to update at index {i}: {p.get('name')} ({pmobile})")
            to_update.append(i)

    # 2. Apply updates FIRST
    for i in to_update:
        players[i]['status'] = "Selected for Level 1 and Level 2"
        print(f"Updated status for index {i}")

    # 3. Apply removals (in reverse order to preserve indices)
    for i in sorted(to_remove, reverse=True):
        removed = players.pop(i)
        print(f"Removed index {i}: {removed.get('name')}")

    final_count = len(players)
    print(f"Final count: {final_count}")

    if final_count < initial_count or to_update:
        print(f"Saving changes to {file_path}...")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(players, f, indent=2)
        print("Save successful.")
    else:
        print("No changes needed.")

except Exception as e:
    print(f"Error: {e}")
