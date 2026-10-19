export default function Input({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-coffee-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-coffee-600 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 text-sm transition ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
