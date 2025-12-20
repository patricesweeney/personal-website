"""
Modal App for Analysis Jobs

Deploy with: modal deploy modal_app/app.py
Dev with:    modal serve modal_app/app.py
"""

import io
import os
import modal
import pandas as pd

app = modal.App("analysis-jobs")

# Shared image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "supabase==2.4.0",
        "pandas==2.2.0",
        "numpy==1.26.3",
        "scikit-learn==1.4.0",
        "fastapi",
    )
)


def get_supabase_client():
    """Create Supabase client with service role credentials."""
    from supabase import create_client
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    
    return create_client(url, key)


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("supabase-secrets")],
    timeout=600,
)
def process_job(job_id: str) -> dict:
    """
    Process an analysis job.
    
    1. Fetch job from Supabase
    2. Download CSV
    3. Run analysis
    4. Write results back
    5. Cleanup
    """
    supabase = get_supabase_client()
    
    # 1. Fetch job
    response = supabase.table("jobs").select("id, job_type, input_file_path, status").eq("id", job_id).single().execute()
    job = response.data
    
    if not job:
        raise ValueError(f"Job {job_id} not found")
    
    if job["status"] not in ("pending", "running"):
        return {"status": job["status"], "message": "Job already processed"}
    
    # 2. Update status
    supabase.table("jobs").update({"status": "running"}).eq("id", job_id).execute()
    
    try:
        # 3. Download CSV
        file_path = job["input_file_path"]
        file_bytes = supabase.storage.from_("analysis-uploads").download(file_path)
        df = pd.read_csv(io.BytesIO(file_bytes))
        
        # 4. Run analysis
        result = run_analysis(job["job_type"], df)
        
        # 5. Write results
        supabase.table("jobs").update({
            "status": "done",
            "result": result,
        }).eq("id", job_id).execute()
        
        # 6. Cleanup
        supabase.storage.from_("analysis-uploads").remove([file_path])
        supabase.table("jobs").update({"input_file_path": None}).eq("id", job_id).execute()
        
        return {"status": "done", "job_id": job_id}
        
    except Exception as e:
        supabase.table("jobs").update({
            "status": "error",
            "error_message": str(e),
        }).eq("id", job_id).execute()
        raise


def run_analysis(job_type: str, df: pd.DataFrame) -> dict:
    """Dispatch to analysis handler based on job_type."""
    base = {
        "processed_at": pd.Timestamp.now().isoformat(),
        "input_rows": len(df),
        "input_columns": list(df.columns),
    }
    
    if job_type == "poisson_factorization":
        return {**base, **poisson_factorization(df)}
    elif job_type == "survival_analysis":
        return {**base, **survival_analysis(df)}
    elif job_type == "nrr_decomposition":
        return {**base, **nrr_decomposition(df)}
    elif job_type == "propensity_model":
        return {**base, **propensity_model(df)}
    else:
        return {**base, "type": "unknown", "message": "Unknown job type"}


def poisson_factorization(df: pd.DataFrame) -> dict:
    """Poisson factorization using NMF."""
    from sklearn.decomposition import NMF
    
    numeric_df = df.select_dtypes(include=["number"]).fillna(0).clip(lower=0)
    
    if numeric_df.empty or numeric_df.shape[1] < 2:
        return {"type": "poisson_factorization", "error": "Need at least 2 numeric columns"}
    
    n_components = min(3, numeric_df.shape[1])
    model = NMF(n_components=n_components, max_iter=200, random_state=42)
    model.fit_transform(numeric_df.values)
    
    return {
        "type": "poisson_factorization",
        "n_factors": n_components,
        "reconstruction_error": float(model.reconstruction_err_),
        "factor_weights": model.components_.tolist(),
    }


def survival_analysis(df: pd.DataFrame) -> dict:
    """Survival analysis placeholder."""
    return {
        "type": "survival_analysis",
        "message": "Implement with lifelines CoxPHFitter",
        "columns_found": list(df.columns),
    }


def nrr_decomposition(df: pd.DataFrame) -> dict:
    """NRR decomposition placeholder."""
    return {
        "type": "nrr_decomposition",
        "message": "Implement with interpret-ml EBM",
        "columns_found": list(df.columns),
    }


def propensity_model(df: pd.DataFrame) -> dict:
    """Propensity model placeholder."""
    return {
        "type": "propensity_model",
        "message": "Implement win probability model",
        "columns_found": list(df.columns),
    }


# --- Webhook Trigger ---

@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def trigger(payload: dict) -> dict:
    """Webhook to trigger job processing. Called from Next.js."""
    job_id = payload.get("jobId")
    
    if not job_id:
        return {"error": "jobId required"}
    
    process_job.spawn(job_id)
    
    return {"status": "triggered", "jobId": job_id}
