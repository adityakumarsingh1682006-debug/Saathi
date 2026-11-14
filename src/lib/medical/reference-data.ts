/**
 * SAATHI Evidence-Based Clinical Reference Knowledge Base
 * Sourced from verified public health authorities:
 * - MedlinePlus (U.S. National Library of Medicine / NIH)
 * - American Diabetes Association (ADA 2026 Standards of Care)
 * - National Cholesterol Education Program (NCEP ATP III / AHA)
 * - National Kidney Foundation (NKF KDOQI)
 * - American Thyroid Association (ATA)
 * - World Health Organization (WHO) Clinical Diagnostic Guidelines
 * - National Health Service (NHS) Pathology Reference Intervals
 * 
 * IMPORTANT MEDICAL CAVEAT:
 * Reference intervals vary substantially by laboratory analyzer, analytical reagents,
 * patient biological sex, age, gestational status, and diurnal rhythm.
 * Universal ranges do not exist. Always interpret results in correlation with the
 * specific reporting laboratory's reference interval and an attending physician.
 */

export interface MedicalReferenceEntry {
  loincCode: string;
  testName: string;
  panel: "CBC" | "LIPID" | "GLUCOSE" | "LFT" | "KFT" | "TFT" | "URINALYSIS";
  unit: string;
  typicalAdultRange: {
    male?: string;
    female?: string;
    general: string;
    lowThreshold?: number;
    highThreshold?: number;
  };
  authoritySource: string;
  sourceUrl?: string;
  biologicalVariationsNote: string;
  patientFriendlyExplanation: string;
  physiologicalRole: string;
  causesOfElevation: string[];
  causesOfDepression: string[];
  sampleQuestionsForDoctor: string[];
}

export const OFFICIAL_LAB_CAVEAT =
  "Laboratory Reference Notice: Normal reference intervals are dependent on analytical methodology, reagent vendor, patient biological sex, age, fasting state, and clinical conditions. Never compare numerical results across disparate laboratories without clinical supervision.";

export const CLINICAL_REFERENCE_DATABASE: Record<string, MedicalReferenceEntry> = {
  // =========================================================================
  // 1. COMPLETE BLOOD COUNT (CBC) - LOINC 58410-2
  // =========================================================================
  "718-7": {
    loincCode: "718-7",
    testName: "Hemoglobin (Hb)",
    panel: "CBC",
    unit: "g/dL",
    typicalAdultRange: {
      male: "13.8 - 17.2 g/dL",
      female: "12.1 - 15.1 g/dL",
      general: "12.0 - 17.5 g/dL",
      lowThreshold: 12.0,
      highThreshold: 17.5,
    },
    authoritySource: "MedlinePlus / NIH Clinical Reference",
    sourceUrl: "https://medlineplus.gov/ency/article/003645.htm",
    biologicalVariationsNote: "Higher in individuals living at high altitudes and chronic smokers; lower during pregnancy due to hemodilution.",
    patientFriendlyExplanation: "Hemoglobin is the iron-rich protein inside red blood cells that carries oxygen from your lungs to the rest of your body.",
    physiologicalRole: "Oxygen transport and carbon dioxide buffering across peripheral tissue beds.",
    causesOfElevation: ["Dehydration / hemoconcentration", "Chronic hypoxia (e.g. high altitude, sleep apnea)", "Polycythemia vera", "Heavy smoking"],
    causesOfDepression: ["Iron deficiency anemia", "Nutritional deficiencies (Vitamin B12, Folate)", "Chronic blood loss", "Bone marrow suppression"],
    sampleQuestionsForDoctor: [
      "Is my hemoglobin level stable compared to my previous blood counts?",
      "Would checking my serum ferritin or iron saturation be beneficial?",
      "Are there dietary modifications that can help maintain healthy red blood cell production?",
    ],
  },
  "6690-2": {
    loincCode: "6690-2",
    testName: "Total White Blood Cell Count (WBC / Leukocytes)",
    panel: "CBC",
    unit: "× 10³/µL (or cells/cu.mm)",
    typicalAdultRange: {
      general: "4.5 - 11.0 × 10³/µL (4,500 - 11,000 cells/µL)",
      lowThreshold: 4.5,
      highThreshold: 11.0,
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003643.htm",
    biologicalVariationsNote: "Values naturally peak in late afternoon and can transiently elevate following acute strenuous exercise or emotional stress.",
    patientFriendlyExplanation: "White blood cells represent the frontline cellular defense of your immune system, fighting off bacterial, viral, and inflammatory challenges.",
    physiologicalRole: "Immune surveillance, phagocytosis, cytokine signaling, and pathogen neutralisation.",
    causesOfElevation: ["Active bacterial or viral infection", "Systemic inflammatory conditions", "Physiological stress or trauma", "Corticosteroid therapy"],
    causesOfDepression: ["Viral infections (transient suppression)", "Autoimmune disorders", "Bone marrow disorders", "Chemotherapy or immunosuppressant medications"],
    sampleQuestionsForDoctor: [
      "Does this WBC count suggest an active or recent immune response?",
      "Should we repeat this test in a few weeks to monitor the trend?",
    ],
  },
  "777-3": {
    loincCode: "777-3",
    testName: "Platelet Count (Thrombocytes)",
    panel: "CBC",
    unit: "× 10³/µL",
    typicalAdultRange: {
      general: "150 - 450 × 10³/µL (150,000 - 450,000 /µL)",
      lowThreshold: 150,
      highThreshold: 450,
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003647.htm",
    biologicalVariationsNote: "May fluctuate slightly with menstrual cycles and intense exercise; platelet clumping in EDTA tubes can falsely lower automated counts.",
    patientFriendlyExplanation: "Platelets are microscopic cell fragments that form clots to stop bleeding when blood vessels are injured.",
    physiologicalRole: "Primary hemostasis, clot formation, and vascular repair.",
    causesOfElevation: ["Reactive thrombocytosis (post-infection, post-surgery, iron deficiency)", "Chronic inflammation", "Myeloproliferative neoplasms"],
    causesOfDepression: ["Immune thrombocytopenia (ITP)", "Viral infections (e.g. Dengue, Epstein-Barr)", "Splenic sequestration", "Certain medications (e.g. Heparin, NSAIDs)"],
    sampleQuestionsForDoctor: [
      "Do I need any precautions regarding bruising or bleeding?",
      "Could any over-the-counter medications or supplements affect my platelet function?",
    ],
  },

  // =========================================================================
  // 2. LIPID PROFILE - LOINC 24331-1
  // =========================================================================
  "2093-3": {
    loincCode: "2093-3",
    testName: "Total Cholesterol",
    panel: "LIPID",
    unit: "mg/dL",
    typicalAdultRange: {
      general: "< 200 mg/dL (Desirable)",
      lowThreshold: 100,
      highThreshold: 200,
    },
    authoritySource: "NCEP ATP III / American Heart Association / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/cholesterollevelstables.html",
    biologicalVariationsNote: "Total cholesterol can vary by 5-10% from day to day due to seasonal temperature, acute illness, and dietary intake over preceding days.",
    patientFriendlyExplanation: "Total cholesterol measures all the cholesterol molecules found in your blood, including both high-density (protective) and low-density (artery-clogging) carriers.",
    physiologicalRole: "Essential structural component of cell membranes and precursor for steroid hormones and bile acids.",
    causesOfElevation: ["Diets high in saturated/trans fats", "Genetic predisposition (Familial Hypercholesterolemia)", "Hypothyroidism", "Sedentary lifestyle"],
    causesOfDepression: ["Severe malabsorption", "Hyperthyroidism", "Severe chronic liver disease", "Malnutrition"],
    sampleQuestionsForDoctor: [
      "What is my 10-year cardiovascular risk score based on my full lipid profile?",
      "Which specific dietary changes will make the biggest difference for my cholesterol ratio?",
    ],
  },
  "13457-7": {
    loincCode: "13457-7",
    testName: "LDL Cholesterol (Calculated or Direct)",
    panel: "LIPID",
    unit: "mg/dL",
    typicalAdultRange: {
      general: "< 100 mg/dL (Optimal for general population; < 70 mg/dL for high cardiovascular risk)",
      highThreshold: 100,
    },
    authoritySource: "AHA / ACC 2026 Guidelines / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/ency/article/003495.htm",
    biologicalVariationsNote: "Calculated via the Friedewald formula; can be inaccurate if triglycerides exceed 400 mg/dL.",
    patientFriendlyExplanation: "Often called 'bad cholesterol', LDL particles can deposit excess cholesterol inside arterial walls, leading to plaque buildup over time.",
    physiologicalRole: "Transports endogenous lipids and cholesterol from the liver to peripheral tissues.",
    causesOfElevation: ["High dietary saturated fat", "Insulin resistance", "Hypothyroidism", "Genetics"],
    causesOfDepression: ["Extensive statin therapy", "Chronic liver dysfunction", "Severe malnutrition"],
    sampleQuestionsForDoctor: [
      "Is my LDL level appropriate for my personal cardiovascular risk profile?",
      "Would lifestyle measures alone be sufficient, or should we discuss medical therapy?",
    ],
  },
  "2085-9": {
    loincCode: "2085-9",
    testName: "HDL Cholesterol",
    panel: "LIPID",
    unit: "mg/dL",
    typicalAdultRange: {
      male: "> 40 mg/dL (Desirable)",
      female: "> 50 mg/dL (Desirable)",
      general: "> 40 mg/dL",
      lowThreshold: 40,
    },
    authoritySource: "NCEP ATP III / AHA / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/ency/article/003495.htm",
    biologicalVariationsNote: "Higher in premenopausal females due to estrogenic cardioprotection; decreased significantly by cigarette smoking.",
    patientFriendlyExplanation: "Referred to as 'good cholesterol', HDL acts as a vascular scavenger, collecting excess cholesterol from tissues and shuttling it back to the liver for excretion.",
    physiologicalRole: "Reverse cholesterol transport and anti-inflammatory endothelial protection.",
    causesOfElevation: ["Regular vigorous cardiovascular exercise", "Moderate alcohol consumption", "Healthy dietary monounsaturated fats"],
    causesOfDepression: ["Cigarette smoking", "Obesity / metabolic syndrome", "High carbohydrate / high sugar diets", "Type 2 diabetes"],
    sampleQuestionsForDoctor: [
      "What cardiovascular exercises are safest for boosting my HDL levels?",
      "How does my HDL level influence my total cholesterol-to-HDL ratio?",
    ],
  },
  "2571-8": {
    loincCode: "2571-8",
    testName: "Triglycerides",
    panel: "LIPID",
    unit: "mg/dL",
    typicalAdultRange: {
      general: "< 150 mg/dL (Normal); 150-199 mg/dL (Borderline High)",
      highThreshold: 150,
    },
    authoritySource: "American Heart Association / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003493.htm",
    biologicalVariationsNote: "Highly sensitive to recent meals, alcohol, and refined sugar; requires a 10 to 12 hour overnight fast for accurate baseline measurement.",
    patientFriendlyExplanation: "Triglycerides are the main form of stored fat in your bloodstream, derived from unused dietary calories.",
    physiologicalRole: "Energy storage and cellular fuel reserve.",
    causesOfElevation: ["High intake of refined carbohydrates, sugars, or alcohol", "Insulin resistance / diabetes", "Hypothyroidism", "Kidney disease"],
    causesOfDepression: ["Extremely low-fat diets", "Malabsorption syndromes", "Hyperthyroidism"],
    sampleQuestionsForDoctor: [
      "Was my fasting duration sufficient for an accurate triglyceride assessment?",
      "What carbohydrate modifications should I prioritize to help lower triglycerides?",
    ],
  },

  // =========================================================================
  // 3. GLUCOSE & HBA1C - LOINC 4548-4 / 1558-6
  // =========================================================================
  "1558-6": {
    loincCode: "1558-6",
    testName: "Fasting Blood Glucose (FBS)",
    panel: "GLUCOSE",
    unit: "mg/dL",
    typicalAdultRange: {
      general: "70 - 99 mg/dL (Normal); 100 - 125 mg/dL (Impaired / Pre-diabetes); ≥ 126 mg/dL (Indicative of diabetes if confirmed)",
      lowThreshold: 70,
      highThreshold: 99,
    },
    authoritySource: "American Diabetes Association (ADA 2026 Standards) / WHO",
    sourceUrl: "https://medlineplus.gov/ency/article/003482.htm",
    biologicalVariationsNote: "Affected by acute illness, cortisone release, poor sleep, and strict adherence to an 8-12 hour water-only fast.",
    patientFriendlyExplanation: "Measures circulating sugar levels in your blood stream after fasting overnight.",
    physiologicalRole: "Primary immediate fuel source for brain neurons and metabolic cellular processes.",
    causesOfElevation: ["Insulin resistance / Type 2 diabetes", "Pancreatic beta-cell insufficiency", "Acute emotional or physiological stress", "Corticosteroid medication"],
    causesOfDepression: ["Excessive exogenous insulin or secretagogue medication", "Prolonged fasting / starvation", "Insulinoma", "Adrenal insufficiency"],
    sampleQuestionsForDoctor: [
      "Does this fasting level warrant an oral glucose tolerance test (OGTT)?",
      "How closely should I monitor blood glucose alongside my HbA1c?",
    ],
  },
  "4548-4": {
    loincCode: "4548-4",
    testName: "Hemoglobin A1c (HbA1c / Glycated Hemoglobin)",
    panel: "GLUCOSE",
    unit: "%",
    typicalAdultRange: {
      general: "< 5.7% (Normal); 5.7% - 6.4% (Pre-diabetes); ≥ 6.5% (Diabetes threshold on two separate tests)",
      lowThreshold: 4.0,
      highThreshold: 5.6,
    },
    authoritySource: "American Diabetes Association (ADA 2026) / CDC / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/ency/article/003640.htm",
    biologicalVariationsNote: "Reflects red blood cell lifespan (~120 days). Hemoglobinopathies, hemolytic anemia, or recent blood transfusions can distort HbA1c readings.",
    patientFriendlyExplanation: "HbA1c reflects your average blood sugar levels over the past 2 to 3 months by measuring the percentage of hemoglobin coated with glucose.",
    physiologicalRole: "Long-term retrospective indicator of systemic glycemic exposure.",
    causesOfElevation: ["Persistent chronic hyperglycemia", "Poorly controlled diabetes mellitus", "Chronic kidney disease"],
    causesOfDepression: ["Conditions with shortened red blood cell survival (hemolytic anemia, splenomegaly)", "Recent severe blood loss or transfusion"],
    sampleQuestionsForDoctor: [
      "What is my personalized target HbA1c based on my age and medical history?",
      "How often should we repeat this test to evaluate our current lifestyle interventions?",
    ],
  },

  // =========================================================================
  // 4. LIVER FUNCTION TESTS (LFT) - LOINC 24325-3
  // =========================================================================
  "1742-6": {
    loincCode: "1742-6",
    testName: "Alanine Aminotransferase (ALT / SGPT)",
    panel: "LFT",
    unit: "U/L",
    typicalAdultRange: {
      male: "7 - 56 U/L",
      female: "7 - 45 U/L",
      general: "7 - 56 U/L",
      highThreshold: 56,
    },
    authoritySource: "MedlinePlus / NIH / NHS Liver Function Reference",
    sourceUrl: "https://medlineplus.gov/ency/article/003436.htm",
    biologicalVariationsNote: "ALT is concentrated primarily in hepatocytes (liver cells), making it more specific to liver inflammation than AST.",
    patientFriendlyExplanation: "An intracellular enzyme primarily found in liver cells. When liver cells are stressed or injured, ALT leaks into the circulation.",
    physiologicalRole: "Catalyzes the reversible transamination between L-alanine and 2-oxoglutarate in cellular metabolism.",
    causesOfElevation: ["Non-alcoholic fatty liver disease (NAFLD/MASLD)", "Viral hepatitis (A, B, C, E)", "Alcohol-associated liver disease", "Hepatotoxic medications (e.g. Paracetamol overdose, certain antibiotics, statins)"],
    causesOfDepression: ["Generally of no pathological clinical significance; seen in severe Pyridoxine (Vitamin B6) deficiency"],
    sampleQuestionsForDoctor: [
      "Does this ALT reading indicate mild inflammation or fatty infiltration of the liver?",
      "Could any of my current supplements, herbal remedies, or prescriptions be stressing my liver?",
    ],
  },
  "1920-8": {
    loincCode: "1920-8",
    testName: "Aspartate Aminotransferase (AST / SGOT)",
    panel: "LFT",
    unit: "U/L",
    typicalAdultRange: {
      male: "10 - 40 U/L",
      female: "9 - 32 U/L",
      general: "10 - 40 U/L",
      highThreshold: 40,
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003472.htm",
    biologicalVariationsNote: "Found not only in the liver, but also in heart muscle, skeletal muscle, kidneys, and brain. Intense exercise can elevate AST.",
    patientFriendlyExplanation: "An enzyme found in liver cells, heart tissue, and muscle. Used alongside ALT to assess tissue integrity.",
    physiologicalRole: "Amino acid metabolism and energy generation in mitochondrial and cytoplasmic compartments.",
    causesOfElevation: ["Alcoholic liver disease (often AST/ALT ratio > 2)", "Acute viral hepatitis", "Intense muscle trauma or rhabdomyolysis", "Myocardial injury"],
    causesOfDepression: ["Severe uremia / dialysis", "Vitamin B6 deficiency"],
    sampleQuestionsForDoctor: [
      "How does my AST-to-ALT ratio inform our understanding of liver wellness?",
      "Could recent physical workouts have influenced my AST levels?",
    ],
  },
  "1975-2": {
    loincCode: "1975-2",
    testName: "Total Bilirubin",
    panel: "LFT",
    unit: "mg/dL",
    typicalAdultRange: {
      general: "0.2 - 1.2 mg/dL",
      highThreshold: 1.2,
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003479.htm",
    biologicalVariationsNote: "Can mildly rise during prolonged fasting, dehydration, or physical exhaustion (e.g., in benign Gilbert's syndrome).",
    patientFriendlyExplanation: "A yellowish pigment formed during the normal breakdown of aging red blood cells. The liver filters bilirubin and incorporates it into bile.",
    physiologicalRole: "End product of heme catabolism.",
    causesOfElevation: ["Biliary duct obstruction (gallstones, strictures)", "Hepatocellular damage (hepatitis, cirrhosis)", "Accelerated red blood cell breakdown (hemolysis)", "Gilbert's syndrome (benign genetic variation)"],
    causesOfDepression: ["Not clinically concerning"],
    sampleQuestionsForDoctor: [
      "Is my bilirubin elevation primarily indirect (unconjugated) or direct (conjugated)?",
      "Do I need an ultrasound of my gallbladder and liver ducts?",
    ],
  },
  "6768-6": {
    loincCode: "6768-6",
    testName: "Alkaline Phosphatase (ALP)",
    panel: "LFT",
    unit: "U/L",
    typicalAdultRange: {
      general: "44 - 147 U/L",
      highThreshold: 147,
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003470.htm",
    biologicalVariationsNote: "Physiologically higher in growing children/adolescents (active bone growth) and third-trimester pregnancy (placental ALP).",
    patientFriendlyExplanation: "An enzyme related to the bile ducts of the liver and bone mineralization.",
    physiologicalRole: "Dephosphorylation of organic compounds under alkaline conditions.",
    causesOfElevation: ["Biliary obstruction or cholestasis", "Bone disorders (Paget's disease, healing fractures, osteomalacia)", "Infiltrative liver disease"],
    causesOfDepression: ["Malnutrition", "Severe zinc deficiency", "Hypophosphatasia"],
    sampleQuestionsForDoctor: [
      "Does this ALP originate from the bile ducts or bone turnover?",
      "Would a GGT (gamma-glutamyl transferase) test help differentiate the source?",
    ],
  },

  // =========================================================================
  // 5. KIDNEY FUNCTION TESTS (KFT / RFT) - LOINC 24362-6
  // =========================================================================
  "2160-0": {
    loincCode: "2160-0",
    testName: "Serum Creatinine",
    panel: "KFT",
    unit: "mg/dL",
    typicalAdultRange: {
      male: "0.7 - 1.3 mg/dL",
      female: "0.6 - 1.1 mg/dL",
      general: "0.6 - 1.3 mg/dL",
      lowThreshold: 0.6,
      highThreshold: 1.3,
    },
    authoritySource: "National Kidney Foundation (NKF KDOQI) / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/ency/article/003475.htm",
    biologicalVariationsNote: "Dependent on total muscle mass; higher in muscular athletes or those supplementing with creatine; lower in elderly individuals with sarcopenia.",
    patientFriendlyExplanation: "Creatinine is a natural waste product generated by normal muscle breakdown, filtered almost exclusively by healthy kidneys.",
    physiologicalRole: "Metabolic byproduct used as the primary clinical marker of glomerular filtration integrity.",
    causesOfElevation: ["Reduced kidney filtration function (acute kidney injury, chronic kidney disease)", "Dehydration", "High dietary intake of cooked red meat or creatine"],
    causesOfDepression: ["Low muscle mass (atrophy, cachexia)", "Severe liver disease (reduced creatine synthesis)"],
    sampleQuestionsForDoctor: [
      "What is my estimated Glomerular Filtration Rate (eGFR) based on this creatinine value?",
      "Does my muscle mass or hydration level play a role in this specific reading?",
    ],
  },
  "3094-0": {
    loincCode: "3094-0",
    testName: "Blood Urea Nitrogen (BUN)",
    panel: "KFT",
    unit: "mg/dL",
    typicalAdultRange: {
      general: "7 - 20 mg/dL",
      lowThreshold: 7,
      highThreshold: 20,
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003474.htm",
    biologicalVariationsNote: "Elevates disproportionately to creatinine in states of dehydration or upper gastrointestinal bleeding due to urea reabsorption.",
    patientFriendlyExplanation: "Measures the amount of nitrogen in your blood that comes from the waste product urea, produced when liver breaks down protein.",
    physiologicalRole: "Nitrogen excretion and osmotic homeostasis in renal tubules.",
    causesOfElevation: ["Kidney dysfunction", "Hypovolemia / dehydration", "High protein diets", "Upper gastrointestinal hemorrhage"],
    causesOfDepression: ["Severe liver disease", "Low protein malnutrition", "Overhydration"],
    sampleQuestionsForDoctor: [
      "What is my BUN-to-Creatinine ratio, and does it indicate dehydration?",
      "Are my daily fluid intake habits adequate for my kidney health?",
    ],
  },
  "33914-3": {
    loincCode: "33914-3",
    testName: "Estimated Glomerular Filtration Rate (eGFR - CKD-EPI)",
    panel: "KFT",
    unit: "mL/min/1.73m²",
    typicalAdultRange: {
      general: "> 90 mL/min/1.73m² (Normal); 60-89 (Mildly decreased); < 60 (Requires evaluation if sustained > 3 months)",
      lowThreshold: 60,
    },
    authoritySource: "National Kidney Foundation (NKF) / KDIGO Clinical Practice Guidelines",
    sourceUrl: "https://medlineplus.gov/ency/article/007308.htm",
    biologicalVariationsNote: "Calculated using age, biological sex, and serum creatinine. Naturally declines by approximately 1 mL/min/year after age 40.",
    patientFriendlyExplanation: "An estimate of how many milliliters of blood your kidneys' filters (glomeruli) clean every minute, adjusted for standard body surface area.",
    physiologicalRole: "Gold-standard composite index of global renal functional reserve.",
    causesOfElevation: ["Hyperfiltration (early diabetes, high protein load, pregnancy)"],
    causesOfDepression: ["Chronic kidney disease (CKD)", "Acute kidney injury", "Hypertensive nephrosclerosis", "Glomerulonephritis"],
    sampleQuestionsForDoctor: [
      "Has my eGFR remained stable over the last 12 months?",
      "Should we perform a urine albumin-to-creatinine ratio (uACR) test to check for microscopic protein leakage?",
    ],
  },

  // =========================================================================
  // 6. THYROID FUNCTION TESTS (TFT) - LOINC 24348-5
  // =========================================================================
  "3016-3": {
    loincCode: "3016-3",
    testName: "Thyroid Stimulating Hormone (TSH / Thyrotropin)",
    panel: "TFT",
    unit: "µIU/mL (or mIU/L)",
    typicalAdultRange: {
      general: "0.45 - 4.50 µIU/mL",
      lowThreshold: 0.45,
      highThreshold: 4.5,
    },
    authoritySource: "American Thyroid Association (ATA) / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/ency/article/003684.htm",
    biologicalVariationsNote: "Follows a circadian rhythm with peaks overnight and troughs in afternoon. Upper reference range limits naturally rise with advancing age (> 65 yrs).",
    patientFriendlyExplanation: "A pituitary hormone that signals your thyroid gland how much thyroid hormone to manufacture and release.",
    physiologicalRole: "Master endocrine regulator of cellular basal metabolic rate.",
    causesOfElevation: ["Primary hypothyroidism (underactive thyroid gland, e.g., Hashimoto's thyroiditis)", "Insufficient thyroid hormone replacement dosage", "Recovery phase of thyroiditis"],
    causesOfDepression: ["Hyperthyroidism (e.g. Graves' disease, toxic multinodular goiter)", "Excessive thyroid replacement medication", "Subacute thyroiditis"],
    sampleQuestionsForDoctor: [
      "Does this TSH level require checking Free T4 and Free T3 antibodies (anti-TPO)?",
      "Should we recheck this value in 6 to 8 weeks before deciding on treatment?",
    ],
  },
  "3024-7": {
    loincCode: "3024-7",
    testName: "Free Thyroxine (Free T4)",
    panel: "TFT",
    unit: "ng/dL",
    typicalAdultRange: {
      general: "0.8 - 1.8 ng/dL",
      lowThreshold: 0.8,
      highThreshold: 1.8,
    },
    authoritySource: "American Thyroid Association / MedlinePlus",
    sourceUrl: "https://medlineplus.gov/ency/article/003684.htm",
    biologicalVariationsNote: "Measures the unbound, biologically active fraction of T4 in circulation, unaffected by changes in binding globulin (TBG).",
    patientFriendlyExplanation: "The active, unbound thyroid hormone circulating in your bloodstream ready to enter body tissues and drive metabolism.",
    physiologicalRole: "Prohormone converted peripherally to active T3, regulating oxygen consumption and energy utilization.",
    causesOfElevation: ["Hyperthyroidism / thyrotoxicosis", "Over-replacement with levothyroxine"],
    causesOfDepression: ["Hypothyroidism", "Severe non-thyroidal systemic illness (Euthyroid Sick Syndrome)"],
    sampleQuestionsForDoctor: [
      "Is my Free T4 in balance with my pituitary TSH level?",
      "Are my symptoms (fatigue, temperature sensitivity) correlated with this reading?",
    ],
  },

  // =========================================================================
  // 7. URINE ANALYSIS (ROUTINE & MICROSCOPIC) - LOINC 24356-8
  // =========================================================================
  "5803-2": {
    loincCode: "5803-2",
    testName: "Urine Protein / Albumin",
    panel: "URINALYSIS",
    unit: "mg/dL (or qualitative)",
    typicalAdultRange: {
      general: "Negative (or Trace < 15 mg/dL)",
      highThreshold: 15,
    },
    authoritySource: "MedlinePlus / NIH / National Kidney Foundation",
    sourceUrl: "https://medlineplus.gov/ency/article/003580.htm",
    biologicalVariationsNote: "Transient protein can appear after prolonged standing (orthostatic proteinuria), severe fever, or heavy athletic exertion.",
    patientFriendlyExplanation: "Checks whether protein (mainly albumin) is leaking past the kidney's filtration barrier into the urine.",
    physiologicalRole: "Intravascular oncotic protein retention; healthy kidney glomeruli prevent protein passage.",
    causesOfElevation: ["Glomerular filtration barrier damage", "Hypertensive or diabetic kidney disease", "Urinary tract infection (inflammatory exudate)", "Orthostatic proteinuria"],
    causesOfDepression: ["Normal healthy baseline"],
    sampleQuestionsForDoctor: [
      "Is this urine protein result transient, or should we confirm with an early-morning first-void sample?",
      "Do I need an automated Urine Albumin-to-Creatinine Ratio (uACR)?",
    ],
  },
  "5792-7": {
    loincCode: "5792-7",
    testName: "Urine Glucose",
    panel: "URINALYSIS",
    unit: "mg/dL (or qualitative)",
    typicalAdultRange: {
      general: "Negative",
    },
    authoritySource: "MedlinePlus / NIH",
    sourceUrl: "https://medlineplus.gov/ency/article/003581.htm",
    biologicalVariationsNote: "Glucose appears in urine when serum blood glucose exceeds the renal threshold (typically ~180 mg/dL), or with SGLT2 inhibitor medications.",
    patientFriendlyExplanation: "Detects the presence of sugar in urine, which only occurs when blood sugar surpasses the kidney's reabsorption capacity.",
    physiologicalRole: "Proximal tubules normally reabsorb 100% of filtered glucose.",
    causesOfElevation: ["Uncontrolled hyperglycemia (Diabetes mellitus)", "Renal glycosuria (benign lower renal threshold)", "Therapy with SGLT2 inhibitor medications (e.g. Dapagliflozin, Empagliflozin)"],
    causesOfDepression: ["Normal healthy baseline"],
    sampleQuestionsForDoctor: [
      "Could any medications I take cause sugar to be excreted into the urine?",
      "Does this require an immediate fingerstick blood glucose check?",
    ],
  },
};
