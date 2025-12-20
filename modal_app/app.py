"""
Modal App for Analysis Jobs

Deploy: modal deploy modal_app/app.py
Dev:    modal serve modal_app/app.py
"""

import modal

app = modal.App("analysis-jobs")

# Image with pinned versions
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        # Data processing
        "pandas==2.2.0",
        "numpy==1.26.3",
        "scikit-learn==1.4.0",
        # Web endpoint
        "fastapi",
    )
    # Install supabase separately to avoid version conflicts
    .pip_install("supabase==2.4.0")
)


# =============================================================================
# Database Layer
# =============================================================================

def get_supabase_client():
    """Create Supabase client with service role credentials."""
    import os
    from supabase import create_client
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    
    return create_client(url, key)


def update_progress(supabase, job_id: str, progress: int):
    """Update job progress (0-100)."""
    supabase.table("jobs").update({"progress": progress}).eq("id", job_id).execute()


def fail_job(supabase, job_id: str, error_message: str):
    """Mark job as failed with error message."""
    supabase.table("jobs").update({
        "status": "error",
        "error_message": error_message,
        "progress": 0,
    }).eq("id", job_id).execute()


# =============================================================================
# Job Processor
# =============================================================================

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("supabase-secrets")],
    timeout=600,
)
def process_job(job_id: str) -> dict:
    """
    Process an analysis job with progress updates.
    
    All errors are caught and written to the job record so the client can display them.
    """
    import io
    import pandas as pd
    import traceback
    
    supabase = get_supabase_client()
    
    try:
        # 1. Fetch job
        update_progress(supabase, job_id, 5)
        response = supabase.table("jobs").select("id, job_type, input_file_path, status").eq("id", job_id).single().execute()
        job = response.data
        
        if not job:
            fail_job(supabase, job_id, f"Job {job_id} not found")
            return {"status": "error", "message": f"Job {job_id} not found"}
        
        if job["status"] not in ("pending", "running"):
            return {"status": job["status"], "message": "Job already processed"}
        
        # 2. Update status to running
        supabase.table("jobs").update({"status": "running", "progress": 10}).eq("id", job_id).execute()
        
        # 3. Download CSV
        update_progress(supabase, job_id, 20)
        file_path = job["input_file_path"]
        
        if not file_path:
            fail_job(supabase, job_id, "No input file path")
            return {"status": "error", "message": "No input file path"}
        
        file_bytes = supabase.storage.from_("analysis-uploads").download(file_path)
        
        update_progress(supabase, job_id, 30)
        df = pd.read_csv(io.BytesIO(file_bytes))
        
        # 4. Run analysis
        update_progress(supabase, job_id, 40)
        result = run_analysis(
            job["job_type"], 
            df, 
            on_progress=lambda p: update_progress(supabase, job_id, 40 + int(p * 50))
        )
        
        # 5. Write results
        update_progress(supabase, job_id, 95)
        supabase.table("jobs").update({
            "status": "done",
            "result": result,
            "progress": 100,
        }).eq("id", job_id).execute()
        
        # 6. Cleanup
        supabase.storage.from_("analysis-uploads").remove([file_path])
        supabase.table("jobs").update({"input_file_path": None}).eq("id", job_id).execute()
        
        return {"status": "done", "job_id": job_id}
        
    except Exception as e:
        # Capture full traceback for debugging
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"Job {job_id} failed: {error_msg}")
        print(traceback.format_exc())
        
        # Write error to job so client can display it
        fail_job(supabase, job_id, error_msg)
        
        return {"status": "error", "job_id": job_id, "error": error_msg}


# =============================================================================
# Analysis Runners
# =============================================================================

def run_analysis(job_type: str, df, on_progress=None) -> dict:
    """Dispatch to analysis handler based on job_type."""
    import pandas as pd
    
    base = {
        "processed_at": pd.Timestamp.now().isoformat(),
        "input_rows": len(df),
        "input_columns": list(df.columns),
    }
    
    if on_progress:
        on_progress(0.1)
    
    handlers = {
        "poisson_factorization": _run_poisson,
        "survival_analysis": _run_survival,
        "nrr_decomposition": _run_nrr,
        "propensity_model": _run_propensity,
    }
    
    handler = handlers.get(job_type)
    if handler:
        result = handler(df)
    else:
        result = {"type": "unknown", "error": f"Unknown job type: {job_type}"}
    
    if on_progress:
        on_progress(1.0)
    
    return {**base, **result}


def _run_poisson(df) -> dict:
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


def _run_survival(df) -> dict:
    """Survival analysis placeholder."""
    return {
        "type": "survival_analysis",
        "message": "Implement with lifelines CoxPHFitter",
        "columns_found": list(df.columns),
    }


def _run_nrr(df) -> dict:
    """NRR decomposition placeholder."""
    return {
        "type": "nrr_decomposition",
        "message": "Implement with interpret-ml EBM",
        "columns_found": list(df.columns),
    }


def _run_propensity(df) -> dict:
    """Propensity model placeholder."""
    return {
        "type": "propensity_model",
        "message": "Implement win probability model",
        "columns_found": list(df.columns),
    }


# =============================================================================
# Web Endpoint
# =============================================================================

@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def trigger(payload: dict) -> dict:
    """
    Webhook to trigger job processing.
    
    Called from Next.js server action. Spawns job asynchronously and returns immediately.
    """
    job_id = payload.get("jobId")
    
    if not job_id:
        return {"error": "jobId required", "status": "error"}
    
    # Fire and forget
    process_job.spawn(job_id)
    
    return {"status": "triggered", "jobId": job_id}
