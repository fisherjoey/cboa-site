interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: boolean
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = true,
  hover = false,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const baseStyles = 'bg-white rounded-lg border border-gray-200'
  const shadowStyle = shadow ? 'shadow-md' : ''
  const hoverStyle = hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg' : ''
  
  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${shadowStyle} ${hoverStyle} ${className}`}>
      {children}
    </div>
  )
}