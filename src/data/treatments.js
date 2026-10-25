// Treatments and Departments Data
export const DEPARTMENTS = [
  {
    id: "skin",
    name: "Skin, Hair & Laser Care",
    tagline: "Medical-grade dermatology, laser aesthetics, and trichology",
    leadDoctorId: "dr-rajnikant",
    icon: "sparkles",
    color: "teal"
  },
  {
    id: "dental",
    name: "Dental & Oral Surgery",
    tagline: "Painless micro-endodontics, implants, and pediatric smile care",
    leadDoctorId: "dr-priyanka",
    icon: "smile",
    color: "blue"
  },
  {
    id: "combo",
    name: "Multi-Specialty & Glow Packages",
    tagline: "Synergistic bridal, executive, and family preventive care",
    leadDoctorId: "dr-rajnikant",
    icon: "award",
    color: "amber"
  }
];

export const TREATMENTS = [
  // TAB A: Skin, Hair & Laser (Dr. Rajnikant Arvind Chaudhari)
  {
    id: "acne-scar-treatment",
    deptId: "skin",
    title: "Acne & Scar Resurfacing Protocol",
    description: "Targeted dermatological therapy combining subcision, fractional resurfacing & microneedling to rebuild collagen and smooth deep pitted scars.",
    duration: "45 - 60 Mins",
    sessions: "3 to 5 Sessions recommended",
    painLevel: "Virtually Painless (Topical Numbing)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    tech: "Fractional Medical Resurfacing + Microneedling RF",
    tags: ["Acne Scars", "Skin Resurfacing", "Collagen Induction"],
    idealFor: "Pitted scars, rolling scars, active inflammatory acne & post-inflammatory marks.",
    priceGuide: "From ₹2,500 / session"
  },
  {
    id: "hydrafacial-glow",
    deptId: "skin",
    title: "Clinical Medical Hydrafacial & Infusion",
    description: "Patented vortex-fusion technology that deep cleanses, extracts sebum and micro-comedones, and infuses antioxidant serums and hyaluronic acid.",
    duration: "45 Mins",
    sessions: "Single session for instant glow / Monthly maintenance",
    painLevel: "Zero Pain (Zero Downtime)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    tech: "Clinical Vortex Dermabrasion Infusion",
    tags: ["Instant Glow", "Pore Cleansing", "Hydration"],
    idealFor: "Dull dehydrated skin, congested pores, uneven texture before key events.",
    priceGuide: "From ₹3,000 / session"
  },
  {
    id: "laser-hair-reduction",
    deptId: "skin",
    title: "US FDA Triple-Wavelength Laser Hair Reduction",
    description: "Gold-standard diode (808nm) + Alexandrite (755nm) + Nd:YAG (1064nm) with sapphire contact cooling for painless, permanent hair reduction safe for Indian skin tones.",
    duration: "30 - 75 Mins",
    sessions: "6 to 8 Sessions for permanent reduction",
    painLevel: "Painless (Sub-Zero Contact Chill)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    tech: "Triple-Wave Sapphire Chill Laser",
    tags: ["Permanent Hair Reduction", "US FDA", "All Skin Tones"],
    idealFor: "Unwanted facial, underarm, body hair, ingrown hairs & folliculitis.",
    priceGuide: "From ₹1,999 / session"
  },
  {
    id: "prp-hair-restoration",
    deptId: "skin",
    title: "GFC & PRP Hair Density Restoration",
    description: "Autologous Growth Factor Concentrate (GFC) harvested from patient's platelets, micro-injected into thinning scalp follicles to stop hair fall and stimulate thicker hair growth.",
    duration: "45 Mins",
    sessions: "4 to 6 Sessions (Monthly intervals)",
    painLevel: "Mild Pinch (Vibration & Ice cooling)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    tech: "High-Yield Regenerative GFC Biokit",
    tags: ["Hair Fall Control", "Follicular Regrowth", "Non-Surgical"],
    idealFor: "Androgenetic alopecia, diffuse hair thinning, stress telogen effluvium.",
    priceGuide: "From ₹3,500 / session"
  },
  {
    id: "chemical-peels-pigmentation",
    deptId: "skin",
    title: "Advanced Medical Peels for Melasma & Pigmentation",
    description: "Dermatologist-formulated chemical exfoliations (Yellow peel, Mandelic, Glycolic, Ferulic) targeting hyperpigmentation, tanning, and melasma patches safely.",
    duration: "30 Mins",
    sessions: "3 to 4 Sessions",
    painLevel: "Mild tingling",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    tech: "Medical Dermaceutical Peels",
    tags: ["Melasma", "De-Tan", "Brightening"],
    idealFor: "Stubborn pigmentation, dark patches, sun spots, post-pregnancy melasma.",
    priceGuide: "From ₹2,200 / session"
  },

  // TAB B: Dental & Oral Surgery (Dr. Priyanka Chaudhari & Dr. Rutika Tulaskar)
  {
    id: "painless-root-canal",
    deptId: "dental",
    title: "Painless Rotary Single-Visit Root Canal (RCT)",
    description: "Micro-endodontics with computer-guided apex locators, rotary nickel-titanium files, and warm vertical obturation for 100% painless infection removal in 1 sitting.",
    duration: "45 Mins",
    sessions: "Single sitting (Single-Visit RCT)",
    painLevel: "100% Painless (Computerized Local Anaesthesia)",
    doctor: "Dr. Priyanka Chaudhari (Anekar)",
    doctorId: "dr-priyanka",
    tech: "German Rotary Endo Motor + Digital Apex Locator",
    tags: ["Painless RCT", "Single-Visit", "Tooth Preservation"],
    idealFor: "Severe toothache, sensitivity to hot/cold, deep cavities, pulpitis.",
    priceGuide: "From ₹3,500 / tooth"
  },
  {
    id: "dental-implants",
    deptId: "dental",
    title: "Immediate & Biocompatible Dental Implants",
    description: "Permanent replacement for missing teeth using pure biocompatible titanium/zirconia screw implants that integrate with the jawbone, topped with custom CAD/CAM zirconia crown.",
    duration: "45 - 60 Mins",
    sessions: "Immediate load / 2-phase integration",
    painLevel: "Painless (Surgical Anaesthesia)",
    doctor: "Dr. Priyanka Chaudhari (Anekar)",
    doctorId: "dr-priyanka",
    tech: "Computerized Implant System + CAD/CAM Zirconia",
    tags: ["Permanent Tooth", "Natural Bite", "Long-Term Guarantee"],
    idealFor: "Missing single or multiple teeth, loose dentures, fractured tooth replacement.",
    priceGuide: "From ₹20,000 / implant"
  },
  {
    id: "kids-pediatric-dentistry",
    deptId: "dental",
    title: "Gentle Pediatric Dentistry & Pulpectomy (MDS Lead)",
    description: "Child-friendly specialized preventive dental care led by Pediatric Specialist Dr. Rutika Tulaskar (M.D.S. Nashik). Zero-fear child cavity treatments, pulpectomy, and space maintainers.",
    duration: "30 - 45 Mins",
    sessions: "1 to 2 child-friendly visits",
    painLevel: "100% Child-Friendly & Gentle",
    doctor: "Dr. Rutika Tulaskar (Chaudhari)",
    doctorId: "dr-rutika",
    tech: "Pediatric Rotary Handpiece + Bio-Ceramic Sealants",
    tags: ["MDS Specialist", "Child Friendly", "Zero Anxiety"],
    idealFor: "Early childhood caries, baby tooth cavities, nursing bottle decay, habit breaking.",
    priceGuide: "From ₹1,500"
  },
  {
    id: "smile-design-veneers",
    deptId: "dental",
    title: "Digital Smile Designing & Porcelain Veneers",
    description: "Custom handcrafted ceramic/composite veneers tailored to your facial symmetry, correcting chipped, discolored, gapped, or uneven teeth with minimal tooth prep.",
    duration: "2 Appointments",
    sessions: "Digital Scan -> Try-In -> Permanent Bonding",
    painLevel: "Virtually Painless",
    doctor: "Dr. Priyanka Chaudhari (Anekar)",
    doctorId: "dr-priyanka",
    tech: "Digital Aesthetic Design + E.max Lithium Disilicate",
    tags: ["Smile Makeover", "Aesthetic Veneers", "Stain Resistant"],
    idealFor: "Chipped teeth, permanent stains, gaps between teeth, uneven tooth lengths.",
    priceGuide: "From ₹7,500 / veneer"
  },
  {
    id: "invisible-aligners",
    deptId: "dental",
    title: "Clear Invisible Aligners & Orthodontic Braces",
    description: "Transparent, removable medical-grade aligners that straighten crooked or crowded teeth discreetly without metal wires or dietary restrictions.",
    duration: "6 - 12 Months treatment",
    sessions: "Monthly progress reviews",
    painLevel: "Gentle tooth pressure only",
    doctor: "Dr. Rutika Tulaskar (Chaudhari)",
    doctorId: "dr-rutika",
    tech: "3D Treatment Simulation + Custom Aligners",
    tags: ["Invisible Braces", "Removable", "No Metal Wires"],
    idealFor: "Crooked teeth, gaps (diastema), overbite, crowded anterior teeth.",
    priceGuide: "From ₹35,000 full plan"
  },
  {
    id: "laser-teeth-whitening",
    deptId: "dental",
    title: "Laser In-Clinic Teeth Whitening",
    description: "Light-accelerated LED whitening technology that safely brightens teeth up to 6-8 shades in just 45 minutes without damaging enamel or causing lingering sensitivity.",
    duration: "45 Mins",
    sessions: "Single sitting",
    painLevel: "Painless (Anti-sensitivity gel included)",
    doctor: "Dr. Priyanka Chaudhari (Anekar)",
    doctorId: "dr-priyanka",
    tech: "Light-Accelerated Dental Whitening Laser",
    tags: ["Instant Bright Smile", "Enamel Safe"],
    idealFor: "Yellowish teeth, tea/coffee/smoking stains, pre-wedding bright smile.",
    priceGuide: "From ₹5,999"
  },

  // TAB C: Multi-Specialty & Preventive Care
  {
    id: "family-preventive-pass",
    deptId: "combo",
    title: "Annual Family Dental & Skin Health Screening",
    description: "Complete preventive checkup for 2 to 4 family members: Ultrasonic dental scaling & polishing, skin & hair dermoscopy analysis by Dr. Rajnikant, Dr. Rutika, and Dr. Priyanka.",
    duration: "60 Mins",
    sessions: "Annual / Semi-Annual",
    painLevel: "100% Painless",
    doctor: "Multi-Specialty Panel",
    doctorId: "dr-rajnikant",
    tech: "Digital Intraoral Camera + Dermatoscope",
    tags: ["Family Health", "Preventive Care", "Comprehensive"],
    idealFor: "Routine hygiene, early cavity detection, mole & hair loss screening.",
    priceGuide: "₹2,499 (Comprehensive Family Screening)"
  },
  {
    id: "minor-surgical-derm",
    deptId: "combo",
    title: "Radiofrequency Mole, Wart & Skin Tag Removal",
    description: "Precision radiofrequency vaporization for cosmetic removal of facial moles, warts, and skin tags with scarless healing under local topical anaesthesia.",
    duration: "20 Mins",
    sessions: "Single Sitting",
    painLevel: "Painless (Local Anaesthetic)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    tech: "Precision Dual-Frequency Radiofrequency",
    tags: ["Scarless", "Instant Removal", "Aesthetic"],
    idealFor: "Skin tags on neck/underarms, benign facial moles, viral warts.",
    priceGuide: "From ₹999 / lesion"
  }
];

// Special "Smile & Glow" Cross-Specialty Packages
export const COMBO_PACKAGES = [
  {
    id: "bridal-royal-glow-smile",
    title: "Royal Pre-Wedding 'Smile & Glow' Bridal / Groom Package",
    headline: "The Signature Cross-Specialty Makeover in Khamgaon",
    tagline: "Synchronized dual-care by Dr. Rajnikant Chaudhari & Dr. Priyanka Chaudhari",
    highlight: "Most Popular for Brides & Grooms",
    image: "/images/cases/skin-after.jpg",
    badge: "Signature Package",
    rating: 5.0,
    features: [
      "1x Medical Hydrafacial with Antioxidant Glow Infusion (Dr. Rajnikant)",
      "1x Laser In-Clinic Teeth Whitening (Dr. Priyanka)",
      "1x Ultrasonic Scaling & Airflow Prophylaxis Polishing",
      "1x Collagen Glow Eye & Lip Rejuvenation Mask",
      "Full digital smile & skin hydration diagnostic report",
      "Specialized clinical post-care recovery kit"
    ],
    duration: "2 Visits (Recommended 2-3 weeks before ceremony)",
    regularPrice: "₹14,500",
    packagePrice: "₹8,999",
    savings: "Save 38%",
    leadDoctor: "Dr. Rajnikant Chaudhari & Dr. Priyanka Chaudhari"
  },
  {
    id: "executive-recharge",
    title: "Executive Smile Polish & De-Tan Rejuvenation",
    headline: "Fast-Track Care for Working Professionals",
    tagline: "Designed for rapid turnaround with zero clinical downtime",
    highlight: "Weekend Walk-In Friendly",
    image: "/images/cases/smile-after.jpg",
    badge: "Executive Care",
    rating: 5.0,
    features: [
      "Medical De-Tan Glow Peel with Vitamin C Infusion (Dr. Rajnikant)",
      "Full Mouth Ultrasonic Tartar Removal & Stain Buffing (Dr. Priyanka)",
      "Fluoride Cavity Shield Application",
      "Skin Barrier Hydration & Sun Defense Counseling",
      "Priority Evening OPD slot scheduling"
    ],
    duration: "Single 60-Minute Session",
    regularPrice: "₹5,500",
    packagePrice: "₹3,499",
    savings: "Save 36%",
    leadDoctor: "Dr. Rajnikant Chaudhari & Dr. Priyanka Chaudhari"
  },
  {
    id: "total-wellness-pass",
    title: "Annual Family Smile & Skin Wellness Pass",
    headline: "Complete Year-Round Assurance for Parents & Kids",
    tagline: "Covers 2 Adults + 2 Kids with Pediatric MDS Specialist care",
    highlight: "All 3 Specialists Included",
    image: "/images/hero-clinic.jpg",
    badge: "Family Pass",
    rating: 5.0,
    features: [
      "4 Comprehensive Doctor Consultations across Skin & Dental",
      "2 Full Mouth Ultrasonic Cleanings & Polishing",
      "1 Pediatric Dental Fluoride & Cavity Shield (Dr. Rutika - MDS)",
      "Digital Intraoral Cavity Scanning & Skin Dermoscopy",
      "15% Flat Savings on all Laser, Implants & Veneer treatments all year",
      "Complimentary emergency priority appointment scheduling"
    ],
    duration: "1 Year Validity (Up to 4 family members)",
    regularPrice: "₹12,000",
    packagePrice: "₹6,499",
    savings: "Save 45%",
    leadDoctor: "Full Specialist Panel (Dr. Rajnikant, Dr. Rutika, Dr. Priyanka)"
  }
];
