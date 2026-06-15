"""
build_dataset.py
----------------
Curates the HealthEase medicine-indication dataset.

Each medicine is labelled with (a) its therapeutic class and (b) the primary
disease / condition it is indicated for. The data is grounded in WHO INN
(International Nonproprietary Name) "stems" -- standardised name fragments
(e.g. -pril, -statin, -cillin) that encode a drug's pharmacological class.
This is exactly what makes the downstream classifier learnable: the model
learns these morphological patterns from the medicine name itself.

Run:  python build_dataset.py
Output: data/medicine_indications.csv
"""

import csv
import os

# therapeutic_class -> (indication / disease, [medicine names])
CLASSES = {
    "ACE Inhibitor": (
        "Hypertension / Heart Failure",
        ["Lisinopril", "Enalapril", "Ramipril", "Captopril", "Perindopril",
         "Benazepril", "Fosinopril", "Quinapril", "Trandolapril", "Moexipril",
         "Cilazapril", "Imidapril", "Zofenopril", "Spirapril"],
    ),
    "ARB": (
        "Hypertension",
        ["Losartan", "Valsartan", "Telmisartan", "Olmesartan", "Candesartan",
         "Irbesartan", "Azilsartan", "Eprosartan", "Fimasartan"],
    ),
    "Beta Blocker": (
        "Hypertension / Cardiac Conditions",
        ["Metoprolol", "Atenolol", "Propranolol", "Bisoprolol", "Carvedilol",
         "Nebivolol", "Labetalol", "Esmolol", "Timolol", "Sotalol",
         "Acebutolol", "Betaxolol", "Pindolol", "Nadolol", "Celiprolol"],
    ),
    "Calcium Channel Blocker": (
        "Hypertension",
        ["Amlodipine", "Nifedipine", "Felodipine", "Nicardipine", "Nimodipine",
         "Cilnidipine", "Lercanidipine", "Nitrendipine", "Isradipine",
         "Lacidipine", "Benidipine", "Verapamil", "Diltiazem"],
    ),
    "Statin": (
        "High Cholesterol",
        ["Atorvastatin", "Simvastatin", "Rosuvastatin", "Pravastatin",
         "Lovastatin", "Fluvastatin", "Pitavastatin"],
    ),
    "Proton Pump Inhibitor": (
        "Acid Reflux / GERD",
        ["Omeprazole", "Esomeprazole", "Pantoprazole", "Lansoprazole",
         "Rabeprazole", "Dexlansoprazole", "Ilaprazole"],
    ),
    "Penicillin Antibiotic": (
        "Bacterial Infection",
        ["Amoxicillin", "Ampicillin", "Penicillin", "Cloxacillin",
         "Dicloxacillin", "Piperacillin", "Flucloxacillin", "Oxacillin",
         "Carbenicillin", "Ticarcillin", "Nafcillin", "Bacampicillin"],
    ),
    "Cephalosporin Antibiotic": (
        "Bacterial Infection",
        ["Cefixime", "Cefuroxime", "Ceftriaxone", "Cephalexin", "Cefadroxil",
         "Cefpodoxime", "Cefaclor", "Ceftazidime", "Cefepime", "Cefotaxime",
         "Cefdinir", "Ceftaroline", "Cefazolin", "Cefprozil"],
    ),
    "Macrolide Antibiotic": (
        "Bacterial Infection",
        ["Azithromycin", "Clarithromycin", "Erythromycin", "Roxithromycin",
         "Telithromycin", "Spiramycin"],
    ),
    "Fluoroquinolone Antibiotic": (
        "Bacterial Infection",
        ["Ciprofloxacin", "Levofloxacin", "Ofloxacin", "Moxifloxacin",
         "Norfloxacin", "Gatifloxacin", "Sparfloxacin", "Lomefloxacin",
         "Gemifloxacin", "Prulifloxacin"],
    ),
    "Benzodiazepine": (
        "Anxiety / Seizures",
        ["Diazepam", "Lorazepam", "Clonazepam", "Alprazolam", "Midazolam",
         "Temazepam", "Nitrazepam", "Oxazepam", "Flurazepam", "Estazolam",
         "Triazolam", "Bromazepam", "Clobazam"],
    ),
    "NSAID": (
        "Pain / Inflammation",
        ["Ibuprofen", "Naproxen", "Diclofenac", "Aceclofenac", "Ketoprofen",
         "Indomethacin", "Etoricoxib", "Celecoxib", "Mefenamic acid",
         "Piroxicam", "Meloxicam", "Nimesulide", "Flurbiprofen", "Ketorolac",
         "Lornoxicam"],
    ),
    "Antidiabetic": (
        "Diabetes Mellitus",
        ["Metformin", "Glimepiride", "Glipizide", "Gliclazide", "Glibenclamide",
         "Sitagliptin", "Vildagliptin", "Linagliptin", "Saxagliptin",
         "Teneligliptin", "Dapagliflozin", "Empagliflozin", "Canagliflozin",
         "Pioglitazone", "Repaglinide", "Nateglinide", "Acarbose"],
    ),
    "Antihistamine": (
        "Allergy",
        ["Loratadine", "Cetirizine", "Fexofenadine", "Levocetirizine",
         "Desloratadine", "Chlorpheniramine", "Hydroxyzine", "Diphenhydramine",
         "Bilastine", "Ebastine", "Rupatadine", "Promethazine",
         "Cyproheptadine", "Ketotifen"],
    ),
    "Corticosteroid": (
        "Inflammation / Autoimmune",
        ["Prednisone", "Prednisolone", "Dexamethasone", "Hydrocortisone",
         "Methylprednisolone", "Betamethasone", "Triamcinolone", "Budesonide",
         "Fluticasone", "Mometasone", "Deflazacort", "Beclomethasone"],
    ),
    "SSRI Antidepressant": (
        "Depression / Anxiety",
        ["Fluoxetine", "Sertraline", "Paroxetine", "Citalopram", "Escitalopram",
         "Fluvoxamine", "Dapoxetine", "Vortioxetine"],
    ),
    "Antifungal": (
        "Fungal Infection",
        ["Fluconazole", "Ketoconazole", "Itraconazole", "Clotrimazole",
         "Miconazole", "Voriconazole", "Terbinafine", "Posaconazole",
         "Griseofulvin", "Nystatin", "Caspofungin", "Sertaconazole",
         "Luliconazole", "Butenafine"],
    ),
    "Bronchodilator": (
        "Asthma / COPD",
        ["Salbutamol", "Salmeterol", "Formoterol", "Terbutaline", "Theophylline",
         "Ipratropium", "Tiotropium", "Bambuterol", "Indacaterol", "Vilanterol",
         "Levosalbutamol", "Doxofylline"],
    ),
    "Antiviral": (
        "Viral Infection",
        ["Acyclovir", "Valacyclovir", "Oseltamivir", "Ganciclovir", "Tenofovir",
         "Ritonavir", "Remdesivir", "Famciclovir", "Valganciclovir", "Zanamivir",
         "Lamivudine", "Entecavir", "Favipiravir", "Abacavir"],
    ),
    "Anticoagulant": (
        "Blood Clot Prevention",
        ["Warfarin", "Acenocoumarol", "Heparin", "Enoxaparin", "Dalteparin",
         "Tinzaparin", "Rivaroxaban", "Apixaban", "Edoxaban", "Dabigatran",
         "Fondaparinux", "Bivalirudin", "Argatroban"],
    ),
    "Opioid Analgesic": (
        "Severe Pain",
        ["Morphine", "Codeine", "Tramadol", "Fentanyl", "Oxycodone",
         "Hydrocodone", "Buprenorphine", "Tapentadol", "Methadone", "Pethidine",
         "Hydromorphone", "Oxymorphone", "Dihydrocodeine", "Nalbuphine"],
    ),
    "Antiemetic": (
        "Nausea / Vomiting",
        ["Ondansetron", "Granisetron", "Palonosetron", "Dolasetron",
         "Ramosetron", "Domperidone", "Metoclopramide", "Prochlorperazine",
         "Aprepitant"],
    ),
    "Antipsychotic": (
        "Schizophrenia / Psychosis",
        ["Haloperidol", "Risperidone", "Olanzapine", "Quetiapine", "Aripiprazole",
         "Clozapine", "Ziprasidone", "Paliperidone", "Amisulpride", "Lurasidone",
         "Asenapine", "Chlorpromazine", "Trifluoperazine", "Brexpiprazole",
         "Cariprazine"],
    ),
    "Antiepileptic": (
        "Epilepsy",
        ["Phenytoin", "Carbamazepine", "Valproate", "Lamotrigine", "Levetiracetam",
         "Topiramate", "Gabapentin", "Pregabalin", "Oxcarbazepine", "Lacosamide",
         "Phenobarbital", "Vigabatrin", "Zonisamide", "Ethosuximide", "Perampanel"],
    ),
    "Tetracycline Antibiotic": (
        "Bacterial Infection",
        ["Doxycycline", "Minocycline", "Tetracycline", "Tigecycline",
         "Demeclocycline", "Oxytetracycline", "Lymecycline", "Eravacycline"],
    ),
    "Aminoglycoside Antibiotic": (
        "Bacterial Infection",
        ["Gentamicin", "Amikacin", "Tobramycin", "Neomycin", "Streptomycin",
         "Kanamycin", "Netilmicin", "Paromomycin"],
    ),
    "Diuretic": (
        "Edema / Fluid Retention",
        ["Furosemide", "Hydrochlorothiazide", "Spironolactone", "Chlorthalidone",
         "Indapamide", "Torsemide", "Bumetanide", "Amiloride", "Eplerenone",
         "Metolazone", "Triamterene", "Acetazolamide", "Xipamide"],
    ),
}


def build():
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(here, "data", "medicine_indications.csv")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    rows = []
    for therapeutic_class, (indication, medicines) in CLASSES.items():
        for med in medicines:
            rows.append({
                "medicine_name": med,
                "therapeutic_class": therapeutic_class,
                "indication": indication,
            })

    rows.sort(key=lambda r: (r["therapeutic_class"], r["medicine_name"]))

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["medicine_name", "therapeutic_class", "indication"]
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} medicines across {len(CLASSES)} classes -> {out_path}")


if __name__ == "__main__":
    build()
