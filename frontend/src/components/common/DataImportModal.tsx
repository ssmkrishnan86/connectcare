import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Table,
  FileText
} from 'lucide-react';
import {
  type ModuleImportExportConfig,
  downloadCsvTemplate,
  parseCsvText,
  mapCsvRowsToObjects,
} from '@/lib/importExportUtils';
import { useToast } from '@/context/ToastContext';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModuleImportExportConfig;
  onImportSuccess?: () => void;
  customCreateApi?: (data: any) => Promise<any>;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  config,
  onImportSuccess,
  customCreateApi,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedObjects, setParsedObjects] = useState<Record<string, string>[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  if (!isOpen) return null;

  const handleDownloadFormat = () => {
    downloadCsvTemplate(config.templateFilename, config.columns, config.sampleData);
    toast.info(`Downloaded import format template: ${config.templateFilename}`);
  };

  const handleFileProcess = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      toast.warning('Please upload a valid .csv file.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || '';
        const { headers, rows, errors } = parseCsvText(text);

        if (errors.length > 0) {
          toast.error(errors[0]);
          return;
        }

        if (rows.length === 0) {
          toast.warning('The uploaded CSV file has headers but contains no data rows.');
        }

        const { objects, warnings } = mapCsvRowsToObjects(headers, rows, config.columns);
        setParsedHeaders(headers);
        setParsedObjects(objects);
        setValidationWarnings(warnings);
      } catch (err: any) {
        console.error('Failed to parse CSV:', err);
        toast.error('Failed to parse CSV file. Please ensure it is correctly formatted.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParsedHeaders([]);
    setParsedObjects([]);
    setValidationWarnings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (parsedObjects.length === 0) {
      toast.warning('No valid rows to import.');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < parsedObjects.length; i++) {
      const rowObj = parsedObjects[i];
      try {
        const entityPayload = config.mapRowToEntity(rowObj);
        if (customCreateApi) {
          await customCreateApi(entityPayload);
        }
        successCount++;
      } catch (err: any) {
        failCount++;
        const msg = err?.message || `Row ${i + 1} failed`;
        if (errors.length < 3) errors.push(msg);
      }
      setImportProgress(Math.round(((i + 1) / parsedObjects.length) * 100));
    }

    setIsImporting(false);

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} record(s) into ${config.displayName}!`);
      if (onImportSuccess) {
        onImportSuccess();
      }
      handleClearFile();
      onClose();
    } else {
      toast.error(`Import failed: ${errors[0] || 'Unable to save records'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Import {config.displayName}
              </h2>
              <p className="text-xs text-slate-500">
                Upload CSV file to bulk import records into {config.displayName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleClearFile();
              onClose();
            }}
            disabled={isImporting}
            className="h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Format Link / Template Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-xs">
                  Required Format & Sample Template
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Download the official sample CSV template with pre-filled headers and example data for {config.displayName}.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadFormat}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs hover:shadow transition-all cursor-pointer text-xs shrink-0 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Import Format</span>
            </button>
          </div>

          {/* Field Guide Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setShowFieldGuide(!showFieldGuide)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors font-bold text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-slate-500" />
                <span>View Expected CSV Column Format ({config.columns.length} columns)</span>
              </div>
              {showFieldGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showFieldGuide && (
              <div className="p-4 border-t border-slate-200 bg-white overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold">
                      <th className="py-1.5 px-2">Column Header</th>
                      <th className="py-1.5 px-2">Required</th>
                      <th className="py-1.5 px-2">Description</th>
                      <th className="py-1.5 px-2">Sample Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {config.columns.map((col) => (
                      <tr key={col.key}>
                        <td className="py-1.5 px-2 font-mono font-bold text-slate-800">{col.label}</td>
                        <td className="py-1.5 px-2">
                          {col.required ? (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md font-bold text-[10px]">
                              Required
                            </span>
                          ) : (
                            <span className="text-slate-400">Optional</span>
                          )}
                        </td>
                        <td className="py-1.5 px-2">{col.description || '-'}</td>
                        <td className="py-1.5 px-2 font-mono text-slate-500">{String(col.sampleValue ?? '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upload Area */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Click to browse or drag and drop your CSV file here
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: Standard CSV (*.csv) or UTF-8 Text (*.txt)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {parsedObjects.length} row(s) detected
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearFile}
                  disabled={isImporting}
                  className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                >
                  Change File
                </button>
              </div>

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Warnings ({validationWarnings.length})</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-0.5 pl-1 max-h-24 overflow-y-auto">
                    {validationWarnings.slice(0, 5).map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                    {validationWarnings.length > 5 && (
                      <li className="font-bold">...and {validationWarnings.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Data Preview Table */}
              {parsedObjects.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Table className="h-3.5 w-3.5" />
                      Data Preview (Showing first {Math.min(parsedObjects.length, 5)} of {parsedObjects.length} rows)
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {parsedHeaders.length} Columns
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-52 overflow-y-auto bg-white">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 text-slate-400 font-bold">#</th>
                          {config.columns.slice(0, 6).map((col) => (
                            <th key={col.key} className="py-2 px-3 text-slate-600 font-bold whitespace-nowrap">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedObjects.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            {config.columns.slice(0, 6).map((col) => (
                              <td key={col.key} className="py-2 px-3 text-slate-700 whitespace-nowrap">
                                {row[col.key] || row[col.label] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Progress Bar */}
              {isImporting && (
                <div className="space-y-1.5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      Importing records into {config.displayName}...
                    </span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={handleDownloadFormat}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline font-bold text-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Sample CSV</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                handleClearFile();
                onClose();
              }}
              disabled={isImporting}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={!selectedFile || parsedObjects.length === 0 || isImporting}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                !selectedFile || parsedObjects.length === 0 || isImporting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
              }`}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Import {parsedObjects.length > 0 ? `${parsedObjects.length} Records` : 'Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
