import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-primary-600" />
      </div>

      <p className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[10px] font-bold tracking-widest text-primary-700 uppercase mb-4">
        Coming Soon
      </p>

      <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>

      <p className="max-w-md text-slate-500 text-sm leading-relaxed">
        We're currently working on the <strong>{title}</strong> page to bring
        you more powerful management tools. Check back soon for updates!
      </p>
    </div>
  );
}
