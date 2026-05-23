type Props = { className?: string; showText?: boolean };

export function Logo({ className = "", showText = true }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* gota */}
        <path
          d="M16 3 C 11 11, 7 16, 7 21 a 9 9 0 0 0 18 0 c 0 -5 -4 -10 -9 -18 Z"
          fill="#00B4D8"
        />
        {/* molécula */}
        <circle cx="16" cy="20" r="2.2" fill="#0D3B5E" />
        <circle cx="12" cy="24" r="1.4" fill="#0D3B5E" />
        <circle cx="20" cy="24" r="1.4" fill="#0D3B5E" />
        <line x1="16" y1="20" x2="12" y2="24" stroke="#0D3B5E" strokeWidth="1" />
        <line x1="16" y1="20" x2="20" y2="24" stroke="#0D3B5E" strokeWidth="1" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-petroleo">LimsQual</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            Controle de Qualidade
          </span>
        </div>
      )}
    </div>
  );
}
