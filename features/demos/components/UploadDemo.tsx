"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadAndCreateJob, getJobStatus } from "@/features/analysis";
import type { JobType, JobStatus } from "@/features/analysis";

const JOB_TYPES: { value: JobType; label: string; description: string }[] = [
  { 
    value: "poisson_factorization", 
    label: "Poisson Factorisation",
    description: "Decompose customer × event counts into latent factors"
  },
  { 
    value: "survival_analysis", 
    label: "Survival Analysis",
    description: "Fit Cox proportional hazards for time-to-churn"
  },
  { 
    value: "nrr_decomposition", 
    label: "NRR Decomposition",
    description: "Decompose net revenue retention into interpretable factors"
  },
  { 
    value: "propensity_model", 
    label: "Propensity Model",
    description: "Win probability × Expected ACV × Time-to-close discount"
  },
];

export function UploadDemo() {
  const [selectedType, setSelectedType] = useState<JobType>("poisson_factorization");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
      setStatus("idle");
      setError(null);
    } else {
      setError("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setError(null);
    }
  }, []);

  const pollJobStatus = useCallback(async (id: string) => {
    const maxAttempts = 60; // 5 minutes with 5s intervals
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;
      try {
        const jobResult = await getJobStatus(id);
        
        if (jobResult.status === "done") {
          setStatus("done");
          setResult(jobResult.result);
          return;
        }
        
        if (jobResult.status === "error") {
          setStatus("error");
          setError(jobResult.error || "Job failed");
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setStatus("error");
          setError("Job timed out");
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to poll job");
      }
    };

    await poll();
  }, []);

  const handleSubmit = async () => {
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { jobId: newJobId } = await uploadAndCreateJob(formData, selectedType);
      setJobId(newJobId);
      setStatus("processing");

      // Start polling
      await pollJobStatus(newJobId);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setJobId(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="upload-demo">
      {/* Job Type Selection */}
      <div className="type-selector">
        <label className="type-label">Analysis Type</label>
        <div className="type-grid">
          {JOB_TYPES.map((type) => (
            <button
              key={type.value}
              className={`type-card ${selectedType === type.value ? "active" : ""}`}
              onClick={() => setSelectedType(type.value)}
              disabled={status !== "idle"}
            >
              <span className="type-name">{type.label}</span>
              <span className="type-desc">{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {status === "idle" && !file && (
          <>
            <Upload className="drop-icon" />
            <p className="drop-text">Drag & drop your CSV here</p>
            <p className="drop-subtext">or</p>
            <label className="file-input-label">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="file-input"
              />
              Browse files
            </label>
          </>
        )}

        {status === "idle" && file && (
          <>
            <FileSpreadsheet className="file-icon" />
            <p className="file-name">{file.name}</p>
            <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
            <div className="file-actions">
              <button className="btn-primary" onClick={handleSubmit}>
                Run Analysis
              </button>
              <button className="btn-secondary" onClick={reset}>
                Remove
              </button>
            </div>
          </>
        )}

        {(status === "uploading" || status === "processing") && (
          <>
            <Loader2 className="spinner" />
            <p className="status-text">
              {status === "uploading" ? "Uploading..." : "Processing..."}
            </p>
            {jobId && <p className="job-id">Job: {jobId.slice(0, 8)}...</p>}
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle2 className="success-icon" />
            <p className="status-text">Analysis Complete</p>
            <button className="btn-secondary" onClick={reset}>
              Run Another
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="error-icon" />
            <p className="error-text">{error}</p>
            <button className="btn-secondary" onClick={reset}>
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="results">
          <h3>Results</h3>
          <pre className="results-json">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <style jsx>{`
        .upload-demo {
          max-width: 600px;
          margin: 0 auto;
        }

        .type-selector {
          margin-bottom: var(--space-6);
        }

        .type-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-3);
        }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-2);
        }

        .type-card {
          padding: var(--space-3);
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }

        .type-card:hover:not(:disabled) {
          border-color: var(--fg);
        }

        .type-card.active {
          border-color: var(--fg);
          background: var(--card-bg, #fafafa);
        }

        .type-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .type-name {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--fg);
          margin-bottom: 2px;
        }

        .type-desc {
          display: block;
          font-size: 11px;
          color: var(--muted);
        }

        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: var(--space-8);
          text-align: center;
          transition: all 0.2s;
          background: var(--bg);
        }

        .drop-zone.dragging {
          border-color: var(--fg);
          background: var(--card-bg, #fafafa);
        }

        .drop-zone.has-file {
          border-style: solid;
        }

        .drop-icon {
          width: 48px;
          height: 48px;
          color: var(--muted);
          margin-bottom: var(--space-3);
        }

        .file-icon {
          width: 48px;
          height: 48px;
          color: #3b82f6;
          margin-bottom: var(--space-3);
        }

        .drop-text {
          font-size: 14px;
          color: var(--fg);
          margin-bottom: var(--space-1);
        }

        .drop-subtext {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          display: inline-block;
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .file-input-label:hover {
          border-color: var(--fg);
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--fg);
          margin-bottom: var(--space-1);
        }

        .file-size {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: var(--space-4);
        }

        .file-actions {
          display: flex;
          gap: var(--space-2);
          justify-content: center;
        }

        .btn-primary {
          padding: var(--space-2) var(--space-4);
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          padding: var(--space-2) var(--space-4);
          background: var(--bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-secondary:hover {
          border-color: var(--fg);
        }

        .spinner {
          width: 32px;
          height: 32px;
          color: var(--muted);
          animation: spin 1s linear infinite;
          margin-bottom: var(--space-3);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-text {
          font-size: 14px;
          color: var(--fg);
        }

        .job-id {
          font-size: 11px;
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
          margin-top: var(--space-2);
        }

        .success-icon {
          width: 48px;
          height: 48px;
          color: #10b981;
          margin-bottom: var(--space-3);
        }

        .error-icon {
          width: 48px;
          height: 48px;
          color: #ef4444;
          margin-bottom: var(--space-3);
        }

        .error-text {
          font-size: 14px;
          color: #ef4444;
          margin-bottom: var(--space-4);
        }

        .results {
          margin-top: var(--space-6);
          padding: var(--space-4);
          background: var(--card-bg, #fafafa);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .results h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: var(--space-3);
        }

        .results-json {
          font-size: 12px;
          font-family: var(--font-geist-mono), monospace;
          background: var(--bg);
          padding: var(--space-3);
          border-radius: 6px;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }

        @media (max-width: 500px) {
          .type-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

