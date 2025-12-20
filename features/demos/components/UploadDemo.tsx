"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadAndCreateJob, getJobStatus } from "@/features/analysis";
import type { JobType } from "@/features/analysis";

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
  const [password, setPassword] = useState("");

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
    if (!password.trim()) {
      setError("Access code required");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

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
    setPassword("");
  };

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Job Type Selection */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
          Analysis Type
        </label>
        <div className="grid grid-cols-2 gap-2 max-[500px]:grid-cols-1">
          {JOB_TYPES.map((type) => (
            <button
              key={type.value}
              className={`p-3 border rounded-lg bg-[var(--bg)] text-left cursor-pointer transition-all duration-150
                ${selectedType === type.value 
                  ? "border-[var(--fg)] bg-[var(--card-bg,#fafafa)]" 
                  : "border-[var(--border)] hover:border-[var(--fg)]"}
                disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => setSelectedType(type.value)}
              disabled={status !== "idle"}
            >
              <span className="block text-[13px] font-semibold text-[var(--fg)] mb-0.5">
                {type.label}
              </span>
              <span className="block text-[11px] text-[var(--muted)]">
                {type.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 bg-[var(--bg)]
          ${isDragging ? "border-[var(--fg)] bg-[var(--card-bg,#fafafa)]" : "border-[var(--border)]"}
          ${file ? "border-solid" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {status === "idle" && !file && (
          <>
            <Upload className="w-12 h-12 text-[var(--muted)] mb-3 mx-auto" />
            <p className="text-sm text-[var(--fg)] mb-1">Drag &amp; drop your CSV here</p>
            <p className="text-xs text-[var(--muted)] mb-2">or</p>
            <label className="inline-block px-4 py-2 border border-[var(--border)] rounded-md text-[13px] cursor-pointer transition-all duration-150 hover:border-[var(--fg)]">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              Browse files
            </label>
          </>
        )}

        {status === "idle" && file && (
          <>
            <FileSpreadsheet className="w-12 h-12 text-blue-500 mb-3 mx-auto" />
            <p className="text-sm font-medium text-[var(--fg)] mb-1">{file.name}</p>
            <p className="text-xs text-[var(--muted)] mb-4">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full max-w-[200px] px-3 py-2 border border-[var(--border)] rounded-md text-[13px] text-center bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--fg)]"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <button 
                className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] border-none rounded-md text-[13px] font-medium cursor-pointer transition-opacity duration-150 hover:opacity-90"
                onClick={handleSubmit}
              >
                Run Analysis
              </button>
              <button 
                className="px-4 py-2 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-md text-[13px] cursor-pointer transition-all duration-150 hover:border-[var(--fg)]"
                onClick={reset}
              >
                Remove
              </button>
            </div>
          </>
        )}

        {(status === "uploading" || status === "processing") && (
          <>
            <Loader2 className="w-8 h-8 text-[var(--muted)] animate-spin mb-3 mx-auto" />
            <p className="text-sm text-[var(--fg)]">
              {status === "uploading" ? "Uploading..." : "Processing..."}
            </p>
            {jobId && (
              <p className="text-[11px] text-[var(--muted)] font-mono mt-2">
                Job: {jobId.slice(0, 8)}...
              </p>
            )}
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 mx-auto" />
            <p className="text-sm text-[var(--fg)]">Analysis Complete</p>
            <button 
              className="mt-4 px-4 py-2 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-md text-[13px] cursor-pointer transition-all duration-150 hover:border-[var(--fg)]"
              onClick={reset}
            >
              Run Another
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mb-3 mx-auto" />
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-md text-[13px] cursor-pointer transition-all duration-150 hover:border-[var(--fg)]"
              onClick={reset}
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {result !== null && (
        <div className="mt-6 p-4 bg-[var(--card-bg,#fafafa)] border border-[var(--border)] rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <pre className="text-xs font-mono bg-[var(--bg)] p-3 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
