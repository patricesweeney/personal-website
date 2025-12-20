"use client";

import { useState, useMemo } from "react";
import { 
  User, 
  Columns3, 
  Rows3,
  Check,
  X,
  ArrowRight,
  HelpCircle
} from "lucide-react";

export type DataFormat = "wide" | "long";

export interface ColumnConfig {
  format: DataFormat;
  customerIdColumn: string;
  // Wide format: list of feature columns
  featureColumns?: string[];
  // Long format: column names
  featureNameColumn?: string;
  featureValueColumn?: string;
}

interface ColumnPickerProps {
  columns: string[];
  sampleData: Record<string, unknown>[];
  onConfirm: (config: ColumnConfig) => void;
  onCancel: () => void;
}

export function ColumnPicker({ columns, sampleData, onConfirm, onCancel }: ColumnPickerProps) {
  const [format, setFormat] = useState<DataFormat>("wide");
  const [customerIdColumn, setCustomerIdColumn] = useState<string>("");
  const [excludedColumns, setExcludedColumns] = useState<Set<string>>(new Set());
  const [featureNameColumn, setFeatureNameColumn] = useState<string>("");
  const [featureValueColumn, setFeatureValueColumn] = useState<string>("");

  // Auto-detect likely customer ID column
  useMemo(() => {
    const idPatterns = ['customer_id', 'customerid', 'cust_id', 'user_id', 'userid', 'id', 'account_id'];
    const found = columns.find(col => 
      idPatterns.some(pattern => col.toLowerCase().includes(pattern))
    );
    if (found && !customerIdColumn) {
      setCustomerIdColumn(found);
      setExcludedColumns(new Set([found]));
    }
  }, [columns, customerIdColumn]);

  // Get feature columns (all except excluded)
  const featureColumns = useMemo(() => {
    return columns.filter(col => !excludedColumns.has(col));
  }, [columns, excludedColumns]);

  // Toggle column exclusion
  const toggleExclude = (col: string) => {
    const newExcluded = new Set(excludedColumns);
    if (newExcluded.has(col)) {
      newExcluded.delete(col);
    } else {
      newExcluded.add(col);
    }
    setExcludedColumns(newExcluded);
  };

  // Validate and submit
  const handleConfirm = () => {
    if (!customerIdColumn) return;

    if (format === "wide") {
      if (featureColumns.length < 2) return;
      onConfirm({
        format: "wide",
        customerIdColumn,
        featureColumns,
      });
    } else {
      if (!featureNameColumn || !featureValueColumn) return;
      onConfirm({
        format: "long",
        customerIdColumn,
        featureNameColumn,
        featureValueColumn,
      });
    }
  };

  const isValid = customerIdColumn && (
    (format === "wide" && featureColumns.length >= 2) ||
    (format === "long" && featureNameColumn && featureValueColumn)
  );

  return (
    <div className="column-picker">
      <div className="picker-header">
        <h3>Configure Your Data</h3>
        <p>Select how your data is structured so we can process it correctly.</p>
      </div>

      {/* Format Selection */}
      <div className="format-section">
        <label className="section-label">Data Format</label>
        <div className="format-options">
          <button
            className={`format-option ${format === "wide" ? "active" : ""}`}
            onClick={() => setFormat("wide")}
          >
            <Columns3 size={20} />
            <div className="format-details">
              <span className="format-name">Wide</span>
              <span className="format-desc">Each column is a feature</span>
            </div>
          </button>
          <button
            className={`format-option ${format === "long" ? "active" : ""}`}
            onClick={() => setFormat("long")}
          >
            <Rows3 size={20} />
            <div className="format-details">
              <span className="format-name">Long</span>
              <span className="format-desc">Feature name & value in rows</span>
            </div>
          </button>
        </div>
      </div>

      {/* Customer ID Selection */}
      <div className="column-section">
        <label className="section-label">
          <User size={14} />
          Customer ID Column
        </label>
        <select
          value={customerIdColumn}
          onChange={(e) => {
            const newId = e.target.value;
            const newExcluded = new Set(excludedColumns);
            // Remove old ID from excluded
            if (customerIdColumn) newExcluded.delete(customerIdColumn);
            // Add new ID to excluded (for wide format)
            if (newId) newExcluded.add(newId);
            setExcludedColumns(newExcluded);
            setCustomerIdColumn(newId);
          }}
          className="column-select"
        >
          <option value="">Select column...</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {/* Wide Format: Feature Column Selection */}
      {format === "wide" && (
        <div className="column-section">
          <label className="section-label">
            Feature Columns
            <span className="section-hint">Click to exclude non-feature columns</span>
          </label>
          <div className="feature-chips">
            {columns.filter(col => col !== customerIdColumn).map(col => {
              const isExcluded = excludedColumns.has(col);
              return (
                <button
                  key={col}
                  className={`feature-chip ${isExcluded ? "excluded" : "included"}`}
                  onClick={() => toggleExclude(col)}
                  title={isExcluded ? "Click to include" : "Click to exclude"}
                >
                  {isExcluded ? <X size={12} /> : <Check size={12} />}
                  {col}
                </button>
              );
            })}
          </div>
          <p className="feature-count">
            {featureColumns.length} features selected
          </p>
        </div>
      )}

      {/* Long Format: Feature Name & Value Columns */}
      {format === "long" && (
        <>
          <div className="column-section">
            <label className="section-label">Feature Name Column</label>
            <select
              value={featureNameColumn}
              onChange={(e) => setFeatureNameColumn(e.target.value)}
              className="column-select"
            >
              <option value="">Select column...</option>
              {columns.filter(c => c !== customerIdColumn && c !== featureValueColumn).map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="column-section">
            <label className="section-label">Feature Value Column</label>
            <select
              value={featureValueColumn}
              onChange={(e) => setFeatureValueColumn(e.target.value)}
              className="column-select"
            >
              <option value="">Select column...</option>
              {columns.filter(c => c !== customerIdColumn && c !== featureNameColumn).map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Data Preview */}
      <div className="preview-section">
        <label className="section-label">
          <HelpCircle size={14} />
          Data Preview
        </label>
        <div className="preview-table-container">
          <table className="preview-table">
            <thead>
              <tr>
                {columns.slice(0, 6).map(col => (
                  <th 
                    key={col}
                    className={
                      col === customerIdColumn ? "id-col" :
                      excludedColumns.has(col) ? "excluded-col" : ""
                    }
                  >
                    {col}
                  </th>
                ))}
                {columns.length > 6 && <th className="more-cols">+{columns.length - 6}</th>}
              </tr>
            </thead>
            <tbody>
              {sampleData.slice(0, 3).map((row, idx) => (
                <tr key={idx}>
                  {columns.slice(0, 6).map(col => (
                    <td 
                      key={col}
                      className={
                        col === customerIdColumn ? "id-col" :
                        excludedColumns.has(col) ? "excluded-col" : ""
                      }
                    >
                      {String(row[col] ?? "")}
                    </td>
                  ))}
                  {columns.length > 6 && <td className="more-cols">...</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="picker-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className="confirm-btn" 
          onClick={handleConfirm}
          disabled={!isValid}
        >
          Run Analysis
          <ArrowRight size={16} />
        </button>
      </div>

      <style jsx>{`
        .column-picker {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .picker-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: var(--space-1);
        }

        .picker-header p {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .section-hint {
          font-weight: 400;
          text-transform: none;
          letter-spacing: 0;
          margin-left: auto;
        }

        /* Format Selection */
        .format-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .format-option {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }

        .format-option:hover {
          border-color: var(--muted);
        }

        .format-option.active {
          border-color: var(--fg);
          background: rgba(0, 0, 0, 0.02);
        }

        .format-details {
          display: flex;
          flex-direction: column;
        }

        .format-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--fg);
        }

        .format-desc {
          font-size: 11px;
          color: var(--muted);
        }

        /* Column Select */
        .column-select {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          background: var(--bg);
          color: var(--fg);
          cursor: pointer;
        }

        .column-select:focus {
          outline: none;
          border-color: var(--fg);
        }

        /* Feature Chips */
        .feature-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .feature-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid;
        }

        .feature-chip.included {
          background: #d1fae5;
          border-color: #10b981;
          color: #065f46;
        }

        .feature-chip.excluded {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #991b1b;
          text-decoration: line-through;
        }

        .feature-chip:hover {
          transform: scale(1.02);
        }

        .feature-count {
          font-size: 12px;
          color: var(--muted);
          margin-top: var(--space-2);
          margin-bottom: 0;
        }

        /* Preview Table */
        .preview-table-container {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .preview-table th,
        .preview-table td {
          padding: var(--space-2) var(--space-3);
          text-align: left;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-table th {
          background: rgba(0, 0, 0, 0.02);
          font-weight: 600;
        }

        .preview-table .id-col {
          background: #e0e7ff;
          color: #3730a3;
        }

        .preview-table .excluded-col {
          background: #fef2f2;
          color: #991b1b;
          text-decoration: line-through;
          opacity: 0.6;
        }

        .preview-table .more-cols {
          color: var(--muted);
          font-style: italic;
        }

        /* Actions */
        .picker-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .cancel-btn {
          padding: var(--space-2) var(--space-4);
          background: var(--bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s;
        }

        .cancel-btn:hover {
          border-color: var(--fg);
        }

        .confirm-btn {
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

        .confirm-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

