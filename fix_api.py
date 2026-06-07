import sys

file_path = 'src/app/api/payments/bulk/route.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const results = [];",
    "const results: any[] = [];"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
