import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-cboa-dark text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/images/logos/cboa-logo.png" 
                alt="CBOA Logo" 
                width={60} 
                height={60}
                className="rounded invert"
              />
            </div>
            <p className="text-gray-300 font-semibold mb-2">Calgary Basketball Officials Association</p>
            <p className="text-gray-400 text-sm">Email: info@cboa.ca</p>
          </div>
          
          <div>
            <h3 className="text-cboa-orange font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/become-a-referee" className="text-gray-300 hover:text-cboa-orange transition-colors">Become an Official</Link></li>
              <li><Link href="/training" className="text-gray-300 hover:text-cboa-orange transition-colors">Training & Certification</Link></li>
              <li><Link href="/resources" className="text-gray-300 hover:text-cboa-orange transition-colors">Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cboa-orange font-bold text-lg mb-4">Affiliations</h3>
            <ul className="space-y-2">
              <li><a href="https://basketballalberta.ca" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cboa-orange transition-colors">Basketball Alberta</a></li>
              <li><a href="https://basketball.ca" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cboa-orange transition-colors">Canada Basketball</a></li>
              <li><a href="https://fiba.basketball" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cboa-orange transition-colors">FIBA</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Calgary Basketball Officials Association. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}