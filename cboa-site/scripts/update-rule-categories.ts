import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Category mappings based on league/tournament type
const categoryMappings: Record<string, string> = {
  // School League - High school and junior high league play
  "ASAA": "School League",
  "ASAA Undergarment Directive for High School Games": "School League",
  "CHSSL": "School League",
  "Calgary High School Athletic Association (CHSAA)": "School League",
  "Calgary Independent Schools Athletic Association (CISAA)": "School League",
  "ISAA High School": "School League",
  "Calgary Public (CBE) Junior High": "School League",
  "Calgary Catholic Junior High (Seniors)": "School League",
  "Calgary Catholic Junior High (Junior)": "School League",
  "Rocky View Schools Junior High": "School League",
  "Rocky View Schools Junior B": "School League",
  "Rocky View Schools Grade 6": "School League",
  "ISAA Junior High": "School League",
  "CJBL": "School League",

  // School Tournament - School-based tournaments
  "Nelson Mandela Invitational": "School Tournament",
  "Rundle Junior High Tournament": "School Tournament",
  "Sherwood School Junior High Tournament": "School Tournament",
  "St. John Paul II Collegiate Junior High": "School Tournament",
  "St. Martin de Porres Jr Boys": "School Tournament",
  "William D. Pratt Maverick Madness Tournament": "School Tournament",
  "Crowther Memorial Junior B": "School Tournament",
  "Edge Invitational": "School Tournament",

  // Club League - Club-based league play
  "CSMBA Rule Modifications": "Club League",
  "Full Court Events (Fall Club League: U13, U15, U17)": "Club League",
  "Genesis Spring League": "Club League",
  "Mount Royal Spring League": "Club League",

  // Club Tournament - Club-based tournaments
  "Alberta Hoops Summit (U18 Boys)": "Club Tournament",
  "Alisa Suykens Memorial Tournament (Okotoks)": "Club Tournament",
  "Alley Oop Basketball Tournament": "Club Tournament",
  "Battle at Big Rock": "Club Tournament",
  "Calgary Indohoops Tournament": "Club Tournament",
  "Calgary Surge 1x1": "Club Tournament",
  "Calgary Surge 3x3": "Club Tournament",
  "Genesis Classic (Girls and Boys)": "Club Tournament",
  "JLL Charity 3x3": "Club Tournament",
  "Shooting Star Tournaments": "Club Tournament",
  "Visions Tournaments": "Club Tournament",
  "W.I.N. Tournament": "Club Tournament",
  "Western Crown Presented by Genesis Basketball": "Club Tournament",

  // Adult - Adult leagues and tournaments
  "CSWBA (Senior Women's Masters)": "Adult",
  "CSWBA (Senior Women's Div 2)": "Adult",
  "Calgary Corporate Challenge (CCC)": "Adult",
  "Calgary Korean Basketball Association": "Adult",

  // General - Keep as general info (will show in all categories or separate section)
  "General CBOA Guidelines": "School League", // Show in School League as it's foundational
  "Player Participation Reminder": "School League", // Show in School League as it's foundational
}

async function updateCategories() {
  console.log('Fetching all rule modifications...')

  const { data: rules, error: fetchError } = await supabase
    .from('rule_modifications')
    .select('id, title, category')

  if (fetchError) {
    console.error('Error fetching rules:', fetchError)
    return
  }

  console.log(`Found ${rules?.length} rule modifications`)

  let updatedCount = 0
  let skippedCount = 0

  for (const rule of rules || []) {
    const newCategory = categoryMappings[rule.title]

    if (newCategory && newCategory !== rule.category) {
      const { error: updateError } = await supabase
        .from('rule_modifications')
        .update({ category: newCategory })
        .eq('id', rule.id)

      if (updateError) {
        console.error(`Error updating "${rule.title}":`, updateError.message)
      } else {
        console.log(`✓ Updated "${rule.title}": ${rule.category} → ${newCategory}`)
        updatedCount++
      }
    } else if (!newCategory) {
      console.log(`⚠ No mapping for "${rule.title}" (keeping: ${rule.category})`)
      skippedCount++
    } else {
      skippedCount++
    }
  }

  console.log('\n========== Update Complete ==========')
  console.log(`Updated: ${updatedCount}`)
  console.log(`Skipped/No change: ${skippedCount}`)
}

updateCategories()
  .then(() => {
    console.log('Category update script finished')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Category update script failed:', err)
    process.exit(1)
  })
