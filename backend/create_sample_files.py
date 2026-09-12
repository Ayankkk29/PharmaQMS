import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)

# 1. Create PDF Sample
pdf_path = os.path.join(SAMPLES_DIR, "sample_paracetamol_complaint.pdf")
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
)

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=18,
    textColor=colors.HexColor('#0F172A'),
    spaceAfter=6
)
subtitle_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=11,
    textColor=colors.HexColor('#64748B'),
    spaceAfter=15
)
heading_style = ParagraphStyle(
    'SectionHeading',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=12,
    textColor=colors.HexColor('#1E293B'),
    spaceBefore=10,
    spaceAfter=6
)
body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#334155')
)
disclaimer_style = ParagraphStyle(
    'Disclaimer',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=9,
    leading=12,
    textColor=colors.HexColor('#DC2626')
)

elements = []

elements.append(Paragraph("SYNTHETIC DEMONSTRATION CUSTOMER COMPLAINT", title_style))
elements.append(Paragraph("ABC Healthcare Distribution — Product Quality Notification", subtitle_style))
elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15))

elements.append(Paragraph("<b>[DEMONSTRATION ONLY]</b> This is a synthetic demonstration sample generated solely for software testing. It does not represent a real pharmaceutical complaint or actual batch.", disclaimer_style))
elements.append(Spacer(1, 10))

table_data = [
    [Paragraph("<b>Product Name:</b>", body_style), Paragraph("Paracetamol Tablets 500 mg", body_style)],
    [Paragraph("<b>Product Code:</b>", body_style), Paragraph("PCM500", body_style)],
    [Paragraph("<b>Batch / Lot Number:</b>", body_style), Paragraph("PCM240731", body_style)],
    [Paragraph("<b>Market / Jurisdiction:</b>", body_style), Paragraph("India", body_style)],
    [Paragraph("<b>Customer Name:</b>", body_style), Paragraph("ABC Healthcare Distribution", body_style)],
    [Paragraph("<b>Complaint Date:</b>", body_style), Paragraph("12 September 2026", body_style)],
    [Paragraph("<b>Quantity Affected:</b>", body_style), Paragraph("15 strips (retained at distributor)", body_style)]
]

t = Table(table_data, colWidths=[150, 370])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
    ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
    ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
elements.append(t)

elements.append(Spacer(1, 15))
elements.append(Paragraph("Detailed Defect Description", heading_style))
desc_text = (
    "The customer reported that several tablets from Batch PCM240731 appeared discolored compared with previous batches.<br/><br/>"
    "Approximately 15 strips were identified with the issue during incoming warehouse receiving inspection.<br/><br/>"
    "No adverse event has been reported at this time.<br/><br/>"
    "The customer has retained physical samples in quarantine and requested a formal quality investigation."
)
elements.append(Paragraph(desc_text, body_style))

doc.build(elements)
print(f"Generated PDF sample: {pdf_path}")

# 2. Create EML Sample
eml_path = os.path.join(SAMPLES_DIR, "sample_paracetamol_complaint.eml")
eml_content = """From: quality@abchealthcare.co.in
To: qms-intake@pharmamanufacturer.com
Date: Sat, 12 Sep 2026 10:15:00 +0530
Subject: DEMO ONLY - Customer Complaint Notification: Paracetamol Tablets 500 mg (Batch PCM240731)

SYNTHETIC DEMONSTRATION CUSTOMER COMPLAINT
(For local system testing only - Not a real pharmaceutical complaint)

Customer Complaint Details:
----------------------------------------
Product: Paracetamol Tablets 500 mg
Product Code: PCM500
Batch Number: PCM240731
Market: India
Customer: ABC Healthcare Distribution
Complaint Date: 12 September 2026

Description:
The customer reported that several tablets from Batch PCM240731 appeared discolored compared with previous batches.
Approximately 15 strips were identified with the issue.
No adverse event has been reported at this time.
The customer has retained samples and requested an investigation.

Best Regards,
Quality Control Manager
ABC Healthcare Distribution
"""

with open(eml_path, "w", encoding="utf-8") as f:
    f.write(eml_content)
print(f"Generated EML sample: {eml_path}")

# 3. Create TXT Sample
txt_path = os.path.join(SAMPLES_DIR, "sample_paracetamol_complaint.txt")
with open(txt_path, "w", encoding="utf-8") as f:
    f.write(eml_content)
print(f"Generated TXT sample: {txt_path}")
