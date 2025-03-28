import { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import type { LinkProps as NextLinkProps } from 'next/link'

type ButtonBaseProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  asChild?: boolean
  className?: string
}

type ButtonProps = ButtonBaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>
type LinkProps = ButtonBaseProps & Omit<NextLinkProps, keyof ButtonBaseProps>

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  asChild = false,
  ...props
}: ButtonProps | LinkProps) {
  const baseStyles = 'inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream-950 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    primary: 'bg-cream-900 text-cream-50 hover:bg-cream-900/90',
    secondary: 'bg-cream-100 text-cream-900 hover:bg-cream-100/80',
    outline: 'border border-cream-200 bg-white hover:bg-cream-100 hover:text-cream-900'
  }

  const sizes = {
    sm: 'h-8 px-3',
    md: 'h-9 px-4',
    lg: 'h-10 px-6'
  }

  const buttonContent = isLoading ? (
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>로딩중...</span>
    </div>
  ) : (
    children
  )

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  if (asChild) {
    return (
      <Link
        className={combinedClassName}
        {...(props as LinkProps)}
      >
        {buttonContent}
      </Link>
    )
  }

  return (
    <button
      className={combinedClassName}
      disabled={isLoading}
      {...(props as ButtonProps)}
    >
      {buttonContent}
    </button>
  )
} 