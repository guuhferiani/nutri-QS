import { cn } from '@/lib/utils'

interface NutriLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export function NutriLogo({
  className,
  size = 'md',
  showSubtitle = false,
}: NutriLogoProps) {
  const iconSizes = {
    sm: 'size-8 rounded-lg',
    md: 'size-10 rounded-xl',
    lg: 'size-12 rounded-2xl',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-sm shadow-emerald-600/25 ring-1 ring-emerald-500/20',
          iconSizes[size]
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="size-[62%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 7C15.5 7 9 12.5 9 21C9 22.8 9.3 24.3 9.8 25.3C10.8 25.7 12.2 26 14 26C22.5 26 26 18.5 26 9.5C26 8 25.2 7 24 7Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M10 25C12.8 19.8 16.5 15.5 22 11.5"
            stroke="#059669"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span
          className={cn(
            'font-bold tracking-tight text-emerald-950 leading-none',
            textSizes[size]
          )}
        >
          Nutri <span className="text-emerald-600">QS</span>
        </span>
        {showSubtitle && (
          <span className="mt-1 text-xs font-medium text-emerald-700/80">
            Gestão Clínica para Nutricionistas
          </span>
        )}
      </div>
    </div>
  )
}

