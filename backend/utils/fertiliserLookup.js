// Rule-based fertilizer recommendation lookup for common Indian crops
// Returns fertilizer name, dosage, application timing, and precautions based on NPK deficiency

// Comprehensive fertilizer database keyed by nutrient deficiency type
const FERTILIZER_DB = {
  // ----- Nitrogen (N) Deficiency -----
  highN: {
    fertilizer: 'Urea (46-0-0)',
    dosage: '50–65 kg per acre',
    timing: 'Apply in 2–3 split doses: at sowing, tillering, and flowering stage',
    precautions: 'Do not apply in waterlogged conditions. Avoid broadcasting on dry soil — mix with irrigation water.',
  },
  lowN: {
    fertilizer: 'Calcium Ammonium Nitrate (CAN)',
    dosage: '80–100 kg per acre',
    timing: 'Basal dose at sowing + top dressing after 30 days',
    precautions: 'Suitable for acidic soils. Store in cool, dry place away from direct sunlight.',
  },

  // ----- Phosphorus (P) Deficiency -----
  highP: {
    fertilizer: 'Single Super Phosphate (SSP)',
    dosage: '100–125 kg per acre',
    timing: 'Apply full dose as basal application before sowing',
    precautions: 'Do not mix with urea. Best applied in furrows near the root zone.',
  },
  lowP: {
    fertilizer: 'Di-Ammonium Phosphate (DAP)',
    dosage: '50–60 kg per acre',
    timing: 'Apply as basal dose at the time of sowing',
    precautions: 'Do not use in alkaline soils (pH > 7.5). Keep away from seeds during placement.',
  },

  // ----- Potassium (K) Deficiency -----
  highK: {
    fertilizer: 'Muriate of Potash (MOP)',
    dosage: '35–50 kg per acre',
    timing: 'Half as basal dose, half at flowering/fruiting stage',
    precautions: 'Avoid for salt-sensitive crops like tobacco and potato. Do not mix with urea.',
  },
  lowK: {
    fertilizer: 'Sulphate of Potash (SOP)',
    dosage: '40–55 kg per acre',
    timing: 'Apply as basal dose or in split doses during vegetative growth',
    precautions: 'Preferred for chloride-sensitive crops. More expensive than MOP — use where quality matters.',
  },

  // ----- Balanced / NPK Deficiency -----
  balanced: {
    fertilizer: 'NPK Complex (10-26-26)',
    dosage: '60–80 kg per acre',
    timing: 'Apply full dose as basal application at sowing',
    precautions: 'Good all-purpose option. Supplement with urea for nitrogen top-dressing later.',
  },
  severe: {
    fertilizer: 'NPK Complex (20-20-20) + Micronutrient Mix',
    dosage: '80–100 kg NPK + 5 kg micronutrient mix per acre',
    timing: 'Basal dose at sowing + foliar spray of micronutrients at 30 and 60 days',
    precautions: 'Indicates severely depleted soil — consider soil testing and organic matter addition.',
  },
};

// Crop-specific fertilizer adjustment notes
const CROP_SPECIFIC = {
  rice: { note: 'Rice benefits from zinc sulphate (10 kg/acre) as a nursery treatment. Apply nitrogen in 3 splits for paddy.', organic: 'Use green manure (dhaincha/sunhemp) 20 days before transplanting.' },
  wheat: { note: 'Wheat responds well to nitrogen. First irrigation (21 days) is critical for fertilizer absorption.', organic: 'Apply 4–5 tonnes FYM per acre before sowing.' },
  maize: { note: 'Maize is a heavy nitrogen feeder. Apply zinc sulphate if deficiency symptoms appear.', organic: 'Incorporate crop residues from previous season.' },
  cotton: { note: 'Cotton needs potassium for fiber quality. Apply boron (1 kg borax/acre) if deficient.', organic: 'Use neem cake (100 kg/acre) for pest resistance + nutrition.' },
  tomato: { note: 'Tomato benefits from calcium to prevent blossom end rot. Apply in drip irrigation if possible.', organic: 'Apply vermicompost at 2 tonnes/acre.' },
  onion: { note: 'Onion needs sulphur for pungency. Use SSP as phosphorus source (contains 12% sulphur).', organic: 'Poultry manure (1 tonne/acre) boosts bulb size.' },
  potato: { note: 'Potato needs high potassium. Use SOP instead of MOP to avoid chloride damage to tubers.', organic: 'Well-decomposed FYM (8–10 tonnes/acre) improves tuber quality.' },
  soybean: { note: 'Soybean fixes its own nitrogen — reduce N fertilizer. Focus on phosphorus and rhizobium inoculation.', organic: 'Rhizobium seed treatment + PSB (Phosphate Solubilizing Bacteria).' },
  sugarcane: { note: 'Sugarcane is a heavy feeder — needs 3–4 splits of nitrogen over the growing season.', organic: 'Press mud (filter cake) at 10 tonnes/acre enriches soil organic carbon.' },
  mustard: { note: 'Mustard responds to sulphur. Use SSP or gypsum as sulphur source.', organic: 'Apply FYM + neem cake for integrated nutrient management.' },
};

// Determines nutrient deficiency level based on NPK values and optimal ranges
const analyzeDeficiency = (N, P, K) => {
  const deficiencies = [];

  // Nitrogen analysis (optimal: 20–80 kg/ha)
  if (N < 20) deficiencies.push({ nutrient: 'Nitrogen', level: 'severe', key: 'lowN' });
  else if (N < 40) deficiencies.push({ nutrient: 'Nitrogen', level: 'moderate', key: 'lowN' });
  else if (N > 80) deficiencies.push({ nutrient: 'Nitrogen', level: 'excess', key: 'highN' });

  // Phosphorus analysis (optimal: 10–50 kg/ha)
  if (P < 10) deficiencies.push({ nutrient: 'Phosphorus', level: 'severe', key: 'lowP' });
  else if (P < 25) deficiencies.push({ nutrient: 'Phosphorus', level: 'moderate', key: 'lowP' });
  else if (P > 50) deficiencies.push({ nutrient: 'Phosphorus', level: 'excess', key: 'highP' });

  // Potassium analysis (optimal: 15–60 kg/ha)
  if (K < 15) deficiencies.push({ nutrient: 'Potassium', level: 'severe', key: 'lowK' });
  else if (K < 30) deficiencies.push({ nutrient: 'Potassium', level: 'moderate', key: 'lowK' });
  else if (K > 60) deficiencies.push({ nutrient: 'Potassium', level: 'excess', key: 'highK' });

  return deficiencies;
};

// Main lookup function — returns fertilizer suggestions based on crop and NPK values
const lookupFertilizer = (cropName, N, P, K) => {
  const crop = cropName.toLowerCase().trim();
  const deficiencies = analyzeDeficiency(N, P, K);

  // Build fertilizer suggestions from deficiency analysis
  const suggestions = [];

  if (deficiencies.length === 0) {
    // NPK values are in optimal range
    suggestions.push({
      ...FERTILIZER_DB.balanced,
      reason: 'Your soil NPK levels are within the optimal range. A balanced fertilizer maintains soil health.',
    });
  } else if (deficiencies.length >= 3) {
    // Multiple severe deficiencies — recommend comprehensive approach
    suggestions.push({
      ...FERTILIZER_DB.severe,
      reason: 'Multiple nutrient deficiencies detected. A comprehensive NPK complex with micronutrients is recommended.',
    });
  }

  // Add specific fertilizer for each deficiency
  deficiencies.forEach((def) => {
    const fertData = FERTILIZER_DB[def.key];
    if (fertData) {
      suggestions.push({
        ...fertData,
        reason: `${def.nutrient} is ${def.level} — ${def.key.startsWith('high') ? 'excess detected, reduce application' : 'deficiency detected, supplement needed'}.`,
        nutrient: def.nutrient,
        level: def.level,
      });
    }
  });

  // Add crop-specific notes if available
  const cropInfo = CROP_SPECIFIC[crop] || null;

  return {
    crop: cropName,
    soilAnalysis: {
      N: { value: N, status: getStatus(N, 20, 80) },
      P: { value: P, status: getStatus(P, 10, 50) },
      K: { value: K, status: getStatus(K, 15, 60) },
    },
    deficiencies,
    suggestions,
    cropSpecific: cropInfo,
  };
};

// Returns a human-readable status label for a nutrient value
const getStatus = (value, low, high) => {
  if (value < low) return 'Low';
  if (value > high) return 'High';
  return 'Optimal';
};

module.exports = { lookupFertilizer, analyzeDeficiency };
