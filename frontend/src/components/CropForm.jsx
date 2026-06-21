import { useState } from 'react';

// Soil parameter configuration with labels, ranges, and tips
const FIELDS = [
  { name: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 140, step: 1, tip: 'Amount of nitrogen content in the soil' },
  { name: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', min: 0, max: 145, step: 1, tip: 'Amount of phosphorus content in the soil' },
  { name: 'K', label: 'Potassium (K)', unit: 'kg/ha', min: 0, max: 205, step: 1, tip: 'Amount of potassium content in the soil' },
  { name: 'temperature', label: 'Temperature', unit: '°C', min: 0, max: 50, step: 0.1, tip: 'Average temperature of your area' },
  { name: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 0.1, tip: 'Relative humidity percentage' },
  { name: 'pH', label: 'Soil pH', unit: '', min: 0, max: 14, step: 0.1, tip: 'pH value of soil (0-14)' },
  { name: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 300, step: 0.1, tip: 'Average annual rainfall' },
];

// Input form for crop recommendation — collects 7 soil/climate parameters
export default function CropForm({ onSubmit, isLoading }) {
  const [values, setValues] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', pH: '', rainfall: '',
  });
  const [errors, setErrors] = useState({});

  // Updates a single field value and clears its error
  const handleChange = (name, val) => {
    setValues({ ...values, [name]: val });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // Validates all 7 fields are filled with valid numbers
  const validate = () => {
    const errs = {};
    FIELDS.forEach((f) => {
      if (values[f.name] === '' || values[f.name] === undefined) {
        errs[f.name] = `${f.label} is required`;
      } else {
        const num = parseFloat(values[f.name]);
        if (isNaN(num)) errs[f.name] = 'Must be a number';
        else if (num < f.min || num > f.max) errs[f.name] = `Must be ${f.min}–${f.max}`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handles form submit — validates then calls parent callback
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  // Resets all values to empty
  const handleReset = () => {
    setValues({ N: '', P: '', K: '', temperature: '', humidity: '', pH: '', rainfall: '' });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} id="crop-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {FIELDS.map((field) => (
          <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor={`crop-${field.name}`}>
              {field.label}
              {field.unit && (
                <span style={{ fontWeight: 400, color: 'var(--color-textMuted)', fontSize: '0.75rem', marginLeft: '0.3rem' }}>
                  ({field.unit})
                </span>
              )}
            </label>
            <input
              id={`crop-${field.name}`}
              type="number"
              className={`input ${errors[field.name] ? 'input-error' : ''}`}
              placeholder={`${field.min} – ${field.max}`}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {errors[field.name] ? (
              <p className="form-error">{errors[field.name]}</p>
            ) : (
              <p style={{ fontSize: '0.72rem', color: 'var(--color-textMuted)', marginTop: '0.2rem' }}>{field.tip}</p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" disabled={isLoading} id="crop-submit-btn">
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
              Analyzing soil...
            </>
          ) : (
            '🌱 Get Recommendation'
          )}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}
