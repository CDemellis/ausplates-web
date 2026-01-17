interface CustomAction {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

interface BulkActionBarProps {
  selectedCount: number;
  onChangeStatus: () => void;
  onExportCSV: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  customActions?: CustomAction[];
  itemLabel?: string; // singular form, e.g., "listing", "user", "report"
}

export function BulkActionBar({
  selectedCount,
  onChangeStatus,
  onExportCSV,
  onDelete,
  onClearSelection,
  customActions = [],
  itemLabel = 'item',
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] shadow-lg z-50 transition-transform duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#1A1A1A]">
              {selectedCount} {selectedCount === 1 ? itemLabel : `${itemLabel}s`} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-[#666666] hover:text-[#1A1A1A]"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {customActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  action.variant === 'primary'
                    ? 'text-white bg-[#00843D] hover:bg-[#006930]'
                    : 'text-[#1A1A1A] bg-white border border-[#EBEBEB] hover:border-[#00843D]'
                }`}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={onChangeStatus}
              className="px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors"
            >
              Change Status
            </button>
            <button
              onClick={onExportCSV}
              className="px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-[#EF4444] rounded-lg hover:bg-[#DC2626] transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
