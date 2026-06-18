export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className={`rounded-lg border p-4 mb-4 ${styles[type]}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm break-words pr-2">{message}</p>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-current opacity-60 hover:opacity-100">
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
