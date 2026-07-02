from fpdf import FPDF
from fpdf.fonts import FontFace

pdf = FPDF()
pdf.add_page()
pdf.set_font('helvetica', size=10)

headings_style = FontFace(color=(255, 255, 255), fill_color=(0, 51, 102), emphasis='B')

with pdf.table(
    col_widths=(40, 60, 40),
    headings_style=headings_style,
    cell_fill_color=(240, 248, 255),
    cell_fill_mode="ROWS",
    line_height=6,
    text_align="LEFT"
) as table:
    row = table.row()
    row.cell("Module Name")
    row.cell("Feature Name")
    row.cell("Status")
    
    row = table.row()
    row.cell("Admissions")
    row.cell("Onboarding Wizard")
    row.cell("Implemented")
    
    row = table.row()
    row.cell("Attendance")
    row.cell("Roll Call")
    row.cell("Implemented")

pdf.output('c:/VikasSchool/EduTrack-SaaS-Independent/.temp/test_table.pdf')
print("Successfully generated test PDF")
