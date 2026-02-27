"""
Vision LLM Fine-Tuning Script for Proctoring "Judge"
======================================================
Fine-tunes an open-source Vision LLM (Qwen-VL or LLaVA) using LoRA
to serve as the contextual "Judge" in the hybrid proctoring pipeline.

When the YOLO watchdog flags a suspicious frame, this fine-tuned VLM
analyzes the image and provides a detailed, structured verdict.

Prerequisites:
  pip install llama-factory datasets transformers peft accelerate bitsandbytes

Hardware Requirements:
  - Fine-tuning: 1x NVIDIA A100 (40GB) or H100 (80GB)
  - Inference: 1x NVIDIA A10G, L4, or T4 (24GB)
  - Rentable on RunPod (~$2/hr for A100), Lambda Cloud, or AWS p4d

Base Models (choose one):
  - Qwen/Qwen-VL-Chat (recommended, latest, best benchmarks)
  - liuhaotian/llava-v1.5-7b (battle-tested, large community)
  - THUDM/cogvlm-chat (good alternative)

Usage:
  1. Prepare your dataset in JSONL format (see format_dataset())
  2. Update BASE_MODEL below
  3. Run: python finetune_vlm_judge.py --action prepare  (format data)
  4. Run: python finetune_vlm_judge.py --action train    (LoRA fine-tune)
  5. Run: python finetune_vlm_judge.py --action merge    (merge LoRA weights)
  6. Deploy with vLLM: python -m vllm.entrypoints.openai.api_server \\
       --model ./merged_model --port 8000
"""

import os
import json
import argparse
from pathlib import Path
from typing import Optional


# ============================================================================
# Configuration
# ============================================================================
BASE_MODEL = "Qwen/Qwen-VL-Chat"  # or "liuhaotian/llava-v1.5-7b"
OUTPUT_DIR = "./runs/vlm-judge"
DATASET_DIR = "./datasets/vlm_proctoring"


# ============================================================================
# Dataset Preparation
# ============================================================================

SYSTEM_PROMPT = (
    "You are an AI proctor monitoring a candidate taking an exam. "
    "Analyze this webcam frame carefully. Look for: phones, books, notes, "
    "earphones, additional monitors, extra people, or any other cheating indicators. "
    "Output a JSON object with these fields:\n"
    '  "violation": boolean,\n'
    '  "reason": string (detailed explanation),\n'
    '  "confidence": number (0.0 to 1.0),\n'
    '  "flag_type": string (one of: PHONE_DETECTED, UNAUTHORIZED_OBJECT, '
    "ANOTHER_PERSON, SECONDARY_MONITOR, OTHER)\n"
    "If no violation is detected, set violation to false."
)


def create_sample_dataset(output_dir: str):
    """Create a sample JSONL dataset structure for fine-tuning.

    In production, you would generate these from your labeled webcam images.
    Each entry pairs an image with the expected proctor analysis.
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "images"), exist_ok=True)

    samples = [
        {
            "id": "train_001",
            "image": "images/phone_visible_001.jpg",
            "conversations": [
                {
                    "from": "user",
                    "value": f"<img>images/phone_visible_001.jpg</img>\n{SYSTEM_PROMPT}\n\nAnalyze this webcam frame."
                },
                {
                    "from": "assistant",
                    "value": json.dumps({
                        "violation": True,
                        "reason": "The candidate is holding a smartphone in their left hand, partially hidden below the desk level. The screen appears to be illuminated, suggesting active use.",
                        "confidence": 0.92,
                        "flag_type": "PHONE_DETECTED"
                    })
                }
            ]
        },
        {
            "id": "train_002",
            "image": "images/clean_frame_001.jpg",
            "conversations": [
                {
                    "from": "user",
                    "value": f"<img>images/clean_frame_001.jpg</img>\n{SYSTEM_PROMPT}\n\nAnalyze this webcam frame."
                },
                {
                    "from": "assistant",
                    "value": json.dumps({
                        "violation": False,
                        "reason": "No violation detected. The candidate is facing the camera directly with no unauthorized objects visible in the frame.",
                        "confidence": 0.05,
                        "flag_type": "OTHER"
                    })
                }
            ]
        },
        {
            "id": "train_003",
            "image": "images/two_people_001.jpg",
            "conversations": [
                {
                    "from": "user",
                    "value": f"<img>images/two_people_001.jpg</img>\n{SYSTEM_PROMPT}\n\nAnalyze this webcam frame."
                },
                {
                    "from": "assistant",
                    "value": json.dumps({
                        "violation": True,
                        "reason": "Two faces are visible in the frame. A second person is partially visible behind the candidate's right shoulder, appearing to look at the screen.",
                        "confidence": 0.88,
                        "flag_type": "ANOTHER_PERSON"
                    })
                }
            ]
        },
        {
            "id": "train_004",
            "image": "images/notes_visible_001.jpg",
            "conversations": [
                {
                    "from": "user",
                    "value": f"<img>images/notes_visible_001.jpg</img>\n{SYSTEM_PROMPT}\n\nAnalyze this webcam frame."
                },
                {
                    "from": "assistant",
                    "value": json.dumps({
                        "violation": True,
                        "reason": "Written notes or a textbook are visible on the desk in front of the candidate. The pages appear to contain text and diagrams.",
                        "confidence": 0.85,
                        "flag_type": "UNAUTHORIZED_OBJECT"
                    })
                }
            ]
        },
    ]

    # Write training data
    train_path = os.path.join(output_dir, "train.jsonl")
    with open(train_path, "w") as f:
        for sample in samples:
            f.write(json.dumps(sample) + "\n")

    print(f"Sample dataset written to: {train_path}")
    print(f"  {len(samples)} training samples")
    print(f"\nTo create a real dataset:")
    print(f"  1. Collect webcam images of cheating scenarios")
    print(f"  2. Label each image with the expected JSON verdict")
    print(f"  3. Follow the same JSONL format as above")
    print(f"  4. Aim for 500-2000 labeled examples for good results")

    return train_path


# ============================================================================
# Training with LLaMA-Factory
# ============================================================================

def generate_llamafactory_config(
    dataset_path: str,
    output_dir: str,
    model_name: str = BASE_MODEL,
    epochs: int = 3,
    batch_size: int = 2,
    learning_rate: float = 2e-4,
    lora_rank: int = 64,
    lora_alpha: int = 128,
) -> str:
    """Generate a LLaMA-Factory training configuration YAML."""

    config = {
        "model_name_or_path": model_name,
        "stage": "sft",
        "do_train": True,
        "finetuning_type": "lora",
        "lora_rank": lora_rank,
        "lora_alpha": lora_alpha,
        "lora_target": "all",
        "dataset": "proctoring_vlm",
        "template": "qwen_vl" if "qwen" in model_name.lower() else "llava",
        "cutoff_len": 2048,
        "max_samples": 10000,
        "overwrite_cache": True,
        "preprocessing_num_workers": 4,
        "output_dir": output_dir,
        "logging_steps": 10,
        "save_steps": 100,
        "save_total_limit": 3,
        "plot_loss": True,
        "overwrite_output_dir": True,
        "per_device_train_batch_size": batch_size,
        "gradient_accumulation_steps": 4,
        "learning_rate": learning_rate,
        "num_train_epochs": epochs,
        "lr_scheduler_type": "cosine",
        "warmup_ratio": 0.1,
        "bf16": True,
        "ddp_timeout": 180000000,
        "val_size": 0.05,
        "evaluation_strategy": "steps",
        "eval_steps": 100,
        "per_device_eval_batch_size": 1,
    }

    config_path = os.path.join(output_dir, "train_config.yaml")
    os.makedirs(output_dir, exist_ok=True)

    import yaml
    with open(config_path, "w") as f:
        yaml.dump(config, f, default_flow_style=False)

    # Also create the dataset_info.json for LLaMA-Factory
    dataset_info = {
        "proctoring_vlm": {
            "file_name": os.path.abspath(dataset_path),
            "formatting": "sharegpt",
            "columns": {
                "messages": "conversations",
                "images": "image",
            },
        }
    }

    dataset_info_path = os.path.join(output_dir, "dataset_info.json")
    with open(dataset_info_path, "w") as f:
        json.dump(dataset_info, f, indent=2)

    print(f"LLaMA-Factory config written to: {config_path}")
    print(f"Dataset info written to: {dataset_info_path}")
    print(f"\nTo train with LLaMA-Factory:")
    print(f"  pip install llama-factory")
    print(f"  llamafactory-cli train {config_path}")

    return config_path


def train_with_transformers(
    dataset_path: str,
    model_name: str = BASE_MODEL,
    output_dir: str = OUTPUT_DIR,
    epochs: int = 3,
    batch_size: int = 2,
    learning_rate: float = 2e-4,
    lora_rank: int = 64,
):
    """Direct fine-tuning using HuggingFace Transformers + PEFT (no LLaMA-Factory).

    This is a simplified training loop for reference.
    For production use, LLaMA-Factory is recommended.
    """
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
        from peft import LoraConfig, get_peft_model, TaskType
        from datasets import load_dataset
    except ImportError:
        print("Install required packages:")
        print("  pip install transformers peft datasets accelerate bitsandbytes")
        return

    print(f"Loading model: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        trust_remote_code=True,
        device_map="auto",
        torch_dtype="auto",
    )

    # Configure LoRA
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=lora_rank,
        lora_alpha=lora_rank * 2,
        lora_dropout=0.05,
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # Load dataset
    dataset = load_dataset("json", data_files=dataset_path, split="train")

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        learning_rate=learning_rate,
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
        logging_steps=10,
        save_steps=100,
        save_total_limit=3,
        bf16=True,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        tokenizer=tokenizer,
    )

    print("Starting LoRA fine-tuning...")
    trainer.train()
    trainer.save_model()
    print(f"LoRA adapter saved to: {output_dir}")


def merge_lora_weights(
    base_model: str = BASE_MODEL,
    lora_path: str = OUTPUT_DIR,
    output_path: str = f"{OUTPUT_DIR}/merged",
):
    """Merge LoRA adapter weights back into the base model for deployment."""
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from peft import PeftModel
    except ImportError:
        print("Install: pip install transformers peft")
        return

    print(f"Loading base model: {base_model}")
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        trust_remote_code=True,
        device_map="auto",
        torch_dtype="auto",
    )

    print(f"Loading LoRA adapter: {lora_path}")
    model = PeftModel.from_pretrained(model, lora_path)

    print("Merging weights...")
    model = model.merge_and_unload()

    print(f"Saving merged model to: {output_path}")
    os.makedirs(output_path, exist_ok=True)
    model.save_pretrained(output_path)

    tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
    tokenizer.save_pretrained(output_path)

    print(f"\nMerged model saved to: {output_path}")
    print(f"\nDeploy with vLLM:")
    print(f"  pip install vllm")
    print(f"  python -m vllm.entrypoints.openai.api_server \\")
    print(f"    --model {output_path} \\")
    print(f"    --port 8000 \\")
    print(f"    --trust-remote-code")
    print(f"\nThen set in Supabase Edge Function secrets:")
    print(f"  CUSTOM_VLM_ENDPOINT=http://your-gpu-server:8000/v1")
    print(f"  CUSTOM_VLM_API_KEY=your-api-key")


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune Vision LLM for Proctoring Judge")
    parser.add_argument("--action", choices=["prepare", "config", "train", "merge"],
                        default="prepare", help="Action to perform")
    parser.add_argument("--model", type=str, default=BASE_MODEL, help="Base model name")
    parser.add_argument("--dataset", type=str, default=DATASET_DIR, help="Dataset directory")
    parser.add_argument("--output", type=str, default=OUTPUT_DIR, help="Output directory")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--lora-rank", type=int, default=64)

    args = parser.parse_args()

    if args.action == "prepare":
        create_sample_dataset(args.dataset)

    elif args.action == "config":
        train_path = os.path.join(args.dataset, "train.jsonl")
        generate_llamafactory_config(
            dataset_path=train_path,
            output_dir=args.output,
            model_name=args.model,
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.lr,
            lora_rank=args.lora_rank,
        )

    elif args.action == "train":
        train_path = os.path.join(args.dataset, "train.jsonl")
        train_with_transformers(
            dataset_path=train_path,
            model_name=args.model,
            output_dir=args.output,
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.lr,
            lora_rank=args.lora_rank,
        )

    elif args.action == "merge":
        merge_lora_weights(
            base_model=args.model,
            lora_path=args.output,
        )
