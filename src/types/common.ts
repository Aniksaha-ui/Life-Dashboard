export interface ApiResponse<T = any> {
  status: "success" | "fail" | "error";
  code: number;
  message: string;
  data: T | null;
  error?: string[];
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
  titleClassName?: string;
}
