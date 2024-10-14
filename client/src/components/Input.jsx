import { forwardRef, useId } from "react";

export default forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref
) {
  const id = useId();
  return (
    <div className="flex max-md:flex-col max-md:items-stretch items-center">
      {label && (
        <div className="flex max-md:items-start">
          <label className="mx-3" htmlFor={id}>
            {label}
          </label>
        </div>
      )}
      <input
        type={type}
        className={`${className} flex-1`}
        ref={ref}
        id={id}
        {...props}
      />
    </div>
  );
});
