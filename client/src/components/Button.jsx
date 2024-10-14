export default function Button({
  children,
  bgColor = "bg-[#7f5af0]",
  className = "",
  ...props
}) {
  return (
    <button
      className={`${bgColor} ${className} rounded-xl mx-2 py-2 px-5`}
      {...props}
    >
      {children}
    </button>
  );
}
