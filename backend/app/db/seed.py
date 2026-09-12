import logging
from sqlalchemy.future import select
from app.db.models import ProductModel, ComplaintModel

logger = logging.getLogger("pharma_qms.seed")

INITIAL_PRODUCTS = [
    {
        "product_code": "API-PAR-001",
        "product_name": "Paracetamol Active Pharmaceutical Ingredient",
        "type": "API",
        "dosage_form": "Micronized Powder",
        "strength": "100%",
        "manufacturer_site": "Hyderabad API Plant Alpha"
    },
    {
        "product_code": "API-MET-002",
        "product_name": "Metformin Hydrochloride API",
        "type": "API",
        "dosage_form": "Crystalline Powder",
        "strength": "99.5%",
        "manufacturer_site": "Vizag Chemical Synthesis Facility"
    },
    {
        "product_code": "FDF-AMO-101",
        "product_name": "Amoxicillin Trihydrate 500mg Capsules",
        "type": "FDF",
        "dosage_form": "Hard Gelatin Capsule",
        "strength": "500mg",
        "manufacturer_site": "Baddi FDF Formulation Unit 2"
    },
    {
        "product_code": "FDF-INS-202",
        "product_name": "Insulin Glargine 100 U/mL Injection",
        "type": "FDF",
        "dosage_form": "Sterile Solution in Cartridge",
        "strength": "100 U/mL",
        "manufacturer_site": "Bengaluru Biologics Unit"
    },
    {
        "product_code": "FDF-ATO-303",
        "product_name": "Atorvastatin Calcium 20mg Film-Coated Tablets",
        "type": "FDF",
        "dosage_form": "Film-Coated Tablet",
        "strength": "20mg",
        "manufacturer_site": "Goa Solid Oral Dosage Plant"
    }
]

HISTORICAL_COMPLAINTS = [
    {
        "complaint_number": "CMP-2026-0001",
        "product_name": "Metformin Hydrochloride API",
        "product_code": "API-MET-002",
        "batch_number": "B-MET-8841",
        "dosage_form": "Crystalline Powder",
        "strength": "99.5%",
        "manufacturing_date": "2026-08-01",
        "expiry_date": "2029-08-01",
        "complaint_received_date": "2026-09-02",
        "customer_name": "Dr. Sarah Jenkins",
        "market": "APAC Commercial Bulk",
        "country": "India",
        "complaint_category": "Impurities / Discoloration",
        "complaint_description": "Yellowish specks observed in bulk API drum; slower dissolution rate recorded during customer QC intake testing.",
        "quantity_affected": "50 kg drum",
        "adverse_event": False,
        "quality_issue": "Discoloration and 12% delay in dissolution spec.",
        "initial_assessment": "Quarantine drum #4; request supplier Certificate of Analysis audit.",
        "severity": "MAJOR",
        "probability": 3,
        "detectability": 2,
        "risk_level": "MEDIUM",
        "investigation_recommendation": "Inspect vendor crystallization reactor temperature and filtration mesh.",
        "capa_recommendation": "Recalibrate line temperature sensors and implement inline particulate monitor.",
        "status": "UNDER_INVESTIGATION",
        "source_type": "EMAIL",
        "raw_content": "Customer reported yellow specks and dissolution delay in Metformin HCl batch B-MET-8841 received on Sept 1, 2026.",
        "is_complete": True,
        "missing_fields": [],
        "is_potential_duplicate": False
    },
    {
        "complaint_number": "CMP-2026-0002",
        "product_name": "Amoxicillin Trihydrate 500mg Capsules",
        "product_code": "FDF-AMO-101",
        "batch_number": "LOT-AMO-9920",
        "dosage_form": "Hard Gelatin Capsule",
        "strength": "500mg",
        "manufacturing_date": "2026-07-15",
        "expiry_date": "2028-07-15",
        "complaint_received_date": "2026-09-05",
        "customer_name": "Mark Thornton, RPh",
        "market": "US Hospital Pharmacy",
        "country": "USA",
        "complaint_category": "Packaging Breach",
        "complaint_description": "Blister pack aluminum foil pinholes and capsule shell cracking observed upon unboxing.",
        "quantity_affected": "12 cartons",
        "adverse_event": False,
        "quality_issue": "Potential breach of sterility and product potency loss.",
        "initial_assessment": "Immediate quarantine of batch LOT-AMO-9920.",
        "severity": "CRITICAL",
        "probability": 4,
        "detectability": 2,
        "risk_level": "HIGH",
        "investigation_recommendation": "Perform 5-Whys root cause analysis on blister sealer temperature control.",
        "capa_recommendation": "Replace worn sealing rollers and retrain packaging line operators.",
        "status": "CAPA_PENDING",
        "source_type": "TEXT",
        "raw_content": "Hospital pharmacy detected missing seal and broken caps on Amoxicillin 500mg capsules lot LOT-AMO-9920.",
        "is_complete": True,
        "missing_fields": [],
        "is_potential_duplicate": False
    }
]

async def seed_data(session):
    result = await session.execute(select(ProductModel))
    existing_products = result.scalars().all()
    if not existing_products:
        logger.info("Seeding initial API & FDF products...")
        for p_data in INITIAL_PRODUCTS:
            prod = ProductModel(**p_data)
            session.add(prod)
        await session.flush()
        
        logger.info("Seeding initial historical complaints...")
        for c_data in HISTORICAL_COMPLAINTS:
            comp = ComplaintModel(**c_data)
            session.add(comp)

        await session.commit()
        logger.info("Seeding complete.")
