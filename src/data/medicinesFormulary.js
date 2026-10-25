// Hospital Master Medicines Formulary
// Comprehensive Selective Formulary for Dermatology, Dental Surgery, and Pediatric Care
// Equipped with search, categorisation, and custom additions

export const MEDICINE_CATEGORIES = [
  { id: "all", label: "All Medicines", icon: "💊" },
  { id: "dental", label: "Dental & Oral Care", icon: "🦷" },
  { id: "derm", label: "Dermatology & Skin", icon: "🌸" },
  { id: "antibiotic", label: "Antibiotics", icon: "🔬" },
  { id: "pain", label: "Pain & Swelling (Analgesics)", icon: "⚡" },
  { id: "pediatric", label: "Pediatric Formulations", icon: "🧸" },
  { id: "antacid", label: "Antacids & Gastro-Protection", icon: "🛡️" },
  { id: "rinse", label: "Mouthwashes & Topicals", icon: "💧" }
];

export const INITIAL_FORMULARY = [
  // --- DENTAL & ORAL SURGERY ---
  {
    id: "med-amox-500",
    name: "Amoxicillin 500mg",
    type: "Capsule",
    category: "dental",
    categoryGroup: ["dental", "antibiotic"],
    frequency: "1-1-1 (After Food)",
    duration: "5 Days",
    instructions: "Complete full antibiotic course",
    strength: "500mg",
    commonFor: "Painless RCT, Dentoalveolar Abscess, Post-Extraction"
  },
  {
    id: "med-augmentin-625",
    name: "Augmentin 625mg (Amox + Clavulanic)",
    type: "Tablet",
    category: "dental",
    categoryGroup: ["dental", "antibiotic"],
    frequency: "1-0-1 (After Food)",
    duration: "5 Days",
    instructions: "Take with food or light snack",
    strength: "625mg",
    commonFor: "Severe odontogenic infections, Wisdom tooth surgery"
  },
  {
    id: "med-zerodol-sp",
    name: "Zerodol-SP (Aceclofenac + Paracetamol + Serratio)",
    type: "Tablet",
    category: "pain",
    categoryGroup: ["dental", "pain"],
    frequency: "1-0-1 (After Food)",
    duration: "3 Days",
    instructions: "For relief from acute toothache and surgical swelling",
    strength: "100mg/325mg/15mg",
    commonFor: "Root Canal Pain, Wisdom Tooth Extraction, Gum Swelling"
  },
  {
    id: "med-zerodol-p",
    name: "Zerodol-P (Aceclofenac + Paracetamol)",
    type: "Tablet",
    category: "pain",
    categoryGroup: ["dental", "pain"],
    frequency: "1-0-1 (After Food)",
    duration: "3 Days",
    instructions: "Take after food with water",
    strength: "100mg/325mg",
    commonFor: "Mild to moderate dental pain, post-scaling sensitivity"
  },
  {
    id: "med-ketorol-dt",
    name: "Ketorol-DT 10mg (Ketorolac Tromethamine)",
    type: "Tablet",
    category: "pain",
    categoryGroup: ["dental", "pain"],
    frequency: "SOS (When Needed for Severe Pain)",
    duration: "2 Days",
    instructions: "Disperse tablet in 1 tablespoon of drinking water before taking",
    strength: "10mg DT",
    commonFor: "Acute pulpal emergency pain, post-surgical pain relief"
  },
  {
    id: "med-metrogyl-400",
    name: "Metrogyl 400mg (Metronidazole)",
    type: "Tablet",
    category: "antibiotic",
    categoryGroup: ["dental", "antibiotic"],
    frequency: "1-1-1 (After Food)",
    duration: "5 Days",
    instructions: "Avoid alcohol completely during therapy",
    strength: "400mg",
    commonFor: "Anaerobic gum infections, Pericoronitis, Periodontitis"
  },
  {
    id: "med-hexidine-mouthwash",
    name: "Hexidine 0.2% Mouthwash (Chlorhexidine)",
    type: "Liquid",
    category: "rinse",
    categoryGroup: ["dental", "rinse"],
    frequency: "1-0-1 (After Food)",
    duration: "7 Days",
    instructions: "Rinse 10ml undiluted for 60 seconds after brushing, do not swallow",
    strength: "0.2% w/v",
    commonFor: "Post-cleaning maintenance, Gingivitis, Post-implant surgery"
  },
  {
    id: "med-betadine-gargle",
    name: "Betadine 2% Oral Gargle (Povidone Iodine)",
    type: "Liquid",
    category: "rinse",
    categoryGroup: ["dental", "rinse"],
    frequency: "1-0-1 (After Food)",
    duration: "5 Days",
    instructions: "Dilute with equal volume of lukewarm water and gargle",
    strength: "2%",
    commonFor: "Oral mucosa ulcers, pericoronitis, post-extraction healing"
  },
  {
    id: "med-dologel-ct",
    name: "Dologel CT Oral Ointment (Choline Salicylate + Lignocaine)",
    type: "Gel",
    category: "rinse",
    categoryGroup: ["dental", "rinse"],
    frequency: "1-0-1 (After Food)",
    duration: "5 Days",
    instructions: "Apply clean fingertip over painful ulcer/gum 15 mins before meals",
    strength: "10g",
    commonFor: "Aphthous ulcers, denture sore spots, teething pain"
  },
  {
    id: "med-thermoseal-ra",
    name: "Thermoseal RA / Sensodyne Repair Toothpaste",
    type: "Gel",
    category: "dental",
    categoryGroup: ["dental"],
    frequency: "1-0-1 (Morning-Night)",
    duration: "30 Days",
    instructions: "Massage gently on sensitive teeth for 2 minutes before rinsing",
    strength: "50g",
    commonFor: "Tooth sensitivity to cold/hot, enamel wear, cervical abrasion"
  },

  // --- GASTRO-RESISTANT ANTACIDS ---
  {
    id: "med-pantocid-40",
    name: "Pantocid 40mg (Pantoprazole)",
    type: "Tablet",
    category: "antacid",
    categoryGroup: ["antacid", "dental", "derm"],
    frequency: "1-0-0 (Empty Stomach)",
    duration: "5 Days",
    instructions: "Take 30 minutes before breakfast with water",
    strength: "40mg",
    commonFor: "Gastro-protection with NSAIDs and antibiotics"
  },
  {
    id: "med-pan-d",
    name: "Pan-D (Pantoprazole 40mg + Domperidone 30mg)",
    type: "Capsule",
    category: "antacid",
    categoryGroup: ["antacid"],
    frequency: "1-0-0 (Empty Stomach)",
    duration: "7 Days",
    instructions: "Take morning on empty stomach with plain water",
    strength: "40mg/30mg",
    commonFor: "Acidity, GERD, nausea associated with strong antibiotics"
  },

  // --- DERMATOLOGY & SKIN ---
  {
    id: "med-adapalene-clinda",
    name: "Adapalene 0.1% + Clindamycin 1% Gel (Deriva-CMS)",
    type: "Gel",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "0-0-1 (Bedtime)",
    duration: "30 Days",
    instructions: "Apply pea-sized amount over acne lesions only at night",
    strength: "15g Gel",
    commonFor: "Acne Vulgaris Grade II/III, Comedones, Blackheads"
  },
  {
    id: "med-doxy-100",
    name: "Doxycycline 100mg (Doxy-1 L-DR)",
    type: "Capsule",
    category: "derm",
    categoryGroup: ["derm", "antibiotic"],
    frequency: "1-0-0 (After Food)",
    duration: "15 Days",
    instructions: "Take with full glass of water, do not lie down immediately",
    strength: "100mg",
    commonFor: "Moderate to severe papulopustular acne, folliculitis"
  },
  {
    id: "med-minocycline-65",
    name: "Minocycline 65mg / 100mg Extended Release",
    type: "Tablet",
    category: "derm",
    categoryGroup: ["derm", "antibiotic"],
    frequency: "1-0-0 (After Food)",
    duration: "20 Days",
    instructions: "Take after lunch with ample fluids",
    strength: "65mg",
    commonFor: "Refractory acne vulgaris, rosacea, inflammatory dermatoses"
  },
  {
    id: "med-aziderm-10",
    name: "Azelaic Acid 10% / 20% Cream (Aziderm)",
    type: "Gel",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "1-0-1 (After Food)",
    duration: "30 Days",
    instructions: "Apply gently over dark patches and post-acne blemishes",
    strength: "15g",
    commonFor: "Melasma, Post-Inflammatory Hyperpigmentation (PIH), Rosacea"
  },
  {
    id: "med-benzoyl-peroxide",
    name: "Benzoyl Peroxide 2.5% Gel (Persol AC)",
    type: "Gel",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "0-0-1 (Bedtime)",
    duration: "15 Days",
    instructions: "Spot application on red pustules, wash hands after use",
    strength: "2.5% w/w",
    commonFor: "Active red acne spots, inflammatory cysts"
  },
  {
    id: "med-cetaphil-cleanser",
    name: "Cetaphil / Sebamed Gentle Skin Cleanser",
    type: "Liquid",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "1-0-1 (Morning-Night)",
    duration: "Daily",
    instructions: "Wash face gently twice daily with lukewarm water, pat dry",
    strength: "125ml",
    commonFor: "Sensitive skin, acne-prone skin, barrier repair"
  },
  {
    id: "med-matte-sunscreen",
    name: "Silicone Matte Sunscreen Gel SPF 50+ PA+++",
    type: "Gel",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "Every 4 Hours",
    duration: "Daily",
    instructions: "Apply 20 minutes before stepping into sun, reapply every 3-4 hours",
    strength: "50g",
    commonFor: "UV protection, post-laser care, melasma prevention"
  },
  {
    id: "med-ketoconazole-shampoo",
    name: "Ketoconazole 2% + Zinc Pyrithione Shampoo (Scalpe+)",
    type: "Liquid",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "3 Times a Week",
    duration: "30 Days",
    instructions: "Apply to wet scalp, leave for 5 minutes before rinsing off",
    strength: "100ml",
    commonFor: "Seborrheic dermatitis, stubborn dandruff, scalp itch"
  },
  {
    id: "med-minoxidil-5",
    name: "Minoxidil 5% + Finasteride 0.1% Solution (Mintop-F)",
    type: "Liquid",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "1ml Twice Daily",
    duration: "60 Days",
    instructions: "Apply 1ml using calibrated dropper directly onto thinning scalp areas",
    strength: "60ml",
    commonFor: "Androgenetic alopecia, hair fall thinning, crown density"
  },
  {
    id: "med-clobetasol-s",
    name: "Clobetasol Propionate + Salicylic Acid (Tenovate-S)",
    type: "Gel",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "0-0-1 (Bedtime)",
    duration: "14 Days",
    instructions: "Apply thin layer sparingly on hyperkeratotic patches only",
    strength: "20g",
    commonFor: "Chronic plaque psoriasis, lichen planus, stubborn hand eczema"
  },
  {
    id: "med-bilastine-20",
    name: "Bilastine 20mg (Bilaxten)",
    type: "Tablet",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "1-0-0 (Empty Stomach)",
    duration: "10 Days",
    instructions: "Take 1 hour before or 2 hours after food. Non-drowsy formulation",
    strength: "20mg",
    commonFor: "Chronic urticaria, allergic dermatitis, severe skin itching"
  },
  {
    id: "med-monticope",
    name: "Levocetirizine 5mg + Montelukast 10mg (Monticope)",
    type: "Tablet",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "0-0-1 (Bedtime)",
    duration: "10 Days",
    instructions: "Take at bedtime with water",
    strength: "5mg/10mg",
    commonFor: "Nocturnal pruritus, allergic rhinitis with skin hives"
  },
  {
    id: "med-itraconazole-100",
    name: "Itraconazole 100mg / 200mg (Candiforce)",
    type: "Capsule",
    category: "derm",
    categoryGroup: ["derm", "antibiotic"],
    frequency: "1-0-1 (After Food)",
    duration: "14 Days",
    instructions: "Take immediately after a heavy meal for maximum bioavailability",
    strength: "100mg",
    commonFor: "Tinea corporis/cruris (ringworm), onychomycosis, fungal skin infection"
  },
  {
    id: "med-luliconazole-cream",
    name: "Luliconazole 1% Cream (Lulifin)",
    type: "Gel",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "1-0-1 (After Food)",
    duration: "14 Days",
    instructions: "Apply 2cm beyond the active red border of fungal ringworm",
    strength: "20g",
    commonFor: "Fungal tinea, athlete's foot, sweat rash"
  },
  {
    id: "med-glutone-vitc",
    name: "Glutathione 500mg + Vitamin C 500mg Effervescent (Glutone)",
    type: "Tablet",
    category: "derm",
    categoryGroup: ["derm"],
    frequency: "1-0-0 (After Food)",
    duration: "30 Days",
    instructions: "Dissolve 1 tablet in half glass of water and drink immediately",
    strength: "500mg/500mg",
    commonFor: "Skin glow booster, hyperpigmentation control, antioxidant support"
  },

  // --- PEDIATRIC FORMULATIONS ---
  {
    id: "med-augmentin-duo-syp",
    name: "Augmentin Duo Syrup (Amox-Clav 228.5mg/5ml)",
    type: "Syrup",
    category: "pediatric",
    categoryGroup: ["pediatric", "antibiotic"],
    frequency: "5ml twice daily (After Food)",
    duration: "5 Days",
    instructions: "Shake bottle thoroughly before measuring exact dose in syringe/cup",
    strength: "228.5mg/5ml",
    commonFor: "Child dental abscess, pulpectomy infection, pediatric facial edema"
  },
  {
    id: "med-ibugesic-plus-syp",
    name: "Ibugesic Plus Syrup (Ibuprofen + Paracetamol)",
    type: "Syrup",
    category: "pediatric",
    categoryGroup: ["pediatric", "pain"],
    frequency: "5ml SOS (After Food)",
    duration: "3 Days",
    instructions: "Give only when child complains of pain or high fever",
    strength: "100mg/162.5mg per 5ml",
    commonFor: "Pediatric acute tooth pain, post-extraction pain, earache"
  },
  {
    id: "med-calpol-250-syp",
    name: "Calpol 250mg Suspension (Paracetamol)",
    type: "Syrup",
    category: "pediatric",
    categoryGroup: ["pediatric", "pain"],
    frequency: "5ml SOS (After Food)",
    duration: "3 Days",
    instructions: "Ensure minimum 4-6 hours gap between doses if fever recurs",
    strength: "250mg/5ml",
    commonFor: "Mild pediatric fever, teething discomfort"
  },
  {
    id: "med-pediflor-paste",
    name: "Pediflor / Colgate Kids 500ppm Fluoride Paste",
    type: "Gel",
    category: "pediatric",
    categoryGroup: ["pediatric", "dental"],
    frequency: "1-0-1 (Morning-Night)",
    duration: "Daily",
    instructions: "Parent-supervised brushing with pea-sized amount, spit out excess",
    strength: "50g",
    commonFor: "Prevention of early childhood caries, enamel remineralization"
  },
  {
    id: "med-kenacort-oral",
    name: "Kenacort 0.1% Oral Mucosal Paste (Triamcinolone)",
    type: "Gel",
    category: "rinse",
    categoryGroup: ["dental", "pediatric", "rinse"],
    frequency: "0-0-1 (Bedtime)",
    duration: "5 Days",
    instructions: "Dab small quantity over mouth ulcer at bedtime, do not rub",
    strength: "5g",
    commonFor: "Canker sores, traumatic ulcers from braces, ulcerative stomatitis"
  },
  {
    id: "med-doxy-100",
    name: "Doxycycline 100mg (Doxy-1 L-DR)",
    type: "Capsule",
    category: "derm",
    categoryGroup: ["derm", "antibiotic"],
    frequency: "1-0-0 (After Food)",
    duration: "15 Days",
    instructions: "Take with full glass of water, do not lie down immediately",
    strength: "100mg",
    commonFor: "Grade II-III Acne Vulgaris, Rosacea, Cutaneous Bacterial Infection"
  },
  {
    id: "med-minox-5",
    name: "Minoxidil 5% Topical Solution (Tugain / Morr-F)",
    type: "Liquid",
    category: "derm",
    categoryGroup: ["derm", "rinse"],
    frequency: "1ml Once Daily (Night)",
    duration: "90 Days",
    instructions: "Apply 1ml with dropper directly to clean dry scalp, massage gently",
    strength: "5% w/v (60ml)",
    commonFor: "Androgenetic Alopecia, Telogen Effluvium hair regrowth"
  },
  {
    id: "med-keto-shampoo",
    name: "Ketoconazole 2% + ZPTO Scalp Shampoo (Scalpe Pro)",
    type: "Liquid",
    category: "derm",
    categoryGroup: ["derm", "rinse"],
    frequency: "Twice Weekly",
    duration: "30 Days",
    instructions: "Apply on wet hair, massage into scalp, leave for 5 mins before rinsing",
    strength: "100ml",
    commonFor: "Seborrheic Dermatitis, stubborn pityriasis capitis dandruff"
  },
  {
    id: "med-tranexa-500",
    name: "Tranexamic Acid 500mg (Pause 500)",
    type: "Tablet",
    category: "dental",
    categoryGroup: ["dental", "pain"],
    frequency: "1-0-1 (After Food)",
    duration: "2 Days",
    instructions: "Take as directed if persistent oozing post tooth extraction or gum surgery",
    strength: "500mg",
    commonFor: "Post-extraction hemostasis, minor oral surgical hemorrhage"
  },
  {
    id: "med-candid-paint",
    name: "Clotrimazole 1% Oral Mouth Paint (Candid)",
    type: "Drops",
    category: "rinse",
    categoryGroup: ["dental", "pediatric", "rinse"],
    frequency: "1-1-1 (Post Feeding)",
    duration: "7 Days",
    instructions: "Apply 4-5 drops with clean fingertip over oral lesions after feeding",
    strength: "15ml",
    commonFor: "Oral candidiasis / thrush in infants, denture stomatitis"
  },
  {
    id: "med-augmentin-duo-syp",
    name: "Amoxycillin & Potassium Clavulanate Syrup (Augmentin Duo 228.5mg)",
    type: "Syrup",
    category: "pediatric",
    categoryGroup: ["pediatric", "antibiotic"],
    frequency: "5ml Twice Daily (After Food)",
    duration: "5 Days",
    instructions: "Reconstitute with boiled cooled water up to mark, shake well before use",
    strength: "228.5mg/5ml",
    commonFor: "Pediatric space infections, acute dentoalveolar abscess"
  }
];


const FORMULARY_STORAGE_KEY = 'CHAUDHARI_FORMULARY_CUSTOM_V1';

export class MedicinesFormularyService {
  constructor() {
    this.medicines = this.loadFormulary();
  }

  loadFormulary() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(FORMULARY_STORAGE_KEY);
        if (stored) {
          const custom = JSON.parse(stored);
          return [...INITIAL_FORMULARY, ...custom];
        }
      }
    } catch (e) {
      console.error('Failed to load custom formulary:', e);
    }
    return [...INITIAL_FORMULARY];
  }

  getAllMedicines() {
    return this.medicines;
  }

  search(query = '', category = 'all') {
    const q = query.trim().toLowerCase();
    return this.medicines.filter(m => {
      const matchesCategory = category === 'all' || 
        m.category === category || 
        (m.categoryGroup && m.categoryGroup.includes(category));
      
      const matchesQuery = !q ||
        m.name.toLowerCase().includes(q) ||
        (m.strength && m.strength.toLowerCase().includes(q)) ||
        (m.commonFor && m.commonFor.toLowerCase().includes(q)) ||
        (m.type && m.type.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }

  addCustomMedicine(med) {
    const newMed = {
      id: `custom-med-${Date.now()}`,
      name: med.name.trim(),
      type: med.type || 'Tablet',
      category: med.category || 'dental',
      categoryGroup: [med.category || 'dental'],
      frequency: med.frequency || '1-0-1 (After Food)',
      duration: med.duration || '5 Days',
      instructions: med.instructions || 'Take with water after meals',
      strength: med.strength || '',
      commonFor: med.commonFor || 'Doctor prescribed formulation'
    };

    this.medicines.unshift(newMed);
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(FORMULARY_STORAGE_KEY);
        const customList = stored ? JSON.parse(stored) : [];
        customList.unshift(newMed);
        localStorage.setItem(FORMULARY_STORAGE_KEY, JSON.stringify(customList));
      }
    } catch (e) {
      console.error('Failed to save custom medicine:', e);
    }
    return newMed;
  }
}

export const medicinesFormulary = new MedicinesFormularyService();
