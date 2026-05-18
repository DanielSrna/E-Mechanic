export default function Field({ label, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
