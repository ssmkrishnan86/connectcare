import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  MODULE_CONFIGS,
  type ModuleImportExportConfig,
  exportToCsv,
  downloadCsvTemplate,
} from '@/lib/importExportUtils';
import { DataImportModal } from './DataImportModal';
import { usePermission } from '@/context/PermissionContext';
import { useToast } from '@/context/ToastContext';

export interface DataImportExportToolbarProps {
  moduleKey: string;
  customConfig?: Partial<ModuleImportExportConfig>;
  data?: any[];
  selectedIds?: (string | number)[];
  idField?: string;
  onImportSuccess?: () => void;
  customCreateApi?: (item: any) => Promise<any>;
  customExportHandler?: (selectedOnly: boolean) => void;
  compact?: boolean;
  className?: string;
  showTemplateLink?: boolean;
  allowImport?: boolean;
  allowExport?: boolean;
  buttonSize?: 'sm' | 'md' | 'xs';
}

export const DataImportExportToolbar: React.FC<DataImportExportToolbarProps> = ({
  moduleKey,
  customConfig,
  data = [],
  selectedIds = [],
  idField = 'id',
  onImportSuccess,
  customCreateApi,
  customExportHandler,
  compact = false,
  className = '',
  showTemplateLink = true,
  allowImport = true,
  allowExport = true,
}) => {
  const { can } = usePermission();
  const toast = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const baseConfig = MODULE_CONFIGS[moduleKey] || {
    moduleKey,
    displayName: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
    templateFilename: `ConnectCare_${moduleKey}_Template.csv`,
    exportFilenamePrefix: `ConnectCare_${moduleKey}`,
    columns: [],
    sampleData: [],
    mapRowToEntity: (r: any) => r,
    mapEntityToRow: (e: any) => e,
  };

  const config: ModuleImportExportConfig = {
    ...baseConfig,
    ...customConfig,
    columns: customConfig?.columns || baseConfig.columns || [],
  };

  const permModule = config.permissionModule || moduleKey;
  const canImport = allowImport && (!config.permissionModule || can(permModule, 'import') || can(permModule, 'create'));
  const canExport = allowExport && (!config.permissionModule || can(permModule, 'export') || can(permModule, 'read'));

  // 1. Download Import Format Template
  const handleDownloadFormat = () => {
    downloadCsvTemplate(config.templateFilename, config.columns, config.sampleData);
    toast.info(`Downloaded import format template: ${config.templateFilename}`);
  };

  // 2. Export to CSV
  const handleExport = () => {
    if (customExportHandler) {
      customExportHandler(selectedIds.length > 0);
      return;
    }

    let recordsToExport = data;
    if (selectedIds.length > 0) {
      recordsToExport = data.filter((item) => {
        const itemId = item[idField] || item.id || item.patientIdCode || item.code || item.memberIdCode;
        return selectedIds.includes(itemId);
      });
    }

    if (!recordsToExport || recordsToExport.length === 0) {
      toast.warning(`No ${config.displayName} records to export.`);
      return;
    }

    const headers = config.columns.map((c) => c.label);
    const rows = recordsToExport.map((entity) => {
      const rowObj = config.mapEntityToRow(entity);
      return config.columns.map((col) => {
        const val = rowObj[col.key] ?? rowObj[col.label] ?? entity[col.key] ?? '';
        return val;
      });
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${config.exportFilenamePrefix}_${dateStr}.csv`;
    exportToCsv(filename, headers, rows);
    toast.success(`Exported ${recordsToExport.length} ${config.displayName} record(s) to CSV.`);
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Import Format Link Button */}
        {showTemplateLink && (
          <button
            type="button"
            onClick={handleDownloadFormat}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 group"
            title={`Download sample import format CSV for ${config.displayName}`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="hidden sm:inline">Import Format</span>
          </button>
        )}

        {/* Import Button */}
        {canImport && (
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title={`Import ${config.displayName} from CSV`}
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span className={compact ? 'hidden md:inline' : 'inline'}>Import</span>
          </button>
        )}

        {/* Export Button */}
        {canExport && (
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title={`Export ${config.displayName} to CSV`}
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className={compact ? 'hidden md:inline' : 'inline'}>
              Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </span>
          </button>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <DataImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          config={config}
          onImportSuccess={onImportSuccess}
          customCreateApi={customCreateApi}
        />
      )}
    </>
  );
};
