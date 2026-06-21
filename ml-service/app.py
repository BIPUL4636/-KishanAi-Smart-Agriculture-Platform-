"""
KishanAi ML Microservice — Flask API for crop recommendation and disease detection.
Endpoints: /health, /recommend-crop, /detect-disease
Called internally by the Node.js backend — not exposed to the frontend directly.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from crop_predictor import predict_crop
from disease_predictor import predict_disease

app = Flask(__name__)
CORS(app)

# Maximum upload size: 10MB
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024


# Health check endpoint — used by Node.js backend and deployment platforms
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'KishanAi ML Service',
        'version': '1.0.0',
    }), 200


# Crop recommendation endpoint — accepts soil and climate data, returns best crop
@app.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Request body is required (JSON)'}), 400

        # Validate required fields
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'pH', 'rainfall']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

        # Parse and validate values
        try:
            N = float(data['N'])
            P = float(data['P'])
            K = float(data['K'])
            temperature = float(data['temperature'])
            humidity = float(data['humidity'])
            pH = float(data['pH'])
            rainfall = float(data['rainfall'])
        except (ValueError, TypeError) as e:
            return jsonify({'error': f'All values must be valid numbers: {str(e)}'}), 400

        # Run prediction
        result = predict_crop(N, P, K, temperature, humidity, pH, rainfall)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


# Disease detection endpoint — accepts leaf image, returns disease diagnosis
@app.route('/detect-disease', methods=['POST'])
def detect_disease():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No image file uploaded. Use field name "file".'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'Empty filename — please select a valid image'}), 400

        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'webp'}
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
        if ext not in allowed_extensions:
            return jsonify({'error': f'Invalid file type ".{ext}". Allowed: {", ".join(allowed_extensions)}'}), 400

        # Read image bytes
        image_bytes = file.read()

        if len(image_bytes) == 0:
            return jsonify({'error': 'Uploaded file is empty'}), 400

        # Run prediction
        result = predict_disease(image_bytes)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'Disease detection failed: {str(e)}'}), 500


# Start the Flask development server
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'

    print(f"[KishanAi] ML Service starting on port {port}")
    print(f"   Endpoints:")
    print(f"   GET  /health")
    print(f"   POST /recommend-crop")
    print(f"   POST /detect-disease")

    app.run(host='0.0.0.0', port=port, debug=debug)
