import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'utility'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  disabled?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'inline-block font-semibold rounded-md transition-all cursor-pointer text-center'
  
  const variantStyles = {
    primary: 'bg-cboa-orange text-white hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-cboa-blue',
    utility: 'bg-cboa-orange text-white rounded-full hover:bg-opacity-90',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  }
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  
  if (href) {
    const isExternal = href.startsWith('http://') || href.startsWith('https://')
    if (isExternal) {
      return (
        <a href={href} className={combinedStyles} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    )
  }
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={combinedStyles}
      disabled={disabled}
    >
      {children}
    </button>
  )
}