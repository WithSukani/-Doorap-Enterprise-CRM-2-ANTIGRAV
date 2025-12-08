
import re
import os

files_to_fix = [
    'complete_schema.sql',
    'seed.sql'
]

# Invalid Prefix -> Valid Hex Replacement
mapping = {
    'g0': '20',
    'h0': '30',
    'i0': '40',
    'j0': '50',
    'k0': '60',
    'm0': '70',
    'n0': '80',
    'o0': '90',
    'p0': 'a1',
    'q0': 'a2',
    'r0': 'a3',
    's0': 'a4',
    't0': 'a5',
    'u0': 'a6',
    'v0': 'a7',
    'w0': 'a8'
}

def replace_uuids(content):
    # Pattern 1: Start of UUID (e.g., g0eebc99...)
    # We look for [g-w]0 followed by eebc99
    def replace_prefix(match):
        invalid_part = match.group(1)
        return mapping.get(invalid_part, invalid_part) + 'eebc99'

    content = re.sub(r'([g-w]0)eebc99', replace_prefix, content)

    # Pattern 2: End of UUID (e.g., ...380g01)
    # We look for 380 followed by [g-w]0
    def replace_suffix(match):
        invalid_part = match.group(1)
        return '380' + mapping.get(invalid_part, invalid_part)

    content = re.sub(r'380([g-w]0)', replace_suffix, content)
    return content

for filename in files_to_fix:
    if os.path.exists(filename):
        print(f"Processing {filename}...")
        with open(filename, 'r') as f:
            content = f.read()
        
        new_content = replace_uuids(content)
        
        if content != new_content:
            with open(filename, 'w') as f:
                f.write(new_content)
            print(f"Fixed UUIDs in {filename}")
        else:
            print(f"No changes needed for {filename}")
    else:
        print(f"File not found: {filename}")
