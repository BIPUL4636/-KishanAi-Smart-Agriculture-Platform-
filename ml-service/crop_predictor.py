"""
Crop Recommendation Predictor — Random Forest model trained on Kaggle crop dataset.
Predicts the best crop based on soil nutrients (N, P, K), temperature, humidity, pH, and rainfall.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'crop_model.pkl')

# All 22 crops from the Kaggle crop recommendation dataset
CROP_LABELS = [
    'apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee',
    'cotton', 'grapes', 'jute', 'kidneybeans', 'lentil', 'maize',
    'mango', 'mothbeans', 'mungbean', 'muskmelon', 'orange', 'papaya',
    'pigeonpeas', 'pomegranate', 'rice', 'watermelon'
]

# Optimal growing conditions for each crop (N, P, K, temp, humidity, pH, rainfall)
# Used to generate training data when the pre-trained model file is not available
CROP_CONDITIONS = {
    'rice':         {'N': (60, 100), 'P': (35, 65), 'K': (35, 55), 'temp': (20, 27), 'humidity': (80, 95), 'pH': (5.0, 7.0), 'rainfall': (200, 300)},
    'maize':        {'N': (60, 100), 'P': (35, 65), 'K': (15, 35), 'temp': (18, 27), 'humidity': (55, 75), 'pH': (5.5, 7.0), 'rainfall': (60, 110)},
    'chickpea':     {'N': (15, 45), 'P': (55, 85), 'K': (75, 85), 'temp': (15, 22), 'humidity': (14, 20), 'pH': (6.0, 8.0), 'rainfall': (60, 100)},
    'kidneybeans':  {'N': (15, 35), 'P': (55, 75), 'K': (15, 25), 'temp': (15, 22), 'humidity': (18, 24), 'pH': (5.5, 7.0), 'rainfall': (60, 120)},
    'pigeonpeas':   {'N': (15, 35), 'P': (55, 75), 'K': (15, 25), 'temp': (18, 36), 'humidity': (30, 70), 'pH': (5.0, 7.5), 'rainfall': (100, 200)},
    'mothbeans':    {'N': (15, 35), 'P': (40, 65), 'K': (15, 25), 'temp': (24, 32), 'humidity': (40, 65), 'pH': (3.5, 9.0), 'rainfall': (30, 70)},
    'mungbean':     {'N': (15, 35), 'P': (40, 65), 'K': (15, 25), 'temp': (25, 32), 'humidity': (80, 95), 'pH': (6.0, 7.5), 'rainfall': (30, 60)},
    'blackgram':    {'N': (25, 50), 'P': (55, 75), 'K': (15, 25), 'temp': (25, 35), 'humidity': (60, 75), 'pH': (6.0, 8.0), 'rainfall': (60, 80)},
    'lentil':       {'N': (15, 30), 'P': (55, 80), 'K': (15, 25), 'temp': (18, 30), 'humidity': (20, 60), 'pH': (6.0, 8.0), 'rainfall': (35, 55)},
    'pomegranate':  {'N': (15, 30), 'P': (5, 20), 'K': (35, 45), 'temp': (18, 25), 'humidity': (85, 95), 'pH': (5.5, 7.5), 'rainfall': (100, 120)},
    'banana':       {'N': (80, 120), 'P': (70, 95), 'K': (45, 55), 'temp': (25, 32), 'humidity': (75, 85), 'pH': (5.5, 7.0), 'rainfall': (90, 120)},
    'mango':        {'N': (15, 35), 'P': (15, 35), 'K': (25, 40), 'temp': (27, 37), 'humidity': (45, 65), 'pH': (5.5, 7.5), 'rainfall': (90, 110)},
    'grapes':       {'N': (15, 35), 'P': (120, 145), 'K': (195, 210), 'temp': (8, 42), 'humidity': (78, 84), 'pH': (5.5, 7.0), 'rainfall': (60, 80)},
    'watermelon':   {'N': (80, 110), 'P': (5, 20), 'K': (45, 55), 'temp': (24, 28), 'humidity': (80, 92), 'pH': (6.0, 7.0), 'rainfall': (40, 60)},
    'muskmelon':    {'N': (80, 110), 'P': (5, 20), 'K': (45, 55), 'temp': (27, 30), 'humidity': (90, 95), 'pH': (6.0, 7.0), 'rainfall': (20, 50)},
    'apple':        {'N': (15, 35), 'P': (120, 145), 'K': (195, 210), 'temp': (21, 25), 'humidity': (90, 94), 'pH': (5.5, 6.5), 'rainfall': (100, 130)},
    'orange':       {'N': (15, 30), 'P': (5, 15), 'K': (5, 15), 'temp': (15, 25), 'humidity': (90, 95), 'pH': (6.5, 8.0), 'rainfall': (100, 120)},
    'papaya':       {'N': (35, 65), 'P': (45, 65), 'K': (45, 55), 'temp': (20, 34), 'humidity': (90, 95), 'pH': (6.0, 7.0), 'rainfall': (130, 175)},
    'coconut':      {'N': (15, 30), 'P': (5, 15), 'K': (25, 40), 'temp': (25, 30), 'humidity': (90, 98), 'pH': (5.5, 7.0), 'rainfall': (130, 180)},
    'cotton':       {'N': (100, 140), 'P': (40, 65), 'K': (15, 25), 'temp': (22, 28), 'humidity': (75, 85), 'pH': (6.0, 8.0), 'rainfall': (60, 110)},
    'jute':         {'N': (60, 100), 'P': (35, 55), 'K': (35, 45), 'temp': (23, 37), 'humidity': (78, 90), 'pH': (6.0, 7.5), 'rainfall': (150, 200)},
    'coffee':       {'N': (80, 120), 'P': (15, 35), 'K': (25, 35), 'temp': (23, 28), 'humidity': (55, 70), 'pH': (6.0, 7.0), 'rainfall': (140, 175)},
}

# Generates a reasoning string explaining why the crop suits the given conditions
def generate_reasoning(crop, inputs):
    conditions = CROP_CONDITIONS.get(crop.lower(), None)
    if not conditions:
        return f"{crop.capitalize()} is the best match for your soil and climate conditions."

    reasons = []
    n, p, k = inputs['N'], inputs['P'], inputs['K']
    temp, hum = inputs['temperature'], inputs['humidity']
    ph, rain = inputs['pH'], inputs['rainfall']

    if conditions['temp'][0] <= temp <= conditions['temp'][1]:
        reasons.append(f"Temperature ({temp}°C) is ideal for {crop}")
    if conditions['humidity'][0] <= hum <= conditions['humidity'][1]:
        reasons.append(f"Humidity ({hum}%) matches {crop}'s requirement")
    if conditions['pH'][0] <= ph <= conditions['pH'][1]:
        reasons.append(f"Soil pH ({ph}) is in the optimal range")
    if conditions['rainfall'][0] <= rain <= conditions['rainfall'][1]:
        reasons.append(f"Rainfall ({rain}mm) suits {crop}'s water needs")

    if not reasons:
        reasons.append(f"Your soil nutrient profile (N:{n}, P:{p}, K:{k}) best matches {crop}")

    return ". ".join(reasons) + "."


# Generates synthetic training data from crop condition ranges
def generate_training_data(samples_per_crop=100):
    data = []
    for crop, conditions in CROP_CONDITIONS.items():
        for _ in range(samples_per_crop):
            row = {
                'N': np.random.uniform(conditions['N'][0], conditions['N'][1]),
                'P': np.random.uniform(conditions['P'][0], conditions['P'][1]),
                'K': np.random.uniform(conditions['K'][0], conditions['K'][1]),
                'temperature': np.random.uniform(conditions['temp'][0], conditions['temp'][1]),
                'humidity': np.random.uniform(conditions['humidity'][0], conditions['humidity'][1]),
                'pH': np.random.uniform(conditions['pH'][0], conditions['pH'][1]),
                'rainfall': np.random.uniform(conditions['rainfall'][0], conditions['rainfall'][1]),
                'label': crop,
            }
            data.append(row)
    return pd.DataFrame(data)


# Trains a Random Forest classifier and saves it to disk
def train_model():
    print("🌱 Training crop recommendation model...")
    df = generate_training_data(samples_per_crop=150)

    features = ['N', 'P', 'K', 'temperature', 'humidity', 'pH', 'rainfall']
    X = df[features].values
    y = df['label'].values

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"✅ Model trained — accuracy: {accuracy:.2%}")

    # Save model and label encoder together
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({'model': model, 'label_encoder': le, 'features': features}, f)

    print(f"💾 Model saved to {MODEL_PATH}")
    return model, le


# Loads the pre-trained model, or trains a new one if the file doesn't exist
def load_model():
    if os.path.exists(MODEL_PATH):
        print(f"📦 Loading crop model from {MODEL_PATH}")
        with open(MODEL_PATH, 'rb') as f:
            data = pickle.load(f)
        return data['model'], data['label_encoder']
    else:
        print("⚠️ No pre-trained model found. Training a new model...")
        return train_model()


# Module-level model loading — happens once when the Flask app starts
_model, _label_encoder = None, None


def get_model():
    global _model, _label_encoder
    if _model is None:
        _model, _label_encoder = load_model()
    return _model, _label_encoder


# Predicts the best crop for given soil and climate inputs
def predict_crop(N, P, K, temperature, humidity, pH, rainfall):
    model, le = get_model()

    input_data = np.array([[N, P, K, temperature, humidity, pH, rainfall]])

    # Get prediction and probabilities
    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]

    crop_name = le.inverse_transform([prediction])[0]
    confidence = float(np.max(probabilities) * 100)

    # Generate reasoning
    inputs = {
        'N': N, 'P': P, 'K': K,
        'temperature': temperature, 'humidity': humidity,
        'pH': pH, 'rainfall': rainfall,
    }
    reasoning = generate_reasoning(crop_name, inputs)

    return {
        'crop': crop_name.capitalize(),
        'cropName': crop_name.capitalize(),
        'confidence': round(confidence, 2),
        'reasoning': reasoning,
    }
