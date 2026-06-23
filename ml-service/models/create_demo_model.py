"""
Create a demo MobileNetV2-based disease detection model.

Architecture:
    MobileNetV2 (ImageNet weights, frozen) → GlobalAveragePooling2D → Dense(38, softmax)

This produces an UNTRAINED model with random classification head weights.
It is suitable for testing the inference pipeline end-to-end.
For production accuracy, retrain on the PlantVillage dataset.

Outputs:
    models/disease_model.h5       — Keras SavedModel (HDF5)
    models/disease_model.tflite   — TFLite with dynamic-range quantization

Usage:
    pip install tensorflow
    python models/create_demo_model.py
"""

import os
import sys

# ── Step 0: Setup paths ──────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
H5_PATH = os.path.join(SCRIPT_DIR, 'disease_model.h5')
TFLITE_PATH = os.path.join(SCRIPT_DIR, 'disease_model.tflite')

NUM_CLASSES = 38
INPUT_SHAPE = (224, 224, 3)


def create_model():
    """Step 1: Build MobileNetV2 + classification head."""
    import tensorflow as tf

    print("=" * 60)
    print("Step 1/3 — Building MobileNetV2 model")
    print("=" * 60)

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=INPUT_SHAPE,
        include_top=False,
        weights='imagenet',
    )
    base_model.trainable = False  # Freeze backbone

    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(NUM_CLASSES, activation='softmax'),
    ])

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    model.summary()
    print(f"\n✅ Model built — {NUM_CLASSES} output classes, "
          f"input shape {INPUT_SHAPE}\n")

    return model


def save_h5(model):
    """Step 2: Save as Keras HDF5."""
    import tensorflow as tf

    print("=" * 60)
    print("Step 2/3 — Saving Keras HDF5 model")
    print("=" * 60)

    model.save(H5_PATH)
    size_mb = os.path.getsize(H5_PATH) / (1024 * 1024)
    print(f"✅ Saved: {H5_PATH}")
    print(f"   Size:  {size_mb:.2f} MB\n")


def convert_tflite():
    """Step 3: Convert .h5 → .tflite with dynamic-range quantization."""
    import tensorflow as tf

    print("=" * 60)
    print("Step 3/3 — Converting to TFLite")
    print("=" * 60)

    model = tf.keras.models.load_model(H5_PATH)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]

    tflite_model = converter.convert()

    with open(TFLITE_PATH, 'wb') as f:
        f.write(tflite_model)

    size_mb = os.path.getsize(TFLITE_PATH) / (1024 * 1024)
    print(f"✅ Saved: {TFLITE_PATH}")
    print(f"   Size:  {size_mb:.2f} MB\n")


def main():
    print("\n🌿 KishanAi — Demo Disease Detection Model Creator\n")

    model = create_model()
    save_h5(model)
    convert_tflite()

    print("=" * 60)
    print("🎉 All done!")
    print("=" * 60)
    print(f"   H5 model:     {H5_PATH}")
    print(f"   TFLite model:  {TFLITE_PATH}")
    print()
    print("Next steps:")
    print("   1. git add models/disease_model.h5 models/disease_model.tflite")
    print("   2. git commit -m 'Add demo disease detection model'")
    print("   3. git push")
    print()
    print("⚠️  This model has RANDOM classification weights.")
    print("   For accurate predictions, retrain on the PlantVillage dataset.")


if __name__ == '__main__':
    main()
