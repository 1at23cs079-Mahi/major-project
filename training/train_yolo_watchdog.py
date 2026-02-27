"""
YOLO Proctoring Watchdog - Training Script
=============================================
Trains a YOLOv11 model to detect cheating objects in webcam frames.

Detected classes:
  0: mobile_phone
  1: book
  2: notes
  3: earphone
  4: secondary_screen
  5: extra_person
  6: hand_gesture
  7: laptop

Prerequisites:
  pip install ultralytics roboflow

Dataset Sources:
  - Roboflow Universe: Search "Online Exam Cheating" or "Proctoring"
    Download in YOLOv8 format
  - Mendeley: "Students Suspicious Behaviors Detection Dataset"

Usage:
  1. Download dataset from Roboflow in YOLOv8 format
  2. Update DATASET_PATH below
  3. Run: python train_yolo_watchdog.py
  4. Export trained model to ONNX for browser deployment
  5. Place .onnx file in public/models/ of the HiReady web app
"""

import os
import argparse
from pathlib import Path

def create_dataset_yaml(dataset_path: str, output_path: str) -> str:
    """Create or validate the dataset YAML configuration."""
    yaml_content = f"""
# HiReady Proctoring Dataset Configuration
path: {dataset_path}
train: images/train
val: images/val
test: images/test

# Number of classes
nc: 8

# Class names (must match PROCTOR_CLASSES in useObjectDetection.tsx)
names:
  0: mobile_phone
  1: book
  2: notes
  3: earphone
  4: secondary_screen
  5: extra_person
  6: hand_gesture
  7: laptop
"""
    yaml_path = os.path.join(output_path, "proctoring_data.yaml")
    with open(yaml_path, "w") as f:
        f.write(yaml_content)
    print(f"Dataset YAML written to: {yaml_path}")
    return yaml_path


def download_from_roboflow(api_key: str, workspace: str, project: str, version: int, output_dir: str):
    """Download dataset from Roboflow Universe."""
    try:
        from roboflow import Roboflow
        rf = Roboflow(api_key=api_key)
        proj = rf.workspace(workspace).project(project)
        dataset = proj.version(version).download("yolov8", location=output_dir)
        print(f"Dataset downloaded to: {output_dir}")
        return dataset
    except ImportError:
        print("Install roboflow: pip install roboflow")
        raise


def train(
    dataset_yaml: str,
    model_size: str = "n",  # n=nano, s=small, m=medium, l=large, x=extra-large
    epochs: int = 50,
    imgsz: int = 640,
    batch: int = 16,
    device: str = "0",      # GPU device, "cpu" for CPU training
    project: str = "runs/proctoring",
    name: str = "watchdog",
):
    """Train YOLOv11 model on proctoring dataset."""
    from ultralytics import YOLO

    # Load pre-trained YOLOv11 base model
    model_name = f"yolo11{model_size}.pt"
    print(f"Loading base model: {model_name}")
    model = YOLO(model_name)

    # Train
    print(f"Starting training: {epochs} epochs, image size {imgsz}")
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        project=project,
        name=name,
        # Training hyperparameters optimized for webcam proctoring
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        warmup_momentum=0.8,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        hsv_h=0.015,     # augmentation
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        mosaic=1.0,
    )

    print(f"\nTraining complete!")
    print(f"Best model saved to: {project}/{name}/weights/best.pt")
    return results


def export_to_onnx(
    model_path: str,
    imgsz: int = 640,
    output_dir: str = "../public/models",
):
    """Export trained YOLO model to ONNX format for browser inference."""
    from ultralytics import YOLO

    print(f"Loading trained model: {model_path}")
    model = YOLO(model_path)

    # Export to ONNX
    print("Exporting to ONNX format...")
    onnx_path = model.export(
        format="onnx",
        imgsz=imgsz,
        simplify=True,
        opset=12,       # ONNX opset compatible with onnxruntime-web
        dynamic=False,  # Static shapes for better browser performance
    )

    # Copy to web app public directory
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "proctor-yolo.onnx")

    import shutil
    shutil.copy2(onnx_path, output_file)
    print(f"\nONNX model exported to: {output_file}")
    print(f"File size: {os.path.getsize(output_file) / 1024 / 1024:.1f} MB")
    print(f"\nTo use in the app, the model is available at /models/proctor-yolo.onnx")

    return output_file


def validate(model_path: str, dataset_yaml: str):
    """Validate trained model performance."""
    from ultralytics import YOLO

    model = YOLO(model_path)
    results = model.val(data=dataset_yaml)

    print("\nValidation Results:")
    print(f"  mAP50:    {results.box.map50:.4f}")
    print(f"  mAP50-95: {results.box.map:.4f}")
    print(f"  Precision: {results.box.mp:.4f}")
    print(f"  Recall:    {results.box.mr:.4f}")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLO Proctoring Watchdog")
    parser.add_argument("--action", choices=["train", "export", "validate", "download", "yaml"],
                        default="train", help="Action to perform")
    parser.add_argument("--dataset", type=str, default="./datasets/proctoring",
                        help="Path to dataset directory")
    parser.add_argument("--model-size", type=str, default="n",
                        choices=["n", "s", "m", "l", "x"],
                        help="YOLO model size (n=nano is best for browser)")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", type=str, default="0")
    parser.add_argument("--model-path", type=str, default="runs/proctoring/watchdog/weights/best.pt",
                        help="Path to trained model (for export/validate)")
    parser.add_argument("--roboflow-key", type=str, help="Roboflow API key for download")
    parser.add_argument("--roboflow-workspace", type=str, help="Roboflow workspace name")
    parser.add_argument("--roboflow-project", type=str, help="Roboflow project name")
    parser.add_argument("--roboflow-version", type=int, default=1, help="Dataset version")

    args = parser.parse_args()

    if args.action == "yaml":
        create_dataset_yaml(args.dataset, ".")

    elif args.action == "download":
        if not args.roboflow_key:
            print("Error: --roboflow-key required for download")
            exit(1)
        download_from_roboflow(
            args.roboflow_key,
            args.roboflow_workspace or "",
            args.roboflow_project or "",
            args.roboflow_version,
            args.dataset,
        )

    elif args.action == "train":
        yaml_path = create_dataset_yaml(args.dataset, ".")
        train(
            dataset_yaml=yaml_path,
            model_size=args.model_size,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            device=args.device,
        )

    elif args.action == "export":
        export_to_onnx(args.model_path, args.imgsz)

    elif args.action == "validate":
        yaml_path = create_dataset_yaml(args.dataset, ".")
        validate(args.model_path, yaml_path)
