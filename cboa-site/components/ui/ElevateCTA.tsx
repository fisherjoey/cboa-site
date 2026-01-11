interface ElevateCTAProps {
  primaryButtonHref?: string
}

export default function ElevateCTA({ primaryButtonHref = "/get-officials" }: ElevateCTAProps = {}) {
  return (
    <section className="py-20 bg-gradient-to-r from-cboa-blue to-cboa-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Elevate Your Basketball Event?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Don't leave your officiating to chance. Partner with CBOA's certified referees and ensure 
            your games are managed with professionalism, consistency, and expertise.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-cboa-orange mb-2">200+</div>
              <p className="text-white">Certified Officials</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-cboa-orange mb-2">60+</div>
              <p className="text-white">Years of Excellence</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-cboa-orange mb-2">10,000+</div>
              <p className="text-white">Games Officiated Annually</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={primaryButtonHref} 
              className="inline-block bg-cboa-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
            >
              Request Officials Now
            </a>
            <a 
              href="mailto:scheduler@cboa.ca" 
              className="inline-block bg-white text-cboa-blue px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Contact Our Team
            </a>
          </div>
          <p className="text-sm text-gray-300 mt-6">
            Book early to secure the best officials for your event
          </p>
        </div>
      </div>
    </section>
  )
}