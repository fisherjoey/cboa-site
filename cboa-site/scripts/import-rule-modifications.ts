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

interface RuleModification {
  title: string
  category: string
  summary: string
  content: string
  effective_date?: string
  priority: number
  active: boolean
}

// Helper to create HTML content with consistent styling
function formatContent(sections: { heading?: string; items: string[] }[]): string {
  let html = ''
  for (const section of sections) {
    if (section.heading) {
      html += `<h4>${section.heading}</h4>\n`
    }
    html += '<ul>\n'
    for (const item of section.items) {
      html += `  <li>${item}</li>\n`
    }
    html += '</ul>\n'
  }
  return html.trim()
}

// All rule modifications parsed from the text file
const ruleModifications: RuleModification[] = [
  // General CBOA Guidelines
  {
    title: "General CBOA Guidelines",
    category: "General",
    summary: "General rules applicable to all CBOA leagues",
    content: `<p>For all leagues serviced by CBOA:</p>
<ul>
  <li>Make sure all jewelry is removed</li>
  <li>Shirts are tucked in</li>
  <li>Ninja style headbands are removed</li>
</ul>
<p>If a league isn't listed on these pages, normal FIBA rules apply.</p>`,
    priority: 100,
    active: true
  },

  // ASAA Undergarment Directive
  {
    title: "ASAA Undergarment Directive for High School Games",
    category: "High School",
    summary: "Important directive regarding undergarments in all high school games",
    content: `<p>Please check your email for a very important message from the Executive regarding undergarments in all high school games. This is a crucial directive from the ASAA and it is important that we ensure a uniform and consistent application of this directive to uphold the integrity of the game.</p>
<p>You can review the CBOA and ASAA memo regarding undergarments for high school games.</p>
<p>Please contact <a href="mailto:cboaeducation@gmail.com">cboaeducation@gmail.com</a> if you have any comments, questions, or concerns.</p>`,
    priority: 99,
    active: true
  },

  // Player Participation Reminder
  {
    title: "Player Participation Reminder",
    category: "General",
    summary: "Guidelines on player eligibility and participation",
    content: `<p>As a reminder in the context of officiating games, it is crucial to emphasize the role and final authority of the league's governing body responsible for overseeing sports. The league is entrusted with the authority to make determinations regarding eligibility for participation in their sports programs and team assignments.</p>
<p><strong>If there is any doubt, err to the side of letting the players play within the spirit and rules of the game.</strong> After the game file a game report with the relevant concerns to the CBOA Vice President.</p>`,
    priority: 98,
    active: true
  },

  // Alberta Hoops Summit
  {
    title: "Alberta Hoops Summit (U18 Boys)",
    category: "Tournament",
    summary: "FIBA rules with timing and shot clock modifications",
    effective_date: "2024-06-18",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>Timing (Pool Play)</h4>
<ul>
  <li>4 x 10 minute quarters, running time with stop time in the last 2 minutes of the 4th quarter</li>
</ul>
<h4>Timing (Playoffs - Quarter finals on)</h4>
<ul>
  <li>Regular FIBA timing in effect (4 x 10 minute quarters, stop time)</li>
</ul>
<h4>General Rules</h4>
<ul>
  <li>Time Outs: 1 timeout in first half &amp; 2 in the second half</li>
  <li>10 minute warm-up</li>
  <li>Time Between Quarters: 1 minute</li>
  <li>Half time: 5 minutes</li>
  <li>Overtime: 3 minutes</li>
  <li>Shot Clock: FIBA shot clock with 14 seconds for offensive rebounds, officials keep shot clock</li>
  <li>FIBA College 3pt line</li>
  <li>No Mercy rule at the moment</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Alisa Suykens Memorial Tournament
  {
    title: "Alisa Suykens Memorial Tournament (Okotoks)",
    category: "Tournament",
    summary: "Multi-age tournament with specific rules per division",
    effective_date: "2024-05-23",
    content: `<p>FIBA rules will apply with the following modifications:</p>
<h4>General Rules (All Age Levels)</h4>
<ul>
  <li>On court warm-ups will be granted according to the amount of time between games</li>
  <li>If a team arrives late (5+ minutes), the other team will be granted 10 points and the game shortened</li>
  <li>If a coach gets ejected, they cannot coach the next game and can't be in the venue</li>
  <li>3 minute half time</li>
  <li>4 timeouts: 2 in the first two quarters and 2 in the last two quarters</li>
  <li>Overtime: First team to score 4 points wins. 1 timeout granted in overtime</li>
</ul>
<h4>U11 Girls/Boys</h4>
<ul>
  <li>Size 5 ball</li>
  <li>Games played 4 on 4</li>
  <li>Rims set to 8.5 ft</li>
  <li>Foul line: 2 ft closer than marked</li>
  <li>Four 8 minute, stop-time quarters</li>
  <li>No 20 point press rule</li>
</ul>
<h4>U13 Girls/Boys</h4>
<ul>
  <li>Size 6 ball</li>
  <li>No Zone defense in the front court</li>
  <li>20 point no press rule</li>
  <li>Four 9 minute, stop-time quarters</li>
</ul>
<h4>U15 Girls and HS Girls</h4>
<ul>
  <li>Size 6 ball</li>
  <li>20 point no press rule</li>
  <li>U15 Girls will not play zone in the front court</li>
  <li>Four 10 minute, stop-time quarters</li>
</ul>
<h4>U15 Boys and HS Boys</h4>
<ul>
  <li>Size 7 ball</li>
  <li>20 point no press rule</li>
  <li>U15 Boys will not play zone in the front court</li>
  <li>Four 10 minute, stop-time quarters</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Alley Oop Basketball Tournament
  {
    title: "Alley Oop Basketball Tournament",
    category: "Tournament",
    summary: "Modified free throw rules and bonus system",
    effective_date: "2025-04-15",
    content: `<p>FIBA rules will apply with the following modifications:</p>
<h4>Timing</h4>
<ul>
  <li>Warmup: 5-10 minutes (shortened if tournament is behind)</li>
  <li>Two 24 minute halves, running time</li>
  <li>Stop in the last minute of the first half</li>
  <li>Stop time in the last 2 minutes of second half if score is within 20 points</li>
  <li>Clock stops for time outs and injuries</li>
  <li>3 minute half time</li>
  <li>1 timeout per half</li>
  <li>Overtime: 2 minutes stop time, 1 timeout</li>
  <li>Additional Overtime: First to score, starts with jump ball, no timeouts</li>
</ul>
<h4>Free Throws &amp; Bonus</h4>
<ul>
  <li>Bonus on the 8th foul: 1 shot for 2 points</li>
  <li>If fouled on 2 point shot and missed: 1 free throw for 2 points</li>
  <li>If fouled on 3 point shot and missed: 1 free throw for 3 points</li>
  <li>If fouled and shot made: 1 shot for 1 point</li>
</ul>
<h4>Other Rules</h4>
<ul>
  <li>3 point line used at all levels</li>
  <li>14 second shot clock off offensive rebounds</li>
  <li>Technical foul: automatic 2 points and ball at point of interruption</li>
  <li>Unsportsmanlike foul: automatic 2 points and throw-in opposite table in front court</li>
  <li>No pressing at 20 point lead (doesn't apply to U18 platinum divisions)</li>
  <li>Mercy rule: at 40 points, stop keeping score on clock, only on paper</li>
  <li>No zone defense in U11 and U13 divisions</li>
  <li>Forfeit Rule: 5 minute grace period</li>
  <li>2 Technical fouls = ejection for coaches and players</li>
  <li>Coach technical fouls count toward team fouls</li>
  <li>Disrespectful spectators result in technical foul to their team and possible removal</li>
</ul>
<h4>U9/U11 Modifications</h4>
<ul>
  <li>Foul line is 3 feet closer</li>
  <li>No intentional double teaming or trapping the ball</li>
  <li>Screening is allowed</li>
  <li>5 on 5 (U11 platinum and gold)</li>
  <li>4 on 4 (U11 silver and bronze and all U9 levels)</li>
  <li>10 foot baskets (U11 Platinum and Gold)</li>
  <li>8.5 foot baskets (U11 Silver and Bronze and all of U9)</li>
  <li>Pressing allowed for U11 Boys Platinum Only</li>
  <li>No zone defense (unless playing short a player)</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Battle at Big Rock
  {
    title: "Battle at Big Rock",
    category: "Tournament",
    summary: "FIBA rules with minor modifications",
    effective_date: "2024-05-11",
    content: `<p>FIBA rules with minor modifications:</p>
<ul>
  <li>2 Timeouts per half, no overtime timeouts</li>
  <li>Inside 3 point line being used for all age groups</li>
  <li>No Mercy rule for U17</li>
  <li>Mercy rule: no press when up by 21 points or more</li>
  <li>14 seconds shot clock reset on offensive rebounds (with leeway for U13 B)</li>
  <li>9 minute stop time quarters</li>
  <li>Warm up: minimum 8 minutes</li>
  <li>U13: 9 minute stop time</li>
  <li>Overtime: First to 4 points starting with jump ball, fouls carry over, no timeout</li>
  <li>Half time: 3 minutes</li>
  <li>1 minute between quarters</li>
</ul>`,
    priority: 50,
    active: true
  },

  // CJBL
  {
    title: "CJBL",
    category: "League",
    summary: "FIBA rules with minor modifications",
    effective_date: "2024-10-28",
    content: `<p>CJBL is playing FIBA rules with minor modifications:</p>
<ul>
  <li>Currently the no charge semi-circle is <strong>not</strong> being used</li>
</ul>`,
    priority: 60,
    active: true
  },

  // CHSSL
  {
    title: "CHSSL",
    category: "High School",
    summary: "FIBA rules with ASAA and league modifications",
    effective_date: "2024-11-28",
    content: `<p>CHSSL is playing FIBA rules with ASAA and league rule modifications:</p>
<ul>
  <li>ASAA 14 second Shot Clock after offensive rebound</li>
  <li>4 x 10 minute quarters running time with the last 2 minutes stop time</li>
  <li>No stop time when a team has a lead of 20 points. If the team gets within 10 points, stop time is used again</li>
  <li>Each quarter a team receives 1 timeout. Teams get only 1 timeout in the 1st and 2nd quarters. If the team doesn't use their timeout in the 3rd quarter, it carries over to the 4th quarter</li>
  <li><strong>Be aware of swearing by players.</strong> We have been asked to enforce a no swearing policy. Let coaches know if someone is swearing during play</li>
</ul>`,
    priority: 70,
    active: true
  },

  // CSMBA
  {
    title: "CSMBA Rule Modifications",
    category: "League",
    summary: "Modified overtime rules",
    effective_date: "2025-08-21",
    content: `<p>CSMBA plays FIBA rules with modified overtime rules:</p>
<h4>Overtime</h4>
<ul>
  <li>7 minutes stop time</li>
  <li>First team to 7 wins</li>
  <li>If still tied after 7 minutes, game is recorded as a Tie (unless in Playoffs, then next team to score wins)</li>
</ul>`,
    priority: 60,
    active: true
  },

  // CSWBA (Senior Women's Masters)
  {
    title: "CSWBA (Senior Women's Masters)",
    category: "League",
    summary: "FIBA rules with player sharing provision",
    effective_date: "2024-11-22",
    content: `<p>CSWBA plays FIBA rules:</p>
<ul>
  <li>If a team has fewer than 5 players, the other team can provide as many players as possible to the other team so they can play with 5 players</li>
  <li>If both teams make 5 players per team by borrowing players, referee the game as usual</li>
</ul>`,
    priority: 60,
    active: true
  },

  // CSWBA (Senior Women's Div 2)
  {
    title: "CSWBA (Senior Women's Div 2)",
    category: "League",
    summary: "FIBA rules with default forfeit rule",
    effective_date: "2024-09-13",
    content: `<p>FIBA rules will be used with the following modifications:</p>
<ul>
  <li>Default: five players within 15 minutes (the FIBA rule)</li>
</ul>`,
    priority: 60,
    active: true
  },

  // Calgary Corporate Challenge (CCC)
  {
    title: "Calgary Corporate Challenge (CCC)",
    category: "3x3",
    summary: "3x3 tournament using FIBA 3x3 rules with modifications",
    effective_date: "2024-09-15",
    content: `<p>Calgary Corporate Challenge is a 3x3 tournament using FIBA 3x3 rules with modifications:</p>
<h4>Game Format</h4>
<ul>
  <li>Length of game: 25 minutes running time, no target score goal</li>
  <li>All games end at the buzzer, regardless when game actually begins</li>
  <li>Substitutes permitted when there is a check ball situation</li>
  <li>Timeouts: One 20 second timeout per game, clock doesn't stop</li>
  <li>Shot Clock: 12 seconds</li>
</ul>
<h4>Scoring</h4>
<ul>
  <li>2 points from 2 point area, 3 points from 3 point area (like 5-person)</li>
  <li>Foul shots are 1 point</li>
</ul>
<h4>Possession Rules</h4>
<ul>
  <li>Change of possession (steal, defensive rebound): one pass before shot attempt, including pass to clear</li>
  <li>Take back line: anywhere past the 3 point line</li>
  <li>After a score: play continues immediately, no check ball or throw in</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>First and second overtime: 2 minute OT or first to 5 points</li>
  <li>Third overtime: each team takes 3 shots (alternating). Most shots wins. If tied, continue alternating until one team has scored 1 more point from same number of shots</li>
</ul>
<h4>Fouls</h4>
<ul>
  <li>Foul out: 4 personal fouls</li>
  <li>Teams line up for free throws. No check ball if shot is made</li>
  <li>After made free throw, defensive team gets ball under basket and plays as usual</li>
  <li>Team fouls: FIBA penalty (bonus) rules apply</li>
  <li>Foul shots: 1 for made basket, 2 for missed 2-pointer, 3 for missed 3-pointer</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Calgary Catholic Junior High (Seniors)
  {
    title: "Calgary Catholic Junior High (Seniors)",
    category: "Junior High",
    summary: "FIBA rules with junior high modifications",
    effective_date: "2025-01-07",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>Pre-Game</h4>
<ul>
  <li>Coaches should meet before start of game with official to discuss safety and players who may not be playing</li>
</ul>
<h4>Timing</h4>
<ul>
  <li>Four 10 minute quarters</li>
  <li>Last 3 minutes of the game: stop time (including when basket is scored)</li>
  <li>Last 1 minute of first three quarters: stop time</li>
  <li>1 minute intervals between quarters</li>
  <li>2 minute half time break</li>
  <li>Clock stopped for timeouts and injuries</li>
  <li>2 timeouts per half (no carry-over) and 1 in overtime</li>
  <li>Overtime: 3 minutes stop time</li>
</ul>
<h4>Defense Rules</h4>
<ul>
  <li>No full court press when leading by 10+ points. Warning first, then technical foul for continued violation</li>
  <li>No zone defense in the defensive zone. Warning first, then technical foul for continued violation</li>
</ul>
<h4>Equipment &amp; Court</h4>
<ul>
  <li>Trapezoid key if properly marked (use trapezoid if both narrow and trapezoid available)</li>
  <li>Shot-clock: Referees count 24 seconds</li>
  <li>Home team provides Size 6 ball</li>
  <li>3 point line used in gyms where properly marked (min 21 ft radius)</li>
</ul>
<h4>Uniforms</h4>
<ul>
  <li>Optional style but must have visible numbers front and back (max 2 digits)</li>
  <li>No cut-offs, jams, tear-away shorts, pockets, slits, tears, or belt loops</li>
  <li>Home team wears pinnies if same color uniforms (both teams should have 5+ pinnies/reversibles)</li>
  <li>T-shirts allowed: white OR same color as majority of jersey</li>
  <li>Sleeves and leggings allowed under uniform</li>
</ul>
<h4>Other Rules</h4>
<ul>
  <li>No body jewelry (including studs), watches. No taping of hair accessories/jewelry. Religious medals must be taped inside jersey</li>
  <li>All dressed players must get court time (NOT MONITORED BY OFFICIALS)</li>
  <li>Scorekeepers spoken to only when clock is stopped</li>
</ul>
<h4>30 Point Differential Rule</h4>
<ul>
  <li>1 minute coaches conference timeout (not charged)</li>
  <li>No fast break</li>
  <li>Points no longer added to scoreboard (kept on game sheet)</li>
  <li>No shot before 10 second call (team ahead)</li>
  <li>Running time</li>
</ul>
<h4>Taunting Strategies</h4>
<ul>
  <li>Immediate substitution of player</li>
  <li>Conversation with player</li>
  <li>Second offense: sits for rest of half or entire game</li>
</ul>`,
    priority: 65,
    active: true
  },

  // Calgary Catholic Junior High (Junior)
  {
    title: "Calgary Catholic Junior High (Junior)",
    category: "Junior High",
    summary: "Senior rules with additional junior modifications",
    effective_date: "2025-02-05",
    content: `<p>FIBA rules with the Calgary Catholic Junior High (Senior) rules and the following Junior level modifications:</p>
<ul>
  <li>Full and half court presses are <strong>not permitted</strong> in Junior Play</li>
  <li>Playoff games are 45 minute time slots: Two 18 minute halves suggested</li>
  <li>Coaches can agree if they want the last 1 minute of each half as stopped time</li>
</ul>`,
    priority: 64,
    active: true
  },

  // CHSAA
  {
    title: "Calgary High School Athletic Association (CHSAA)",
    category: "High School",
    summary: "FIBA rules with ASAA and CHSAA modifications",
    effective_date: "2024-11-20",
    content: `<p>Calgary High School Athletic Association's tournament uses FIBA 5x5 rules with ASAA and CHSAA modifications.</p>
<p>For ASAA Modifications see the ASAA Modifications section.</p>
<h4>CHSAA Modifications</h4>
<ul>
  <li>T-shirts can be worn but must follow garment guidelines</li>
  <li>All undergarments, headbands, etc. must conform to color requirements</li>
  <li>All members of the team must have the same matching colors (can be any color)</li>
</ul>`,
    priority: 70,
    active: true
  },

  // CISAA
  {
    title: "Calgary Independent Schools Athletic Association (CISAA)",
    category: "High School",
    summary: "FIBA rules with ASAA and CISAA modifications",
    effective_date: "2025-01-09",
    content: `<p>Calgary Independent Schools Athletic Association (CISAA) uses FIBA 5x5 rules with ASAA and CISAA modifications.</p>
<p>For ASAA Modifications see the ASAA Modifications section.</p>
<h4>CISAA Modifications</h4>
<ul>
  <li>Half Time: 5 minutes</li>
  <li>Overtime: Start with jump ball (not possession arrow). If not decided after second overtime, first team to score wins</li>
  <li>No more than 15 team members eligible to play</li>
  <li>Shot clock after offensive rebounds: reset to 24 seconds (not FIBA's 14 seconds)</li>
  <li>2 minutes between quarters (as per FIBA)</li>
  <li>No t-shirts allowed (FIBA guidelines not modified by CISAA)</li>
</ul>`,
    priority: 70,
    active: true
  },

  // Calgary Indohoops Tournament
  {
    title: "Calgary Indohoops Tournament",
    category: "Tournament",
    summary: "Modified timing and free throw rules",
    effective_date: "2025-07-12",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>Timing</h4>
<ul>
  <li>Two 22 minute halves, running time</li>
  <li>Clock stops last 1 minute of first half and last 2 minutes of second half</li>
  <li>If score difference over 15 points, clock runs last 2 minutes of second half</li>
  <li>Clock stops for timeouts</li>
  <li>2 timeouts per half, 1 minute long</li>
  <li>4 minute half time</li>
</ul>
<h4>Free Throws</h4>
<ul>
  <li>1 free throw worth 1, 2, or 3 points (based on shot attempted)</li>
  <li>In the last 3 minutes of game: no modification (normal free throws)</li>
</ul>
<h4>Other Rules</h4>
<ul>
  <li>Overtime: 3 minute period starting with jump ball</li>
  <li>5 personal fouls before fouling out</li>
  <li>Bonus on the 8th team foul of the half</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Calgary Korean Basketball Association
  {
    title: "Calgary Korean Basketball Association",
    category: "League",
    summary: "FIBA rules with special scoring modifications",
    effective_date: "2024-10-03",
    content: `<p>Calgary Korean Basketball Association's tournament uses FIBA 5x5 rules with modifications:</p>
<h4>Regular Games</h4>
<ul>
  <li>4 x 8 minute quarters, running time</li>
  <li>Last 2 minutes of 4th quarter: stop time (including when basket is scored)</li>
  <li>1 minute between quarters</li>
  <li>3 minute half time break</li>
  <li>Clock stops for timeouts and injuries</li>
  <li>1 timeout in first half, 2 timeouts in second half</li>
  <li>Timeouts are 30 seconds long</li>
  <li>Overtime: 3 minutes running time</li>
</ul>
<h4>Medal Games (Gold/Bronze)</h4>
<ul>
  <li>4 x 10 minute quarters, running time</li>
  <li>Clock stops last minute of first 3 quarters</li>
  <li>2 timeouts each half</li>
</ul>
<h4>Special Scoring Modification</h4>
<ul>
  <li>Female players or players born in 1980 or earlier receive +1 point for any field goal (excluding free throws)</li>
  <li>2-point shot = 3 points, 3-point shot = 4 points</li>
  <li>These players are marked with green masking tape on jerseys</li>
</ul>
<h4>Uniforms</h4>
<ul>
  <li>All players must wear matching uniforms</li>
  <li>If any player lacks matching uniform, opposing team receives 2 free throws before jump ball</li>
</ul>`,
    priority: 55,
    active: true
  },

  // Calgary Public (CBE) Junior High
  {
    title: "Calgary Public (CBE) Junior High",
    category: "Junior High",
    summary: "Comprehensive junior high rules with man-to-man defense requirement",
    effective_date: "2024-10-24",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>Playing Time</h4>
<ul>
  <li>Four 10 minute quarters running time</li>
  <li>Last 1 minute of each quarter is stop time</li>
  <li>Clock stops after baskets only in last minute of 4th quarter and overtime (NOT last 2 minutes)</li>
  <li>Half time: 3 minutes. 30 seconds between quarters</li>
</ul>
<h4>Timeouts</h4>
<ul>
  <li>2 timeouts each half (no carry-over)</li>
  <li>Playoffs only: 1 timeout for entire overtime period</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>No overtime during regular season</li>
  <li>Playoffs: clock turned off, first team to make 4 points wins</li>
</ul>
<h4>Warmup</h4>
<ul>
  <li>Whatever time remains in 1-hour slot used for warmup</li>
  <li>Minimum 5 minute warmup even if it means game starts late</li>
  <li>Games not to end early or be moved up before allotted start time</li>
</ul>
<h4>Court &amp; Equipment</h4>
<ul>
  <li>3-point line used where it exists (even illegal ones). No taped lines. If none, only 2 points awarded</li>
  <li>24-second shot clock handled by referees (verbal warning at 10 seconds remaining)</li>
  <li>Junior teams: Size 6 ball. Senior boys: Size 7 ball</li>
  <li>Senior teams: 15-foot free throw line. Junior teams: 14-foot line if painted (no tape)</li>
</ul>
<h4>Fouls</h4>
<ul>
  <li>2 free throws on 5th team foul and subsequent fouls each quarter</li>
</ul>
<h4>Defense Rules</h4>
<ul>
  <li>Must play man-to-man defense in backcourt</li>
  <li>Junior Teams: NO press at any time</li>
  <li>Senior Teams: May press, may zone press only in frontcourt. Must revert to man-to-man after crossing center</li>
  <li>15 point mercy rule for seniors: Teams leading by 15+ may not full court press</li>
</ul>
<h4>30 Point Rule</h4>
<ul>
  <li>At 30 point differential: 1 minute coaches conference (not charged)</li>
  <li>Slow down play, eliminate fast break</li>
  <li>Running time (except timeouts/injuries)</li>
  <li>Score taken off scoreboard but kept on sheet</li>
  <li>If differential becomes 20 or less, score goes back on board</li>
</ul>
<h4>Other Rules</h4>
<ul>
  <li>Max 15 players per roster</li>
  <li>No jewelry (per FIBA and CBOC - no religious jewelry exemption)</li>
  <li>Late arrivals: If both late, 3 min warmup then adjust times. If one late, 3 min warmup, technical foul to late team, then adjust. 15 minute FIBA forfeit limit applies</li>
</ul>`,
    priority: 65,
    active: true
  },

  // Calgary Surge 1x1
  {
    title: "Calgary Surge 1x1",
    category: "3x3",
    summary: "1 on 1 tournament rules",
    effective_date: "2025-10-23",
    content: `<p>FIBA 3x3 rules will be used with the following modifications:</p>
<ul>
  <li>Scoring: 1s and 2s</li>
  <li>Win Condition: First to 7 points OR 5:00 running clock</li>
  <li>Possession: Rock-paper-scissors at start; alternating on scores (check ball at top of key, player who didn't score gets ball)</li>
  <li>Overtime (Ties after 5:00): Sudden-death (next basket wins - possession goes to player who did not start with ball in regulation)</li>
  <li>Clear after rebounds/steals beyond the arc</li>
  <li>Fouls: No free throws</li>
  <li>Late Rule: Late by 2 minutes = forfeit</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Calgary Surge 3x3
  {
    title: "Calgary Surge 3x3",
    category: "3x3",
    summary: "3x3 tournament with shot clock modifications",
    effective_date: "2025-09-09",
    content: `<p>FIBA 3x3 rules will be used with the following modifications:</p>
<ul>
  <li>24 second shot clock will be used</li>
  <li>Shot clock begins when rebound is controlled</li>
  <li>10 second warning will be issued</li>
  <li>14 second shot clock after offensive rebounds</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Crowther Memorial Junior B
  {
    title: "Crowther Memorial Junior B",
    category: "Tournament",
    summary: "FIBA rules with no press and no zone",
    effective_date: "2024-11-30",
    content: `<p>FIBA rules with the following modifications:</p>
<ul>
  <li>10 minute running quarters</li>
  <li>Stop time last 2 minutes of 4th quarter and overtime</li>
  <li>Half-court defense (no press)</li>
  <li>Player to player defense only (no zone defense)</li>
  <li>5 minute half time</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Edge Invitational
  {
    title: "Edge Invitational",
    category: "Tournament",
    summary: "FIBA rules with 9 minute running time quarters",
    effective_date: "2024-10-13",
    content: `<p>Edge Invitational is playing FIBA rules with 9 minutes running time as the only modification.</p>
<h4>Key Points</h4>
<ul>
  <li>No rule modifications (FIBA standard)</li>
  <li>14 second Shot Clock after offensive rebound</li>
  <li>Inside 3 point line being used</li>
  <li>9 minute quarters</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Full Court Events
  {
    title: "Full Court Events (Fall Club League: U13, U15, U17)",
    category: "League",
    summary: "Modified FIBA rules for club league play",
    effective_date: "2024-10-19",
    content: `<p>Full Court Events Club games use modified FIBA rules.</p>
<p><strong>Note:</strong> Do not use these rule modifications for games played at Edge School. They are not associated with this league.</p>
<h4>Age Groups</h4>
<ul>
  <li>U13: Grade 6/7</li>
  <li>U15: Grade 8/9</li>
  <li>U17: High School Grades 10/11/12</li>
</ul>
<h4>Timing</h4>
<ul>
  <li>Two 24 minute halves</li>
  <li>Clock stops ONLY for free throws and in last 2 minutes of second half if score difference is 10 points or less</li>
  <li>Clock runs if score difference is 11+ points</li>
  <li>No overtime - games end in a tie</li>
  <li>1 timeout first half, 2 timeouts second half</li>
  <li>Half time: 3 minutes</li>
</ul>
<h4>Fouls &amp; Free Throws</h4>
<ul>
  <li>FIBA shot clock (14 seconds for offensive rebounds)</li>
  <li>Penalty (bonus) on 8th foul each half</li>
  <li>One shot worth 1, 2, or 3 points (made shot = 1 pt, missed 2-pt shot = 2 pts, missed 3-pt shot = 3 pts)</li>
  <li>6 personal fouls to foul out</li>
</ul>
<h4>Defense &amp; Press</h4>
<ul>
  <li>Presses allowed at U15 and U17 levels</li>
  <li>No presses at U13 level</li>
  <li>No mercy rule at any level</li>
  <li>Use inside line for gyms with two 3 point lines</li>
</ul>
<h4>U13 (Grade 6/7) Only</h4>
<ul>
  <li>No zone press allowed</li>
  <li>No half court zone defenses</li>
</ul>`,
    priority: 55,
    active: true
  },

  // Genesis Spring League
  {
    title: "Genesis Spring League",
    category: "League",
    summary: "FIBA rules with stop time quarters",
    effective_date: "2024-04-12",
    content: `<p>Genesis Spring League is playing FIBA rules with modifications:</p>
<ul>
  <li>9 minute stop time quarters</li>
  <li>No Mercy rule</li>
  <li>No press rules</li>
  <li>If 2 lines marked, the outside line is the 3 point line</li>
  <li>Timeouts: FIBA standard (2 and 3)</li>
  <li>Overtime: 2 minutes, 1 timeout each</li>
  <li>14 seconds after offensive rebound (FIBA rules)</li>
  <li>Half Time: 5 minutes</li>
</ul>`,
    priority: 55,
    active: true
  },

  // Genesis Classic
  {
    title: "Genesis Classic (Girls and Boys)",
    category: "Tournament",
    summary: "Running time tournament with modified free throw rules",
    effective_date: "2025-05-16",
    content: `<p>Genesis Classic tournaments are playing FIBA rules with modifications:</p>
<h4>Timing</h4>
<ul>
  <li>Two 22-minute running time periods</li>
  <li>Clock stops only for timeouts throughout game</li>
  <li>Exception: Last 1 minute of first period and last 2 minutes of second period - stop time for all rules if score within 20 points</li>
  <li>1 full timeout each half (no carry-over). FIBA rules apply, not NCAA</li>
  <li>Halftime: 2 minutes</li>
  <li>Warmup available at game site if time permits</li>
  <li>5-minute forfeit rule in effect</li>
</ul>
<h4>Press &amp; Zone Rules</h4>
<ul>
  <li>No Press Rule: Team 20 points ahead cannot full court press. May pick up after half court. One warning before technical. Does NOT apply to HS Platinum divisions</li>
  <li>U17 and U15: Full Court and Half Court zones allowed</li>
  <li>U13: No half court zones. Can only zone press full court with max 2 players trapping ball</li>
  <li>U11: No zones allowed</li>
</ul>
<h4>Free Throws &amp; Fouls</h4>
<ul>
  <li>Bonus on 8th team foul each half: 1 shot worth 2 points</li>
  <li>Fouled while shooting: 1 shot worth 2 points (or 3 points for three-pointer)</li>
  <li>Continuation foul: 1 shot for 1 point</li>
  <li>Technical foul: automatic 2 points and ball at half court</li>
  <li>Intentional foul: 2 shots from free throw line and ball where foul occurred</li>
</ul>
<h4>Ejections</h4>
<ul>
  <li>2 technical fouls in one game = ineligible for remainder of game</li>
  <li>3rd technical during tournament = unable to participate rest of tournament (Director may adjust)</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>First overtime: 2 minutes stop time</li>
  <li>Second overtime: 1 minute stop time</li>
  <li>Third overtime: Sudden death (first to score wins)</li>
  <li>Championship game: As many overtimes as needed</li>
  <li>1 full timeout per overtime period</li>
</ul>`,
    priority: 50,
    active: true
  },

  // ISAA Junior High
  {
    title: "ISAA Junior High",
    category: "Junior High",
    summary: "FIBA rules with bonus on 4th foul",
    effective_date: "2024-11-30",
    content: `<p>FIBA rules with the following modifications:</p>
<ul>
  <li>Grade 8/9 Boys: Size 7 Basketball</li>
  <li>4 x 8 minute stop time quarters</li>
  <li>5 minute half time break</li>
  <li>Bonus (Penalty): 2 shot penalty on 4th foul of each quarter</li>
  <li>Zone defenses are allowed</li>
  <li>Full court presses allowed (<strong>stop if 20 point differential</strong>)</li>
  <li>Overtime: 3 minutes stop time, start with jump ball (not possession arrow). Games shouldn't end in a tie</li>
</ul>`,
    priority: 65,
    active: true
  },

  // ISAA High School
  {
    title: "ISAA High School",
    category: "High School",
    summary: "FIBA rules with timing modifications",
    effective_date: "2025-01-23",
    content: `<p>FIBA rules with the following modifications:</p>
<ul>
  <li>2 minutes between quarters (as per FIBA)</li>
  <li>5 minute half time</li>
  <li>Time between games determined by scheduled start time (minimum 10 minutes)</li>
  <li>Second game should start at scheduled time if there's extra time</li>
</ul>`,
    priority: 70,
    active: true
  },

  // JLL Charity 3x3
  {
    title: "JLL Charity 3x3",
    category: "3x3",
    summary: "FIBA 3x3 charity tournament rules",
    effective_date: "2024-04-05",
    content: `<p>FIBA 3x3 rules with the following modifications:</p>
<h4>Game Format</h4>
<ul>
  <li>Coin toss: Winner chooses first possession or first possession of potential overtime</li>
  <li>Single 15 minute running time period</li>
  <li>Winner: First to 21 points OR highest score at end of 15 minutes</li>
  <li>Tie leads to untimed overtime: First to 3 points wins</li>
  <li>If tied at 20 points at regulation end, move to overtime rules (must score 3 additional points)</li>
  <li>Games only need to be won by 1 point</li>
</ul>
<h4>Game Play</h4>
<ul>
  <li>Check ball behind arc to start and restart from dead balls</li>
  <li>After checking, ball is live - can dribble, shoot, or pass</li>
  <li>Possession alternates after every made basket (no "Keeps After 3" rule)</li>
  <li>If fouled while making basket: basket counts, offense retains possession, no free throws (no and-1's)</li>
  <li>After made shot/free throw: non-scoring team takes ball to top of arc and checks</li>
</ul>
<h4>Defense &amp; Clearing</h4>
<ul>
  <li>If defense gains possession within arc (steal, block, rebound), must move behind arc before shooting</li>
</ul>
<h4>Fouls</h4>
<ul>
  <li>Shooting foul inside arc: 1 free throw</li>
  <li>Shooting foul behind arc: 2 free throws</li>
  <li>Non-shooting foul: possession awarded (no free throws)</li>
  <li>After foul shot, ball is live - offense doesn't clear but defense does</li>
</ul>
<h4>Other Rules</h4>
<ul>
  <li>Substitutions: Any dead ball (fouls, out of bounds, after basket). No ref/table action required</li>
  <li>1 timeout per team (30 seconds). Clock runs unless in final 2 minutes</li>
  <li>No individual foul counts/disqualification. 2 technical fouls = disqualified for that game</li>
  <li>Technical foul: 2 free throws plus possession</li>
  <li>All other FIBA regulations apply. These rules govern if conflict</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Mount Royal Spring League
  {
    title: "Mount Royal Spring League",
    category: "League",
    summary: "FIBA rules with mercy rule at 30 points",
    effective_date: "2024-05-07",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>Timing</h4>
<ul>
  <li>4 x 10 minute quarters, stop time</li>
  <li>1 minute between quarters</li>
  <li>3 minutes at halftime</li>
  <li>2 timeouts first half, 3 second half (no carry-over)</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>2 minute stop time with 1 timeout per team</li>
  <li>If still tied: sudden death (first to score wins)</li>
</ul>
<h4>Other Rules</h4>
<ul>
  <li>14 seconds after offensive rebound</li>
  <li>Scores kept by representative from each team</li>
</ul>
<h4>Mercy Rule</h4>
<ul>
  <li>When up by 30+ points in 2nd half: running time, no pressing</li>
  <li>If lead gets below 30: stop time resumes</li>
</ul>
<h4>Conduct</h4>
<ul>
  <li>No swearing or disrespecting players, coaches, or referees</li>
  <li>Continuous problems may result in team being asked to leave</li>
  <li>Player/coach/fan removed from game = suspended for next league game</li>
  <li>2 suspensions = removal from league</li>
</ul>`,
    priority: 55,
    active: true
  },

  // Nelson Mandela Invitational
  {
    title: "Nelson Mandela Invitational",
    category: "Tournament",
    summary: "FIBA rules with ASAA modifications and unique overtime",
    effective_date: "2024-11-14",
    content: `<p>Nelson Mandela Invitational uses FIBA rules with ASAA and other modifications:</p>
<ul>
  <li>Minimum 8 minute warm up (referees and tournament directors can use discretion)</li>
  <li>2 minutes between quarters</li>
  <li>10 minute half time</li>
  <li>Regular FIBA timeouts</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>2 minutes, jump ball, sudden death (first to score any basket wins)</li>
  <li>If still tied after 2 minutes: Free throw contest</li>
  <li>One shooter from each team shoots until winner (one makes, one misses)</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Rocky View Schools Grade 6
  {
    title: "Rocky View Schools Grade 6",
    category: "Elementary",
    summary: "Modified rules for Grade 6 players",
    effective_date: "2024-03-21",
    content: `<p>Grade 6 Basketball Rules Modifications (FIBA rules apply):</p>
<h4>Timing</h4>
<ul>
  <li>Half-hour time slots: Two 12-minute halves running time</li>
  <li>1 minute half time</li>
  <li>5 minute warm-up before each game</li>
  <li>1 timeout per half (1 minute), clock stopped during timeouts</li>
  <li>No overtime - tie stands</li>
</ul>
<h4>Defense (No Press)</h4>
<ul>
  <li>Defensive team must allow free progression to center</li>
  <li>Former offensive team must retreat to defensive area and wait for ball to reach center</li>
  <li>If press violation: referee cautions while play continues (or blows whistle and awards ball)</li>
  <li>Cannot intercept pass until ball crosses center line. If intercepted, play stopped and ball inbounded on sideline</li>
</ul>
<h4>Equipment &amp; Court</h4>
<ul>
  <li>10 foot baskets</li>
  <li>Foul line: 4 feet closer to basket (marked with tape)</li>
  <li>Size 6 ball</li>
  <li>5 seconds in key is called</li>
  <li>No dunking or goaltending</li>
</ul>
<h4>Throw-ins &amp; Possession</h4>
<ul>
  <li>Back court violation: referee does not handle ball. Front court: referee handles ball</li>
  <li>Visiting team gets first change of possession (arrow). Only jump ball at start of game</li>
  <li>Non-handled throw-in: only awarded team can initiate substitution (other may follow)</li>
  <li>Handled throw-in: either team may initiate substitution</li>
</ul>
<h4>Other</h4>
<ul>
  <li>Running score is sufficient</li>
  <li>No jewelry (necklaces, rings, earrings)</li>
  <li>Uniforms: similar color tops with numbers</li>
</ul>`,
    priority: 60,
    active: true
  },

  // Rocky View Schools Junior B
  {
    title: "Rocky View Schools Junior B",
    category: "Junior High",
    summary: "Junior B rules with man-to-man only",
    effective_date: "2024-02-23",
    content: `<p>Junior B Basketball Rules Modifications (FIBA rules apply):</p>
<ul>
  <li>Two 16 minute halves, running time</li>
  <li>Stop for injuries and timeouts</li>
  <li>Last 2 minutes each half: stop time</li>
  <li>5 timeouts per game</li>
  <li>No pressing. Man-to-man defense only. No zone permitted</li>
  <li>Once ball control established, defending team must vacate to half court</li>
  <li>Host school marks foul line 1.5 feet closer. Players may shoot from behind this line</li>
  <li>All teams use Size 6 ball</li>
</ul>`,
    priority: 62,
    active: true
  },

  // Rocky View Schools Junior High
  {
    title: "Rocky View Schools Junior High",
    category: "Junior High",
    summary: "Man-to-man in front court with press rules",
    effective_date: "2024-12-24",
    content: `<p>Junior A Basketball Rules Modifications (FIBA rules apply):</p>
<h4>Defense Rules</h4>
<ul>
  <li>Any type of pressure allowed in backcourt</li>
  <li>After offensive team reaches front court: must revert to man-to-man unless double teaming ball carrier</li>
  <li>Warning for violation, then technical foul for continued violation</li>
  <li>No front court press when leading by 15+ points (warning, then technical)</li>
  <li>Double-teaming ball carrier allowed. Cannot double-team player without ball (warning, then technical)</li>
</ul>
<h4>Uniforms</h4>
<ul>
  <li>No jersey restrictions on numbering or undershirts</li>
  <li>T-shirts allowed but must be same color for all players</li>
</ul>
<h4>Timing</h4>
<ul>
  <li>4 x 10 minute quarters</li>
  <li>Last 2 minutes of 4th quarter: stop time (unless team is up by 15+)</li>
  <li>1 minute between quarters</li>
  <li>5 minute half time</li>
  <li>2 x 1-minute timeouts per half per team</li>
  <li>Warm-up: dependent on tournament timing, at official's discretion</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>First team to score 4 points wins</li>
</ul>
<h4>Equipment</h4>
<ul>
  <li>Junior A Boys: Size 7. Girls: Size 6</li>
  <li>No jewelry allowed (no taping, no exceptions)</li>
</ul>`,
    priority: 63,
    active: true
  },

  // Rundle Junior High Tournament
  {
    title: "Rundle Junior High Tournament",
    category: "Tournament",
    summary: "Separate rules for Grade 8/9 and Grade 7/8",
    effective_date: "2025-01-04",
    content: `<p>Rundle Junior High Rules Modifications:</p>
<h4>Grade 8/9 Leagues</h4>
<ul>
  <li>FIBA rules - 4 x 8 minute stop time quarters</li>
  <li>5 minute half time break</li>
  <li>Bonus (Penalty): 2 shot penalty on 4th foul of each quarter</li>
  <li>Last 2 minutes of 4th Quarter: Stop clock after each basket</li>
  <li>Always handle in backcourt (except after basket)</li>
  <li>Zone defenses allowed</li>
  <li>Full court presses allowed (<strong>stop if 20 point differential</strong>)</li>
  <li>Overtime: 3 minutes stop time, jump ball start (not possession arrow)</li>
  <li>Timeouts called through scorekeepers table. Time STOPPED during timeouts</li>
</ul>
<h4>Grade 7/8 Leagues</h4>
<ul>
  <li>FIBA Rules - 4 x 10 minute run time, last minute of each quarter stop time</li>
  <li>5 minute half time break</li>
  <li>Bonus (Penalty): 2 shot penalty on 4th foul of each quarter</li>
  <li>Zone defenses prohibited</li>
  <li>Full court defenses prohibited</li>
  <li>Overtime: 3 minutes stop time, jump ball start</li>
  <li>Timeouts called through scorekeepers table. Time STOPPED during timeouts</li>
</ul>
<h4>Grade 7 &amp; 7/8 Defense Rules</h4>
<ul>
  <li>No intentional double-teaming or traps on ball carrier</li>
  <li>Player without ball cannot be double-teamed</li>
  <li>Each defensive player guards one offensive player</li>
  <li>On Ball Defense: Max 2 arm lengths from ball carrier (gap distance). No excessive sagging</li>
  <li>Off Ball Defense: Move when your player moves. Should not stand in middle of key. Only one foot in key if check is off lane (2+ steps). No excessive sagging</li>
  <li>Help Side Defense: May leave check to help on player entering key with ball. If ball leaves key, help side leaves. Stopping ball in key is not a double team</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Sherwood School Junior High Tournament
  {
    title: "Sherwood School Junior High Tournament",
    category: "Tournament",
    summary: "CMLSAA rules with modifications",
    effective_date: "2024-10-06",
    content: `<p>Sherwood School Junior High's tournament uses CMLSAA (CBE Jr High) rules with modifications:</p>
<ul>
  <li>Two 20 minute halves with last 2 minutes of each half stop time</li>
  <li>2 timeouts per half (no carry forward)</li>
  <li>Presses allowed at any time, but zone press only in front court</li>
  <li>Once crossing center line, defending team must revert to man-to-man</li>
  <li>30-point rule in effect</li>
  <li>Tie: 2 minute overtime with 1 timeout</li>
  <li>Every dressed player must play</li>
  <li>Bonus on 8th team foul</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Shooting Star Tournaments
  {
    title: "Shooting Star Tournaments",
    category: "Tournament",
    summary: "ASAA rules with 9 minute quarters",
    effective_date: "2024-04-27",
    content: `<p>ASAA high school rule modifications with the following modifications:</p>
<ul>
  <li>8 minutes for warmup, 3 minutes for half time (unless ahead of schedule)</li>
  <li>All games: Four 9 minute stopped time quarters</li>
  <li>U13 Aces Division at Hounsfield: 7 minute stopped time quarters</li>
  <li>1 minute between quarters</li>
  <li>2 timeouts per half (no carry-over to second half or overtime)</li>
  <li>Overtime: First team to 4 wins. One 30 second timeout per team</li>
  <li>Please provide one parent/volunteer to help scorekeep or time</li>
  <li>No mercy rule (but coaches encouraged to remove press if up 20 as sportsmanlike gesture)</li>
  <li>Late team: game shortened to end at normal time</li>
  <li>If two 3-point lines: use inside line</li>
  <li>Shot clock after offensive rebounds: reset to 24 seconds</li>
</ul>`,
    priority: 50,
    active: true
  },

  // St. John Paul II Collegiate Junior High
  {
    title: "St. John Paul II Collegiate Junior High",
    category: "Junior High",
    summary: "FIBA rules with 20 point mercy rule",
    effective_date: "2025-01-14",
    content: `<p>FIBA rule modifications with the following modifications:</p>
<h4>Timing</h4>
<ul>
  <li>4 x 8 minute quarters stop time</li>
  <li>2 timeouts per half</li>
  <li>1 minute between quarters</li>
  <li>2 minute half time</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>4 minute run time</li>
  <li>Starts with jump ball</li>
  <li>One timeout</li>
  <li>Continue until winner decided</li>
</ul>
<h4>Defense</h4>
<ul>
  <li>Full court man and zone pressure allowed</li>
  <li>Man defense must be played in defensive court (defender's backcourt)</li>
</ul>
<h4>Mercy Rule (20 points)</h4>
<ul>
  <li>No full court press</li>
</ul>`,
    priority: 65,
    active: true
  },

  // St. Martin de Porres Jr Boys
  {
    title: "St. Martin de Porres Jr Boys",
    category: "Junior High",
    summary: "ASAA rules with run time quarters",
    effective_date: "2024-11-28",
    content: `<p>ASAA high school rule modifications with the following modifications:</p>
<h4>Regular Season</h4>
<ul>
  <li>4 x 10 minute quarters run time</li>
  <li>1 minute between quarters</li>
  <li>2 minute half time</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>5 minute run time</li>
  <li>No timeouts</li>
  <li>Jump ball to start</li>
  <li>If still tied: Each team selects one player for free throw shootout</li>
</ul>
<h4>Playoffs</h4>
<ul>
  <li>4 x 10 minute quarters stop time</li>
  <li>1 minute between quarters</li>
  <li>2 minute half time</li>
  <li>Game times: 11:30 am onward</li>
</ul>`,
    priority: 65,
    active: true
  },

  // Western Crown
  {
    title: "Western Crown Presented by Genesis Basketball",
    category: "Tournament",
    summary: "FIBA rules with division-specific modifications",
    effective_date: "2025-05-21",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>General Rules</h4>
<ul>
  <li>9 minute quarters, stop time</li>
  <li>If team up by 25+ points in 4th quarter: running time</li>
  <li>No stop pressing rules</li>
</ul>
<h4>U13 Division</h4>
<ul>
  <li>No half court zone allowed</li>
  <li>Full court press allowed</li>
  <li>No press rule after 30 points</li>
</ul>`,
    priority: 50,
    active: true
  },

  // W.I.N. Tournament
  {
    title: "W.I.N. Tournament",
    category: "Tournament",
    summary: "FIBA rules with division-specific modifications",
    effective_date: "2024-05-23",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>All Divisions</h4>
<ul>
  <li>Short warm ups (5 min) and half (2 min) depending on schedule</li>
  <li>3 pt line in effect for all groups (closest line used)</li>
  <li>Overtime: 1st OT 3 mins; 2nd OT 1.5 mins or first to go up 4 points</li>
  <li>Mercy Rule: at 30 pts run the clock and scoreboard off</li>
</ul>
<h4>U17 Games</h4>
<ul>
  <li>Normal FIBA high school rules</li>
  <li>Shorter warm up (5 min) and halftime (2-5 min)</li>
  <li>FIBA timeouts (2 and 3 per half)</li>
  <li>High school shot clock (24 seconds offensive rebound)</li>
  <li>No pressing after 20 points</li>
</ul>
<h4>U13 Girls</h4>
<ul>
  <li>Two 20 minute halves, running time</li>
  <li>Stop last 2 minutes of each half</li>
  <li>1 timeout first half, 2 timeouts second half</li>
  <li>No pressing after 20 points</li>
  <li>24 second shot clock after offensive rebound</li>
</ul>
<h4>U10 Boys</h4>
<ul>
  <li>Two 20 minute halves</li>
  <li>Stop last 2 minutes of each half</li>
  <li>1 timeout first half, 1 timeout second half</li>
  <li>No pressing</li>
  <li>24 second shot clock after offensive rebound</li>
</ul>`,
    priority: 50,
    active: true
  },

  // William D. Pratt Maverick Madness Tournament
  {
    title: "William D. Pratt Maverick Madness Tournament",
    category: "Tournament",
    summary: "CMLSAA rules with first to 4 overtime",
    effective_date: "2024-09-18",
    content: `<p>FIBA rules with CMLSAA (CBE Junior High) modifications and the following:</p>
<ul>
  <li>1 timeout in overtime</li>
  <li>Overtime: Clock off, first team to make 4 points wins</li>
  <li>30 point differential: Play stopped, scoreboard reset to 0-0. Running score kept on paper only</li>
  <li>If differential falls to 10 or less: score put back on scoreboard during timeout/between quarters</li>
</ul>`,
    priority: 50,
    active: true
  },

  // Visions Tournaments
  {
    title: "Visions Tournaments",
    category: "Tournament",
    summary: "FIBA rules with first to 4 overtime",
    effective_date: "2024-05-31",
    content: `<p>FIBA rules with the following modifications:</p>
<h4>General Rules</h4>
<ul>
  <li>9 minute quarters, stop time</li>
  <li>3 minute half time (5 minutes if ahead of schedule)</li>
  <li>Warm up: 5-10 minutes (adjusted to available time)</li>
  <li>2 timeouts per half</li>
  <li>Most gyms have 1 three point line. Girls use closer, boys use further if both available</li>
  <li>No mercy rule</li>
  <li>14 seconds after offensive rebound</li>
</ul>
<h4>Overtime</h4>
<ul>
  <li>First team to 4 points or 3 minutes (whichever first)</li>
  <li>3 minutes running time except free throws and timeouts</li>
  <li>1 timeout per team in overtime</li>
  <li>If still tied after 3 minutes: sudden death (next point wins)</li>
</ul>
<h4>U11 Boys &amp; Girls Specific Rules</h4>
<ul>
  <li>Games played 4-on-4</li>
  <li>Size 5 Ball</li>
  <li>8'6" basket</li>
  <li>Foul Line: 3 feet closer to basket</li>
  <li>9 minute stop time quarters, 5 minute half time</li>
  <li>2 timeouts first half, 2 timeouts second half</li>
  <li>Man to Man defense ONLY (no zone)</li>
  <li>No intentional double teaming except near basket/in key</li>
  <li>No screens allowed (ball screens or off ball screens)</li>
  <li>No full court press</li>
  <li>Substitutions at coach's discretion (all kids should play relatively equal time)</li>
</ul>`,
    priority: 50,
    active: true
  },

  // ASAA
  {
    title: "ASAA",
    category: "High School",
    summary: "Official ASAA modifications for high school basketball",
    effective_date: "2024-11-20",
    content: `<p>ASAA plays FIBA rules with minor modifications. These apply to junior and senior varsity high school league play.</p>
<h4>Team Size</h4>
<ul>
  <li>No more than 15 team members entitled to play</li>
</ul>
<h4>Timing</h4>
<ul>
  <li>10-minute half-time permitted (FIBA states 15 minutes)</li>
</ul>
<h4>Shot Clock</h4>
<ul>
  <li>Only offensive rebounds of a live ball reset to 24 seconds (FIBA states 14 sec)</li>
  <li>ASAA adheres to FIBA rule: offensive team throw-ins in frontcourt from NEW offensive possession reset to 14 seconds (missed shot out of bounds without control, after turnover, advancing ball after timeout with 2:00 or less in 4th/OT, after Unsportsmanlike Foul)</li>
  <li>24 second shot clock reset on defensive possessions</li>
</ul>
<h4>Court</h4>
<ul>
  <li>NCAA 3-point line at 6.32m (FIBA is 6.75m)</li>
  <li>ASAA does NOT use FIBA no-charge circle</li>
  <li>FIBA block key at Provincials (gyms without use trapezoid key). Taping permitted</li>
</ul>
<h4>Uniforms &amp; Equipment</h4>
<ul>
  <li>Religious headpieces permitted (don't need to match uniform color)</li>
  <li>Undergarments must be compression or tight fitting (not loose)</li>
  <li>All undergarments, headbands, etc. must be same color for all team members (any color allowed)</li>
  <li>Hair beads can be worn tight to head per CBOC direction. Hair cannot hang loose - must be tied in bun or similar</li>
</ul>`,
    priority: 80,
    active: true
  }
]

async function importRuleModifications() {
  console.log('Starting import of rule modifications...')
  console.log(`Total rules to import: ${ruleModifications.length}`)

  // First, clear existing rule modifications (optional - comment out if you want to keep existing)
  console.log('Clearing existing rule modifications...')
  const { error: deleteError } = await supabase
    .from('rule_modifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError) {
    console.error('Error clearing existing rules:', deleteError)
    // Continue anyway
  }

  let successCount = 0
  let errorCount = 0

  for (const rule of ruleModifications) {
    try {
      const { data, error } = await supabase
        .from('rule_modifications')
        .insert([rule])
        .select()
        .single()

      if (error) {
        console.error(`Error inserting "${rule.title}":`, error.message)
        errorCount++
      } else {
        console.log(`✓ Inserted: ${rule.title}`)
        successCount++
      }
    } catch (err) {
      console.error(`Exception inserting "${rule.title}":`, err)
      errorCount++
    }
  }

  console.log('\n========== Import Complete ==========')
  console.log(`Successfully imported: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Total: ${ruleModifications.length}`)
}

// Run the import
importRuleModifications()
  .then(() => {
    console.log('Import script finished')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Import script failed:', err)
    process.exit(1)
  })
