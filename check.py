import sys
import re

file_path = 'src/components/payments-page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure imports are correct
if 'downloadInvoice' in content:
    print('Import exists.')

if 'Export Invoices' in content:
    print('Export Invoices button exists.')

if 'onClick={() => downloadInvoice(payment)}' in content:
    print('Invoice button exists.')

