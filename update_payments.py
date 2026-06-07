import sys

file_path = 'src/components/payments-page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    "import { useAppStore } from '@/lib/store';",
    "import { useAppStore } from '@/lib/store';\nimport { downloadInvoice, downloadMultipleInvoices } from '@/lib/pdf-utils';"
)

# 2. Add Export Invoices button
old_btn = '''<Button variant="outline" size="sm" onClick={handleExportCSV} className="transition-all duration-200 active:scale-[0.98]">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>'''
new_btn = '''<Button variant="outline" size="sm" onClick={handleExportCSV} className="transition-all duration-200 active:scale-[0.98]">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const paidPayments = payments.filter(p => p.status === 'paid');
            if (paidPayments.length === 0) {
              toast.error('No paid payments to export');
              return;
            }
            downloadMultipleInvoices(paidPayments);
            toast.success('Invoices downloaded');
          }} className="transition-all duration-200 active:scale-[0.98] text-blue-600 border-blue-200 hover:bg-blue-50">
            <Download className="h-4 w-4 mr-1" /> Export Invoices (PDF)
          </Button>'''

content = content.replace(old_btn, new_btn)

# 3. Add Invoice individual button
old_row = '''<Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditStatus(payment)}>
                            Edit
                          </Button>'''
new_row = '''{payment.status === 'paid' && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => downloadInvoice(payment)}>
                              Invoice
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditStatus(payment)}>
                            Edit
                          </Button>'''

content = content.replace(old_row, new_row)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File updated successfully.")
