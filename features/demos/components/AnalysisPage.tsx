"use client";

import { useState, useCallback } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Table2,
  Info,
  RotateCcw
} from "lucide-react";
import { uploadAndCreateJob, getJobStatus } from "@/features/analysis";
import type { JobType } from "@/features/analysis";
import { PoissonResults } from "./PoissonResults";

interface ColumnSpec {
  name: string;
  type: "required" | "optional";
  description: string;
  example?: string;
}

interface AnalysisConfig {
  type: JobType;
  title: string;
  description: string;
  columns: ColumnSpec[];
  sampleDataUrl?: string;
}

interface AnalysisPageProps {
  config: AnalysisConfig;
}

export function AnalysisPage({ config }: AnalysisPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
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
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;
      try {
        const jobResult = await getJobStatus(id);
        setProgress(jobResult.progress);
        
        if (jobResult.status === "done") {
          setProgress(100);
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
          setTimeout(poll, 2000);
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

      const { jobId: newJobId } = await uploadAndCreateJob(formData, config.type);
      setJobId(newJobId);
      setStatus("processing");
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
    setProgress(0);
    setResult(null);
    setError(null);
    setPassword("");
  };

  const requiredColumns = config.columns.filter(c => c.type === "required");
  const optionalColumns = config.columns.filter(c => c.type === "optional");

  return (
    <div className="analysis-page">
      {/* Header */}
      <header className="analysis-header">
        <h1>{config.title}</h1>
        <p className="description">{config.description}</p>
      </header>

      <div className="analysis-grid">
        {/* Data Requirements */}
        <section className="requirements-section">
          <div className="section-header">
            <Table2 size={18} />
            <h2>Data Requirements</h2>
          </div>
          
          <div className="columns-table">
            <div className="table-header">
              <span className="col-name">Column</span>
              <span className="col-desc">Description</span>
            </div>
            
            {requiredColumns.length > 0 && (
              <div className="column-group">
                <span className="group-label required">Required</span>
                {requiredColumns.map((col) => (
                  <div key={col.name} className="column-row">
                    <code className="col-name">{col.name}</code>
                    <span className="col-desc">
                      {col.description}
                      {col.example && (
                        <span className="example">e.g. {col.example}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {optionalColumns.length > 0 && (
              <div className="column-group">
                <span className="group-label optional">Optional / Features</span>
                {optionalColumns.map((col) => (
                  <div key={col.name} className="column-row">
                    <code className="col-name">{col.name}</code>
                    <span className="col-desc">
                      {col.description}
                      {col.example && (
                        <span className="example">e.g. {col.example}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {config.sampleDataUrl && (
            <a href={config.sampleDataUrl} className="sample-link" download>
              <Download size={14} />
              Download sample CSV
            </a>
          )}
        </section>

        {/* Upload Section */}
        <section className="upload-section">
          <div className="section-header">
            <Upload size={18} />
            <h2>Upload & Run</h2>
          </div>

          <div
            className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {status === "idle" && !file && (
              <div className="drop-content">
                <div className="drop-icon">
                  <Upload size={32} />
                </div>
                <p className="drop-text">Drag & drop your CSV</p>
                <span className="drop-or">or</span>
                <label className="browse-btn">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    hidden
                  />
                  Browse files
                </label>
              </div>
            )}

            {status === "idle" && file && (
              <div className="file-ready">
                <FileSpreadsheet size={40} className="file-icon" />
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                
                <input
                  type="password"
                  placeholder="Access code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="password-input"
                />
                
                <div className="file-actions">
                  <button className="run-btn" onClick={handleSubmit}>
                    Run Analysis
                  </button>
                  <button className="remove-btn" onClick={reset}>
                    Remove
                  </button>
                </div>
              </div>
            )}

            {(status === "uploading" || status === "processing") && (
              <div className="processing">
                <Loader2 size={32} className="spinner" />
                <p className="processing-text">
                  {status === "uploading" ? "Uploading..." : "Processing..."}
                </p>
                
                {status === "processing" && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                )}
                
                {jobId && (
                  <p className="job-id">Job: {jobId.slice(0, 8)}...</p>
                )}
              </div>
            )}

            {status === "done" && (
              <div className="done">
                <CheckCircle2 size={40} className="done-icon" />
                <p className="done-text">Analysis Complete</p>
                <button className="run-another-btn" onClick={reset}>
                  Run Another
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="error-state">
                <AlertCircle size={40} className="error-icon" />
                <p className="error-text">{error}</p>
                <button className="try-again-btn" onClick={reset}>
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="upload-note">
            <Info size={14} />
            <span>Data is processed on-demand and not stored permanently.</span>
          </div>
        </section>
      </div>

      {/* Results */}
      {result !== null && (
        <section className="results-section">
          <div className="results-header">
            <h3>Results</h3>
            <button className="reset-btn" onClick={reset}>
              <RotateCcw size={14} />
              Run Another
            </button>
          </div>
          
          {config.type === "poisson_factorization" ? (
            <PoissonResults result={result as Parameters<typeof PoissonResults>[0]["result"]} />
          ) : (
            <pre className="results-json">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </section>
      )}

      <style jsx>{`
        .analysis-page {
          padding: var(--space-6) 0;
          max-width: 900px;
        }

        .analysis-header {
          margin-bottom: var(--space-8);
        }

        .analysis-header h1 {
          font-size: var(--h2);
          font-weight: 700;
          margin-bottom: var(--space-2);
          text-align: left;
        }

        .description {
          color: var(--muted);
          font-size: 15px;
          max-width: 600px;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
        }

        @media (max-width: 900px) {
          .analysis-grid {
            grid-template-columns: 1fr;
          }
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          color: var(--fg);
        }

        .section-header h2 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        /* Requirements Section */
        .requirements-section {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: var(--space-5);
        }

        .columns-table {
          font-size: 13px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: var(--space-3);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--border);
          margin-bottom: var(--space-3);
          font-weight: 600;
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .column-group {
          margin-bottom: var(--space-4);
        }

        .group-label {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: var(--space-2);
        }

        .group-label.required {
          background: #fef3c7;
          color: #92400e;
        }

        .group-label.optional {
          background: #e0e7ff;
          color: #3730a3;
        }

        .column-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: var(--space-3);
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--border);
        }

        .column-row:last-child {
          border-bottom: none;
        }

        .col-name code {
          font-size: 12px;
          background: var(--border);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .col-desc {
          color: var(--muted);
          line-height: 1.4;
        }

        .example {
          display: block;
          font-size: 11px;
          color: var(--muted);
          opacity: 0.7;
          margin-top: 2px;
          font-style: italic;
        }

        .sample-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          margin-top: var(--space-4);
          padding: var(--space-2) var(--space-3);
          background: var(--fg);
          color: var(--bg);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .sample-link:hover {
          opacity: 0.9;
          text-decoration: none;
        }

        /* Upload Section */
        .upload-section {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: var(--space-5);
        }

        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: 10px;
          padding: var(--space-8);
          text-align: center;
          transition: all 0.2s;
          background: var(--bg);
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-zone.dragging {
          border-color: var(--fg);
          background: rgba(0, 0, 0, 0.02);
        }

        .drop-zone.has-file {
          border-style: solid;
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .drop-icon {
          color: var(--muted);
          margin-bottom: var(--space-3);
        }

        .drop-text {
          font-size: 14px;
          color: var(--fg);
          margin-bottom: var(--space-1);
        }

        .drop-or {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .browse-btn {
          display: inline-block;
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s;
        }

        .browse-btn:hover {
          border-color: var(--fg);
        }

        .file-ready {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .file-ready :global(.file-icon) {
          color: #3b82f6;
          margin-bottom: var(--space-3);
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: var(--space-1);
        }

        .file-size {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: var(--space-4);
        }

        .password-input {
          width: 180px;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          text-align: center;
          margin-bottom: var(--space-4);
          background: var(--bg);
          color: var(--fg);
        }

        .password-input:focus {
          outline: none;
          border-color: var(--fg);
        }

        .file-actions {
          display: flex;
          gap: var(--space-2);
        }

        .run-btn {
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

        .run-btn:hover {
          opacity: 0.9;
        }

        .remove-btn {
          padding: var(--space-2) var(--space-4);
          background: var(--bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s;
        }

        .remove-btn:hover {
          border-color: var(--fg);
        }

        .processing {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .processing :global(.spinner) {
          color: var(--muted);
          animation: spin 1s linear infinite;
          margin-bottom: var(--space-3);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .processing-text {
          font-size: 14px;
          margin-bottom: var(--space-3);
        }

        .progress-container {
          width: 100%;
          max-width: 260px;
          margin-bottom: var(--space-2);
        }

        .progress-bar {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--fg);
          transition: width 0.3s ease-out;
        }

        .progress-text {
          font-size: 11px;
          color: var(--muted);
        }

        .job-id {
          font-size: 11px;
          color: var(--muted);
          font-family: var(--font-geist-mono), monospace;
        }

        .done {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .done :global(.done-icon) {
          color: #10b981;
          margin-bottom: var(--space-3);
        }

        .done-text {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: var(--space-4);
        }

        .run-another-btn,
        .try-again-btn {
          padding: var(--space-2) var(--space-4);
          background: var(--bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s;
        }

        .run-another-btn:hover,
        .try-again-btn:hover {
          border-color: var(--fg);
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .error-state :global(.error-icon) {
          color: #ef4444;
          margin-bottom: var(--space-3);
        }

        .error-text {
          font-size: 14px;
          color: #ef4444;
          margin-bottom: var(--space-4);
          text-align: center;
          max-width: 280px;
        }

        .upload-note {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding: var(--space-3);
          background: rgba(0, 0, 0, 0.02);
          border-radius: 6px;
          font-size: 12px;
          color: var(--muted);
        }

        /* Results Section */
        .results-section {
          margin-top: var(--space-8);
          padding: var(--space-5);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-5);
        }

        .results-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .reset-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .reset-btn:hover {
          border-color: var(--fg);
        }

        .results-json {
          font-size: 12px;
          font-family: var(--font-geist-mono), monospace;
          background: rgba(0, 0, 0, 0.02);
          padding: var(--space-4);
          border-radius: 8px;
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

