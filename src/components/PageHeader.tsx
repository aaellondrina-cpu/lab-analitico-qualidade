type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-petroleo">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
