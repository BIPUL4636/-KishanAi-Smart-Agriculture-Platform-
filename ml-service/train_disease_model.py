"""
KishanAi — Disease Detection Model Training and Evaluation Script.
Trains a MobileNetV2/EfficientNetB0 classifier on the PlantVillage dataset,
addresses dataset imbalance, prevents overfitting, evaluates performance,
and outputs Keras (.h5) and TFLite (.tflite) formats.

Usage:
    python train_disease_model.py --dataset_dir /path/to/plantvillage
"""

import os
import argparse
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2, EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, Input
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

# Prevent TF logs flooding
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


def analyze_dataset_imbalance(dataset_dir):
    """
    Task 6: Check for dataset imbalance.
    Counts the number of images in each class folder and identifies minority classes.
    """
    print("\n🔍 Step 1: Analyzing Dataset Balance...")
    if not os.path.exists(dataset_dir):
        print(f"❌ Error: Dataset directory '{dataset_dir}' not found.")
        print("Please download the PlantVillage dataset and specify the correct directory path.")
        return None

    class_counts = {}
    total_images = 0
    for class_name in sorted(os.listdir(dataset_dir)):
        class_path = os.path.join(dataset_dir, class_name)
        if os.path.isdir(class_path):
            num_images = len([f for f in os.listdir(class_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
            class_counts[class_name] = num_images
            total_images += num_images

    print(f"✅ Found {len(class_counts)} classes with a total of {total_images} images.\n")
    print(f"{'Class Name':<60} | {'Image Count':<12} | {'Percentage':<10}")
    print("-" * 90)
    for class_name, count in class_counts.items():
        pct = (count / total_images) * 100
        print(f"{class_name:<60} | {count:<12} | {pct:.2f}%")

    counts = list(class_counts.values())
    min_class = min(class_counts, key=class_counts.get)
    max_class = max(class_counts, key=class_counts.get)
    print("\n📈 Dataset Imbalance Summary:")
    print(f"  - Maximum class samples: {class_counts[max_class]} ({max_class})")
    print(f"  - Minimum class samples: {class_counts[min_class]} ({min_class})")
    print(f"  - Imbalance Ratio (Max/Min): {class_counts[max_class] / (class_counts[min_class] + 1e-6):.2f}")

    # Identify classes with insufficient samples (< 300 images)
    insufficient = {c: count for c, count in class_counts.items() if count < 300}
    if insufficient:
        print("\n⚠️ Warning: The following classes have insufficient samples (< 300 images):")
        for c, count in insufficient.items():
            print(f"  - {c}: {count} images")
        print("\n💡 Recommendation for Balancing:")
        print("  1. Use class weights during model training (enabled by default in this script).")
        print("  2. Apply focal loss to focus learning on hard/minority classes.")
        print("  3. Apply online/offline data augmentation selectively to minority classes.")
    else:
        print("\n✅ All classes have healthy sample counts (> 300 images).")

    return class_counts


def build_pipeline(dataset_dir, batch_size=32, target_size=(224, 224), backbone='mobilenet'):
    """
    Task 2 & 8: Verify preprocessing, add data augmentation, and use transfer learning.
    Sets up training and validation image generators.
    """
    print("\n📦 Step 2: Configuring Data Generators & Preprocessing...")
    
    # Task 8: Add Data Augmentation to prevent overfitting
    train_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input if backbone == 'mobilenet' else tf.keras.applications.efficientnet.preprocess_input,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2  # 80/20 train/validation split
    )

    val_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input if backbone == 'mobilenet' else tf.keras.applications.efficientnet.preprocess_input,
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=target_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True,
        seed=42
    )

    val_generator = val_datagen.flow_from_directory(
        dataset_dir,
        target_size=target_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False, # Must be False for confusion matrix calculation
        seed=42
    )

    # Task 3: Print and verify class mapping indices
    print("\n🏷️ Task 3 — Verifying Class Indices Mapping:")
    class_indices = train_generator.class_indices
    for k, v in class_indices.items():
        print(f"  Index {v:2d} -> {k}")

    return train_generator, val_generator


def train_model(train_gen, val_gen, epochs=15, backbone='mobilenet', output_dir='models'):
    """
    Task 8: Build the model utilizing transfer learning, dropout, and callbacks.
    """
    num_classes = train_gen.num_classes
    print(f"\n🏗️ Step 3: Building {backbone.capitalize()} Transfer Learning Model...")

    inputs = Input(shape=(224, 224, 3))

    if backbone == 'mobilenet':
        base_model = MobileNetV2(weights='imagenet', include_top=False, input_tensor=inputs)
    else:
        base_model = EfficientNetB0(weights='imagenet', include_top=False, input_tensor=inputs)

    # Freeze base model weights
    base_model.trainable = False

    # Add classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    
    # Task 8: Add Dropout layer to prevent overfitting
    x = Dropout(0.5)(x)
    
    outputs = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=inputs, outputs=outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    os.makedirs(output_dir, exist_ok=True)
    h5_path = os.path.join(output_dir, 'disease_model.h5')

    # Task 8: Callbacks for early stopping, learning rate reduction, and model checkpoints
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=2, min_lr=1e-6, verbose=1),
        ModelCheckpoint(h5_path, monitor='val_loss', save_best_only=True, verbose=1)
    ]

    # Calculate class weights to handle imbalance
    class_counts = np.bincount(train_gen.classes)
    total_samples = np.sum(class_counts)
    class_weights = {i: total_samples / (len(class_counts) * count) for i, count in enumerate(class_counts)}

    print("\n🚀 Step 4: Training Model...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=callbacks
    )

    print(f"\n✅ Training Complete. Best model saved to: {h5_path}")
    return model, history


def evaluate_and_report(model, val_gen, class_indices, output_dir='models'):
    """
    Task 5 & 7: Generate confusion matrix, classification report, and plot metrics.
    """
    print("\n📊 Step 5: Evaluating Model Performance...")
    
    # Get predictions
    val_gen.reset()
    predictions = model.predict(val_gen, verbose=1)
    y_pred = np.argmax(predictions, axis=1)
    y_true = val_gen.classes

    class_names = list(class_indices.keys())

    # Task 5: Classification Report
    print("\n📄 Classification Report:")
    report = classification_report(y_true, y_pred, target_names=class_names)
    print(report)

    with open(os.path.join(output_dir, 'classification_report.txt'), 'w') as f:
        f.write(report)

    # Task 5: Confusion Matrix
    print("🎨 Generating Confusion Matrix...")
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(24, 20))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title('Plant Disease Classification Confusion Matrix')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.xticks(rotation=90)
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    cm_path = os.path.join(output_dir, 'confusion_matrix.png')
    plt.savefig(cm_path)
    plt.close()
    print(f"✅ Confusion Matrix saved to: {cm_path}")


def convert_to_tflite(h5_model_path, tflite_model_path):
    """
    Converts trained Keras model to TFLite format with dynamic quantization.
    """
    print("\n🔄 Step 6: Converting Model to TFLite format...")
    if not os.path.exists(h5_model_path):
        print(f"❌ Error: Model file '{h5_model_path}' not found for conversion.")
        return

    model = tf.keras.models.load_model(h5_model_path)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    with open(tflite_model_path, 'wb') as f:
        f.write(tflite_model)
    
    size_mb = os.path.getsize(tflite_model_path) / (1024 * 1024)
    print(f"✅ Saved TFLite model to {tflite_model_path} (Size: {size_mb:.2f} MB)")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train Plant Disease Detection Model")
    parser.add_argument('--dataset_dir', type=str, required=True, help="Path to PlantVillage dataset folder")
    parser.add_argument('--backbone', type=str, default='mobilenet', choices=['mobilenet', 'efficientnet'], help="Model backbone")
    parser.add_argument('--epochs', type=str, default='15', help="Number of training epochs")
    parser.add_argument('--batch_size', type=str, default='32', help="Batch size")
    args = parser.parse_args()

    # Step 1: Imbalance check
    analyze_dataset_imbalance(args.dataset_dir)

    # Step 2: Generators
    train_gen, val_gen = build_pipeline(
        args.dataset_dir,
        batch_size=int(args.batch_size),
        backbone=args.backbone
    )

    # Step 3 & 4: Train
    model, history = train_model(
        train_gen,
        val_gen,
        epochs=int(args.epochs),
        backbone=args.backbone
    )

    # Step 5: Evaluate
    evaluate_and_report(model, val_gen, train_gen.class_indices)

    # Step 6: Convert
    h5_path = 'models/disease_model.h5'
    tflite_path = 'models/disease_model.tflite'
    convert_to_tflite(h5_path, tflite_path)
