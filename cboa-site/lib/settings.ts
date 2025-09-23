import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface ExecutiveMember {
  name: string
  position: string
  email: string
  image?: string
}

export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  logo?: string
  favicon?: string
  statistics: {
    activeOfficials: string
    gamesPerSeason: string
    yearsOfService: string
  }
  executiveTeam?: ExecutiveMember[]
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
  }
  contact: {
    email: string
    address: string
  }
}

export function getSiteSettings(): SiteSettings {
  try {
    const settingsPath = path.join(process.cwd(), 'content', 'settings', 'general.yml')
    
    if (!fs.existsSync(settingsPath)) {
      // Return default settings if file doesn't exist
      return {
        siteTitle: 'Calgary Basketball Officials Association',
        siteDescription: 'Calgary\'s premier basketball officiating organization',
        statistics: {
          activeOfficials: '250+',
          gamesPerSeason: '5,000+',
          yearsOfService: '45'
        },
        socialMedia: {},
        contact: {
          email: 'info@cboa.ca',
          address: 'Calgary, Alberta, Canada'
        }
      }
    }
    
    const fileContents = fs.readFileSync(settingsPath, 'utf8')
    const settings = yaml.load(fileContents) as SiteSettings
    
    return settings
  } catch (error) {
    console.error('Error loading site settings:', error)
    // Return default settings on error
    return {
      siteTitle: 'Calgary Basketball Officials Association',
      siteDescription: 'Calgary\'s premier basketball officiating organization',
      statistics: {
        activeOfficials: '250+',
        gamesPerSeason: '5,000+',
        yearsOfService: '45'
      },
      socialMedia: {},
      contact: {
        email: 'info@cboa.ca',
        address: 'Calgary, Alberta, Canada'
      }
    }
  }
}