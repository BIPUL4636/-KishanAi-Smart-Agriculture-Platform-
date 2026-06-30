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
          <div className="dropzone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-textMuted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          {isDragActive ? (
            <p className="dropzone-text-active">Drop the leaf image here...</p>
          ) : (
            <>
              <p className="dropzone-text-primary">Drag & drop a leaf photo here</p>
              <p className="dropzone-text-secondary">or click to browse — JPG, PNG, WebP up to 10MB</p>
            </>
          )}
          <p className="dropzone-tip">
            💡 Tip: Take a clear photo of the affected leaf in good natural lighting
          </p>
        </div>
      ) : (
        /* Image Preview */
        <div className="fade-in">
          <div className="leaf-preview-container">
            <img
              src={preview}
              alt="Leaf preview"
              loading="lazy"
            />
          </div>
          <div className="leaf-preview-actions">
            <p className="leaf-preview-meta">
              📎 {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <div className="leaf-preview-buttons">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleClear}
                disabled={isLoading}
              >
                Change Image
              </button>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={isLoading}
                id="disease-submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="spinner spinner-sm"></div>
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
