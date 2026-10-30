interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Loader({ size = "md", className }: LoaderProps) {
  // Mapping sizes for container and centered logo
  const sizeMap = {
    xs: {
      container: "w-5 h-5",
      strokeWidth: 6,
    },
    sm: {
      container: "w-8 h-8",
      strokeWidth: 6,
    },
    md: {
      container: "w-14 h-14",
      strokeWidth: 5,
    },
    lg: {
      container: "w-20 h-20",
      strokeWidth: 4.5,
    },
    xl: {
      container: "w-28 h-28",
      strokeWidth: 4,
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${currentSize.container} ${className || ""}`}
    >
      {/* CodePen Spinner SVG */}
      <svg
        className="spinner-container-rotator w-full h-full"
        viewBox="0 0 66 66"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="spinner-path"
          fill="none"
          strokeWidth={currentSize.strokeWidth}
          strokeLinecap="round"
          cx="33"
          cy="33"
          r="30"
        />
      </svg>
    </div>
  );
}
