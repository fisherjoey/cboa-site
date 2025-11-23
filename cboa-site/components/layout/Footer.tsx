import Link from 'next/link'
import Image from 'next/image'
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react'

export default function Footer() {
  return (
    <footer className="bg-cboa-dark text-white">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Image 
                src="/images/logos/cboa-logo.png" 
                alt="CBOA Logo" 
                width={50} 
                height={50}
                className="rounded invert sm:w-[60px] sm:h-[60px]"
              />
            </div>
            <p className="text-gray-300 font-semibold text-sm sm:text-base mb-2">Calgary Basketball Officials Association</p>
            <p className="text-gray-400 text-xs sm:text-sm">Email: info@cboa.ca</p>
          </div>
          
          <div>
            <h3 className="text-cboa-orange font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/become-a-referee" className="text-gray-300 hover:text-cboa-orange transition-colors text-sm sm:text-base">Become an Official</Link></li>
              <li><Link href="/get-officials" className="text-gray-300 hover:text-cboa-orange transition-colors text-sm sm:text-base">Book Referees</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-cboa-orange transition-colors text-sm sm:text-base">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cboa-orange font-bold text-base sm:text-lg mb-3 sm:mb-4">Affiliations</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><a href="https://abbasketball.ca/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cboa-orange transition-colors text-sm sm:text-base">Basketball Alberta</a></li>
              <li><a href="https://refalberta.ca/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cboa-orange transition-colors text-sm sm:text-base">Alberta Basketball Officials Association</a></li>
              <li><a href="https://basketball.ca" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cboa-orange transition-colors text-sm sm:text-base">Canada Basketball</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-cboa-orange font-bold text-base sm:text-lg mb-3 sm:mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61580876884629"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-cboa-orange transition-colors"
                aria-label="Follow us on Facebook"
              >
                <IconBrandFacebook size={28} />
              </a>
              <a
                href="https://www.instagram.com/thecboa/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-cboa-orange transition-colors"
                aria-label="Follow us on Instagram"
              >
                <IconBrandInstagram size={28} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4 sm:pt-6 text-center text-gray-400">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} Calgary Basketball Officials Association. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}