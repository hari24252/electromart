export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/70 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white brutal-border-3 shadow-brutal-2xl animate-scale-in p-6">
        <h3 className="text-lg font-bold uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-ink-600 mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="brutal-border bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-paper-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`brutal-border px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-brutal-press transition-all ${
              variant === 'danger'
                ? 'bg-danger-500 text-white'
                : variant === 'warning'
                ? 'bg-warning-400 text-ink-900'
                : 'bg-primary-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
