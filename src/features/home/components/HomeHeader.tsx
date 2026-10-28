interface HomeHeaderProps {
  displayName?: string;
}

export function HomeHeader({ displayName }: HomeHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Home</h1>
      <p className="text-slate-500 text-sm">
        Welcome back, {displayName || "Sarah"}.
      </p>
    </div>
  );
}
