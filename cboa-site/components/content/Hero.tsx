import Button from '../ui/Button'
import Image from 'next/image'

interface HeroProps {
  title: string
  subtitle?: string
  primaryAction?: {
    text: string
    href: string
  }
  secondaryAction?: {
    text: string
    href: string
  }
  backgroundImage?: string
  showLogo?: boolean
}

export default function Hero({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  backgroundImage,
  showLogo = false,
}: HeroProps) {
  return (
    <section 
      className="relative bg-gradient-to-br from-cboa-blue to-cboa-light-blue text-white py-20 md:py-32"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {showLogo && (
            <div className="mb-8 flex justify-center">
              <div className="w-[150px] h-[150px] rounded-full flex items-center justify-center">
                <Image 
                  src="/images/logos/cboa-logo.png" 
                  alt="CBOA Logo" 
                  width={150} 
                  height={150}
                  className="rounded-full object-contain brightness-0 invert"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {subtitle}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryAction && (
                <Button href={primaryAction.href} size="lg">
                  {primaryAction.text}
                </Button>
              )}
              {secondaryAction && (
                <Button href={secondaryAction.href} variant="secondary" size="lg">
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}