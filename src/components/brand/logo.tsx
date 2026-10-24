import { Link } from 'react-router-dom'
import { BRAND } from '@/lib/copy'

export function Logo() {
  return (
    <Link
      to="/"
      aria-label={`${BRAND.name}${BRAND.suffix}`}
      className="text-lg font-extrabold tracking-tight"
    >
      <span className="text-foreground text-2xl">{BRAND.name}</span>
      <span className="text-primary text-2xl">{BRAND.suffix}</span>
    </Link>
  )
}
