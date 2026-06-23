"""
One-time conversion script: Keras .h5 model → TFLite .tflite model.

Run this LOCALLY (not on Render) where you have full TensorFlow installed:
    pip install tensorflow
    python convert_model.py

It reads  models/disease_model.h5
and writes models/disease_model.tflite

After conversion, commit the .tflite file and push to GitHub.
You can then remove full TensorFlow from your local env if you like.
"""

import os
import tensorflow as tf

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
H5_PATH = os.path.join(MODEL_DIR, 'disease_model.h5')
TFLITE_PATH = os.path.join(MODEL_DIR, 'disease_model.tflite')


def convert():
    if not os.path.exists(H5_PATH):
        print(f"❌ Source model not found at {H5_PATH}")
        print("   Place your trained disease_model.h5 in the models/ directory first.")
        return

    print(f"📦 Loading Keras model from {H5_PATH} ...")
    model = tf.keras.models.load_model(H5_PATH)
    model.summary()

    print("\n🔄 Converting to TFLite ...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Dynamic-range quantization — shrinks the model ~4× with minimal accuracy loss
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    with open(TFLITE_PATH, 'wb') as f:
        f.write(tflite_model)

    size_mb = os.path.getsize(TFLITE_PATH) / (1024 * 1024)
    print(f"\n✅ Saved TFLite model to {TFLITE_PATH}")
    print(f"   Size: {size_mb:.2f} MB")
    print("\nNext steps:")
    print("   1. git add models/disease_model.tflite")
    print("   2. git commit -m 'Add TFLite model for Render deployment'")
    print("   3. git push")


if __name__ == '__main__':
    convert()
