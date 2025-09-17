import React from 'react';

const FormInput = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  className = ''
}) => {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`peer h-14 w-full border border-[var(--border-color)] bg-[var(--input-background)] text-[var(--text-color)] placeholder-transparent rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4 transition-all duration-200 hover:border-[var(--primary-color)] focus:outline-none ${className}`}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      <label
        htmlFor={id}
        className="absolute left-4 -top-3.5 text-[var(--subtle-text-color)] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--subtle-text-color)] peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[var(--primary-color)] bg-[var(--input-background)] px-1"
      >
        {placeholder}
      </label>
    </div>
  );
};

export default FormInput;