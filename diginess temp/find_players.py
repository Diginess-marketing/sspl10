import json
import os

file_path = r'd:\ssplt10.cloud-prod-sync-20251006\httpdocs\public\Players Data.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        players = json.load(f)

    targets = [
        {'type': 'mobile', 'value': '9491682365'}
    ]

    with open('players_found.txt', 'w', encoding='utf-8') as outfile:
        print(f"Searching {len(players)} players...")
        outfile.write(f"Searching {len(players)} players...\n")

        for i, p in enumerate(players):
            for target in targets:
                match = False
                if target['type'] == 'mobile' and str(p.get('mobile', '')) == target['value']:
                    match = True
                elif target['type'] == 'name' and target['value'].lower() in str(p.get('name', '')).lower():
                    match = True
                
                if match:
                    output = f"Found match for {target['value']}: Index {i}\n{json.dumps(p, indent=2)}\n"
                    print(output)
                    outfile.write(output)

except Exception as e:
    print(f"Error: {e}")
