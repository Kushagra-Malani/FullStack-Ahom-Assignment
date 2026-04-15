import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      ))}
    </div>
  );
}
