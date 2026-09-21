import json
import os

files = [
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\Players Data.json'
]

# Updates configuration
updates_config = [
    {
        'search_mobile': '9491682365',
        'updates': {
            'status': 'NOT SELECTED'
        },
        'verify_name': 'NAGARAJU'
    }
]

for file_path in files:
    print(f"--------------------------------------------------")
    print(f"Processing {file_path}")
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            players = json.load(f)

        updated_count = 0
        
        for config in updates_config:
            found = False
            for p in players:
                # Check for match
                match = False
                pmobile = str(p.get('mobile', '')).strip()
                pname = str(p.get('name', '')).strip()
                
                if 'search_mobile' in config and pmobile == config['search_mobile']:
                    match = True
                
                if match:
                    print(f"Updating match: {pname} ({pmobile})")
                    for k, v in config['updates'].items():
                        print(f"  Change {k}: '{p.get(k)}' -> '{v}'")
                        p[k] = v
                    found = True
                    updated_count += 1
                    break 
            
            if not found:
                print(f"WARNING: Could not find player with mobile {config.get('search_mobile')}")

        if updated_count > 0:
            print(f"Saving {updated_count} updates to {file_path}...")
            # Write back with utf-8 to ensure special chars are preserved
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(players, f, indent=2)
            print("Save successful.")
        else:
            print("No updates applied.")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
