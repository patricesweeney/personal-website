"""
Job processing functions.

Entry point for all analysis jobs. Dispatches to specific handlers based on job_type.
"""

import io
import modal
import pandas as pd

from modal_app.app import app, image
from modal_app.lib.supabase import get_supabase_client


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("supabase-secrets")],
    timeout=600,  # 10 minutes max
)
def process_job(job_id: str) -> dict:
    """
    Process an analysis job.
    
    1. Fetch job details from Supabase
    2. Download CSV from storage
    3. Run analysis based on job_type
    4. Write results back to Supabase
    5. Cleanup uploaded file
    """
    supabase = get_supabase_client()
    
    # 1. Fetch job
    response = supabase.table("jobs").select("id, job_type, input_file_path, status").eq("id", job_id).single().execute()
    job = response.data
    
    if not job:
        raise ValueError(f"Job {job_id} not found")
    
    if job["status"] not in ("pending", "running"):
        # Already processed or errored — idempotency check
        return {"status": job["status"], "message": "Job already processed"}
    
    # 2. Update status to running
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
        
        # 6. Cleanup: delete uploaded file
        supabase.storage.from_("analysis-uploads").remove([file_path])
        supabase.table("jobs").update({"input_file_path": None}).eq("id", job_id).execute()
        
        return {"status": "done", "job_id": job_id}
        
    except Exception as e:
        # Always update status on failure
        supabase.table("jobs").update({
            "status": "error",
            "error_message": str(e),
        }).eq("id", job_id).execute()
        raise


def run_analysis(job_type: str, df: pd.DataFrame) -> dict:
    """
    Dispatch to specific analysis handler based on job_type.
    
    Returns a dict that will be stored as JSONB in jobs.result.
    """
    base = {
        "processed_at": pd.Timestamp.now().isoformat(),
        "input_rows": len(df),
        "input_columns": list(df.columns),
    }
    
    if job_type == "poisson_factorization":
        return {**base, **_poisson_factorization(df)}
    
    elif job_type == "survival_analysis":
        return {**base, **_survival_analysis(df)}
    
    elif job_type == "nrr_decomposition":
        return {**base, **_nrr_decomposition(df)}
    
    elif job_type == "propensity_model":
        return {**base, **_propensity_model(df)}
    
    else:
        return {**base, "type": "unknown", "message": "Unknown job type"}


def _poisson_factorization(df: pd.DataFrame) -> dict:
    """
    Poisson factorization for count data.
    
    TODO: Replace with real implementation using NMF or custom Poisson model.
    """
    from sklearn.decomposition import NMF
    
    # For demo: use NMF on numeric columns (not true Poisson, but similar idea)
    numeric_df = df.select_dtypes(include=["number"]).fillna(0).clip(lower=0)
    
    if numeric_df.empty or numeric_df.shape[1] < 2:
        return {"type": "poisson_factorization", "error": "Need at least 2 numeric columns"}
    
    n_components = min(3, numeric_df.shape[1])
    model = NMF(n_components=n_components, max_iter=200, random_state=42)
    W = model.fit_transform(numeric_df.values)
    H = model.components_
    
    return {
        "type": "poisson_factorization",
        "n_factors": n_components,
        "reconstruction_error": float(model.reconstruction_err_),
        "factor_weights": H.tolist(),
    }


def _survival_analysis(df: pd.DataFrame) -> dict:
    """
    Survival analysis placeholder.
    
    TODO: Implement with lifelines CoxPHFitter.
    Requires: duration column, event column, covariates.
    """
    return {
        "type": "survival_analysis",
        "message": "Survival analysis requires duration and event columns. Implement with lifelines.",
        "columns_found": list(df.columns),
    }


def _nrr_decomposition(df: pd.DataFrame) -> dict:
    """
    NRR decomposition placeholder.
    
    TODO: Implement with EBM or custom decomposition.
    """
    return {
        "type": "nrr_decomposition",
        "message": "NRR decomposition requires revenue columns. Implement with interpret-ml EBM.",
        "columns_found": list(df.columns),
    }


def _propensity_model(df: pd.DataFrame) -> dict:
    """
    Propensity model placeholder.
    
    TODO: Implement win probability, expected ACV, time-to-close models.
    """
    return {
        "type": "propensity_model",
        "message": "Propensity model requires deal/opportunity data.",
        "columns_found": list(df.columns),
    }


# --- Webhook Trigger ---

@app.function()
@modal.web_endpoint(method="POST")
def trigger(payload: dict) -> dict:
    """
    Webhook endpoint to trigger job processing.
    
    Called from Next.js server action. Spawns job asynchronously.
    """
    job_id = payload.get("jobId")
    
    if not job_id:
        return {"error": "jobId required"}
    
    # Fire and forget — don't wait for result
    process_job.spawn(job_id)
    
    return {"status": "triggered", "jobId": job_id}

