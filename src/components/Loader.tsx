import sslZLogo from "../assets/ssl_z_logo.svg";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Loader({ size = "md", className }: LoaderProps) {
  // Mapping sizes for container and centered logo
  const sizeMap = {
    xs: {
      container: "w-5 h-5",
      logo: "",
      strokeWidth: 6,
    },
    sm: {
      container: "w-8 h-8",
      logo: "w-3 h-3",
      strokeWidth: 6,
    },
    md: {
      container: "w-14 h-14",
      logo: "w-5.5 h-5",
      strokeWidth: 5,
    },
    lg: {
      container: "w-20 h-20",
      logo: "w-8 h-7.5",
      strokeWidth: 4.5,
    },
    xl: {
      container: "w-28 h-28",
      logo: "w-11 h-10.5",
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

      {/* Center logo (only if size is not 'xs' and logo width is defined) */}
      {size !== "xs" && currentSize.logo && (
        <img
          src={sslZLogo}
          alt="SSL Logo"
          className={`absolute ${currentSize.logo} object-contain`}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
}
