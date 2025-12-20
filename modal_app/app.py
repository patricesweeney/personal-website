"""
Modal App Configuration

This is the main entry point for Modal functions.
Deploy with: modal deploy modal_app/app.py
Dev with:    modal serve modal_app/app.py
"""

import modal

app = modal.App("analysis-jobs")

# Shared image with common dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "supabase==2.4.0",
        "pandas==2.2.0",
        "numpy==1.26.3",
        "scikit-learn==1.4.0",
    )
)

# Re-export functions for deployment
from modal_app.jobs.process import process_job, trigger

