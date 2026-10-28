// Report Loading Overlay - minimal loading state
import { Loader } from "../../../../components/Loader";

interface ReportLoadingOverlayProps {
  isLoading: boolean;
}

export function ReportLoadingOverlay({ isLoading }: ReportLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
      <Loader size="md" />
    </div>
  );
}
