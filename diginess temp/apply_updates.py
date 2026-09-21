import json
import os

files = [
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players Data.json',
    r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\Players Data.json'
]

# Updates configuration
# Keyed by 'search_mobile' or 'search_name' if mobile needs update or not found
updates_config = [
    {
        'search_mobile': '9940513628',
        'updates': {
            'status': 'Selected for Level 1 and Level 2'
        },
        'verify_name': 'ROCKSON'
    },
    {
        'search_mobile': '9150760149',
        'updates': {
            'status': 'Selected for Level 1 and Level 2'
        },
        'verify_name': 'SARAN'
    },
    {
        'search_mobile': '9005069369',
        'updates': {
            'status': 'Selected for Level 1, Level 2, Level 3'
        },
        'verify_name': 'AMAN'
    },
    {
        'search_mobile': '9491682365',
        'updates': {
            'status': 'Selected for Level 1'
        },
        'verify_name': 'NAGARAJU'
    },
    {
        'search_mobile': '9833608952',
        'updates': {
            'name': 'VIVEK VISHWAS KAMBLE'
        },
        'verify_name': 'VIVEK'
    },
    {
        'search_mobile': '9342764815', # Searching OLD mobile
        'updates': {
            'mobile': '9342768415',
            'name': 'DINESH KARANK'
        },
        'verify_name': 'DINESH'
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
                
                # Verify name partial match to be sure
                if match and config['verify_name'].lower() not in pname.lower():
                    print(f"WARNING: Mobile match {pmobile} but name mismatch. Found '{pname}', expected part '{config['verify_name']}'. Skipping safely.")
                    match = False
                
                if match:
                    print(f"Updating match: {pname} ({pmobile})")
                    for k, v in config['updates'].items():
                        print(f"  Change {k}: '{p.get(k)}' -> '{v}'")
                        p[k] = v
                    found = True
                    updated_count += 1
                    # Break player loop, move to next config (assuming unique players)
                    break 
            
            if not found:
                print(f"WARNING: Could not find player with mobile {config.get('search_mobile')}")

        if updated_count > 0:
            print(f"Saving {updated_count} updates to {file_path}...")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(players, f, indent=2)
            print("Save successful.")
        else:
            print("No updates applied.")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
