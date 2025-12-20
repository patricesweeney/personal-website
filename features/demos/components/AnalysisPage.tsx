"use client";

import { useState, useCallback } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Info,
  RotateCcw
} from "lucide-react";
import { uploadAndCreateJob, getJobStatus } from "@/features/analysis";
import type { JobType } from "@/features/analysis";
import { PoissonResults } from "./PoissonResults";
import { ColumnPicker, type ColumnConfig } from "./ColumnPicker";

interface AnalysisConfig {
  type: JobType;
  title: string;
  description: string;
}

interface AnalysisPageProps {
  config: AnalysisConfig;
}

// Parse CSV to get headers and sample rows
async function parseCSVPreview(file: File): Promise<{ columns: string[]; sampleData: Record<string, unknown>[] }> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse header
  const columns = parseCSVLine(lines[0]);
  
  // Parse first 5 data rows
  const sampleData: Record<string, unknown>[] = [];
  for (let i = 1; i < Math.min(6, lines.length); i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, unknown> = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx] ?? "";
    });
    sampleData.push(row);
  }

  return { columns, sampleData };
}

// Simple CSV line parser (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

type Status = "idle" | "parsing" | "configuring" | "uploading" | "processing" | "done" | "error";

export function AnalysisPage({ config }: AnalysisPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  
  // CSV preview data
  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<Record<string, unknown>[]>([]);

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
      setError(null);
    } else {
      setError("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  // After file + password, parse CSV and show column picker
  const handleProceed = async () => {
    if (!file) return;
    if (!password.trim()) {
      setError("Access code required");
      return;
    }

    setStatus("parsing");
    setError(null);

    try {
      const { columns: cols, sampleData: sample } = await parseCSVPreview(file);
      setColumns(cols);
      setSampleData(sample);
      setStatus("configuring");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  };

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

  // Submit with column configuration
  const handleSubmitWithConfig = async (columnConfig: ColumnConfig) => {
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      formData.append("columnConfig", JSON.stringify(columnConfig));

      console.log("Submitting with config:", columnConfig);
      const result = await uploadAndCreateJob(formData, config.type);
      console.log("Upload result:", result);
      
      if (!result?.jobId) {
        throw new Error("No job ID returned from server");
      }
      
      setJobId(result.jobId);
      setStatus("processing");
      await pollJobStatus(result.jobId);
    } catch (err) {
      console.error("Submit error:", err);
      setStatus("error");
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Upload failed - check console for details");
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
    setColumns([]);
    setSampleData([]);
  };

  // Show results if done
  if (status === "done" && result !== null) {
    return (
      <div className="analysis-page">
        <header className="analysis-header">
          <h1>{config.title}</h1>
          <p className="description">{config.description}</p>
        </header>

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
          .results-section {
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

  // Show column picker if configuring
  if (status === "configuring") {
    return (
      <div className="analysis-page">
        <header className="analysis-header">
          <h1>{config.title}</h1>
          <p className="description">{config.description}</p>
        </header>

        <section className="config-section">
          <div className="file-badge">
            <FileSpreadsheet size={16} />
            <span>{file?.name}</span>
            <span className="file-size">{((file?.size ?? 0) / 1024).toFixed(1)} KB</span>
          </div>
          
          <ColumnPicker
            columns={columns}
            sampleData={sampleData}
            onConfirm={handleSubmitWithConfig}
            onCancel={reset}
          />
        </section>

        <style jsx>{`
          .analysis-page {
            padding: var(--space-6) 0;
            max-width: 900px;
          }
          .analysis-header {
            margin-bottom: var(--space-6);
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
          .config-section {
            padding: var(--space-5);
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 12px;
          }
          .file-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-2) var(--space-3);
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: var(--space-5);
          }
          .file-size {
            opacity: 0.7;
            font-weight: 400;
          }
        `}</style>
      </div>
    );
  }

  // Default: Upload view
  return (
    <div className="analysis-page">
      <header className="analysis-header">
        <h1>{config.title}</h1>
        <p className="description">{config.description}</p>
      </header>

      <section className="upload-section">
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file && status === "idle" && (
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
              <p className="drop-hint">
                Any CSV format works — you'll configure columns next
              </p>
            </div>
          )}

          {file && (status === "idle" || status === "parsing") && (
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
                disabled={status === "parsing"}
              />
              
              <div className="file-actions">
                <button 
                  className="proceed-btn" 
                  onClick={handleProceed}
                  disabled={status === "parsing"}
                >
                  {status === "parsing" ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      Parsing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
                <button 
                  className="remove-btn" 
                  onClick={reset}
                  disabled={status === "parsing"}
                >
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

      <style jsx>{`
        .analysis-page {
          padding: var(--space-6) 0;
          max-width: 700px;
        }

        .analysis-header {
          margin-bottom: var(--space-6);
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

        .drop-hint {
          margin-top: var(--space-4);
          font-size: 12px;
          color: var(--muted);
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

        .password-input:disabled {
          opacity: 0.5;
        }

        .file-actions {
          display: flex;
          gap: var(--space-2);
        }

        .proceed-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
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

        .proceed-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .proceed-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .remove-btn:hover:not(:disabled) {
          border-color: var(--fg);
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .try-again-btn:hover {
          border-color: var(--fg);
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
      `}</style>
    </div>
  );
}
