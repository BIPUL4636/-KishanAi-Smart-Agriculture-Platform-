import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Drag-and-drop leaf image upload component using react-dropzone
export default function LeafUpload({ onSubmit, isLoading }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  // Handles file drop — creates preview URL and stores file reference
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading,
  });

  // Submits the uploaded image for disease detection
  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    onSubmit(formData);
  };

  // Clears the current image selection
  const handleClear = () => {
    setPreview(null);
    setFile(null);
  };

  return (
    <div>
      {!preview ? (
        /* Dropzone area */
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
          id="leaf-dropzone"
        >
          <input {...getInputProps()} />
          <div style={{ marginBottom: '1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-textMuted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', opacity: 0.5 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          {isDragActive ? (
            <p style={{ fontWeight: 600, color: 'var(--color-kisanBlue)' }}>
              Drop the leaf image here...
            </p>
          ) : (
            <>
              <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                Drag & drop a leaf photo here
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-textMuted)' }}>
                or click to browse — JPG, PNG, WebP up to 10MB
              </p>
            </>
          )}
          <p style={{ fontSize: '0.78rem', color: 'var(--color-textMuted)', marginTop: '1rem', opacity: 0.7 }}>
            💡 Tip: Take a clear photo of the affected leaf in good natural lighting
          </p>
        </div>
      ) : (
        /* Image Preview */
        <div className="fade-in">
          <div style={{
            borderRadius: 'var(--radius-card)', overflow: 'hidden',
            border: '2px solid rgba(65, 192, 242, 0.15)', marginBottom: '1rem',
            maxHeight: '350px', display: 'flex', justifyContent: 'center',
            background: '#f9fafb',
          }}>
            <img
              src={preview}
              alt="Leaf preview"
              style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-textMuted)' }}>
              📎 {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                disabled={isLoading}
                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
              >
                Change Image
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
                id="disease-submit-btn"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ width: '0.9rem', height: '0.9rem', borderWidth: '2px' }}></div>
                    Analyzing...
                  </>
                ) : (
                  '🔬 Detect Disease'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
