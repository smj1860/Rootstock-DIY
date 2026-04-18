/**
 * affiliate-lookup.js — Affiliate link matching engine
 *
 * Post-processes guide.tools_and_materials after Gemini returns the guide.
 * Matches each item against a priority-ordered keyword table and injects
 * affiliate_url + affiliate_partner into the item object.
 *
 * Partner priority (first match wins):
 *   1. Highly specialized  — Harvest Right, Renogy, EcoFlow, Bluetti
 *   2. Category-specialized — Mann Lake, Lodge, Cultures for Health, Lehman's
 *   3. Broad specialized    — Northern Tool (heavy equipment/engines)
 *   4. General hardware     — Home Depot (lumber, plumbing, electrical, building)
 *   5. Farm/livestock       — Tractor Supply Co.
 *   6. Fallback             — Amazon Associates
 */

// ─── Amazon Associates tag (placeholder until approved) ───────────
const AMAZON_TAG = 'rootstock-20'

// ─── URL builders ─────────────────────────────────────────────────
const u = encodeURIComponent

const urls = {
  amazon:         (term) => `https://www.amazon.com/s?k=${u(term)}&tag=${AMAZON_TAG}`,
  homeDepot:      (term) => `https://www.homedepot.com/s/${u(term)}`,
  tractorSupply:  (term) => `https://www.tractorsupply.com/tsc/search?q=${u(term)}`,
  renogy:         (term) => `https://www.renogy.com/catalogsearch/result/?q=${u(term)}`,
  ecoflow:        ()     => 'https://www.ecoflow.com/pages/portable-power-station',
  bluetti:        ()     => 'https://www.bluettipower.com/collections/portable-power-station',
  harvestRight:   ()     => 'https://harvestright.com/freeze-dryers/',
  lehmans:        (term) => `https://www.lehmans.com/search?q=${u(term)}`,
  northernTool:   (term) => `https://www.northerntool.com/search?searchterm=${u(term)}`,
  mannLake:       (term) => `https://www.mannlakeltd.com/search?q=${u(term)}`,
  lodge:          (term) => `https://www.lodgecastiron.com/search?q=${u(term)}`,
  culturesHealth: (term) => `https://www.culturesforhealth.com/search?q=${u(term)}`,
}

// ─── Keyword matchers (ordered — first match wins) ────────────────
// Each entry: { keywords, partner, buildUrl(itemName, searchTerm) }
const MATCHERS = [

  // ── Tier 1: Highly specialized, brand-specific ──────────────────

  {
    keywords: [
      'freeze dryer', 'freeze-dryer', 'freeze dried', 'lyophiliz', 'freeze drying',
    ],
    partner: 'Harvest Right',
    buildUrl: () => urls.harvestRight(),
  },

  {
    keywords: [
      'solar panel', 'pv panel', 'photovoltaic', 'monocrystalline', 'polycrystalline',
      'renogy', 'charge controller', 'mppt controller', 'pwm controller',
      'solar charge', 'solar kit', 'panel kit',
    ],
    partner: 'Renogy',
    buildUrl: (_, term) => urls.renogy(term),
  },

  {
    keywords: [
      'ecoflow', 'eco flow', 'delta pro', 'delta max', 'river 2', 'river pro',
    ],
    partner: 'EcoFlow',
    buildUrl: () => urls.ecoflow(),
  },

  {
    keywords: [
      'bluetti', 'ac200', 'ac300', 'eb150', 'b300', 'b230',
    ],
    partner: 'BLUETTI',
    buildUrl: () => urls.bluetti(),
  },

  // ── Tier 2: Category-specialized partners ───────────────────────

  {
    keywords: [
      'beehive', 'bee hive', 'hive box', 'langstroth', 'brood box',
      'honey super', 'bee smoker', 'hive tool', 'queen excluder',
      'bee veil', 'beekeeper suit', 'bee suit', 'beekeeper gloves',
      'uncapping knife', 'honey extractor', 'bee brush',
      'foundation wax', 'frame assembly', 'entrance reducer',
      'apiary', 'mann lake',
    ],
    partner: 'Mann Lake',
    buildUrl: (_, term) => urls.mannLake(term),
  },

  {
    keywords: [
      'cast iron skillet', 'cast iron pan', 'cast iron dutch oven',
      'cast iron griddle', 'cast iron grill', 'cast iron cookware',
      'lodge skillet', 'lodge pan', 'lodge cast iron',
    ],
    partner: 'Lodge Cast Iron',
    buildUrl: (_, term) => urls.lodge(term),
  },

  {
    keywords: [
      'sourdough starter', 'kefir grains', 'cheese culture', 'yogurt culture',
      'kombucha scoby', 'buttermilk culture', 'rennet', 'cheese making kit',
      'fermentation starter', 'cultures for health', 'milk kefir',
      'water kefir', 'jun starter', 'cheese press',
    ],
    partner: 'Cultures for Health',
    buildUrl: (_, term) => urls.culturesHealth(term),
  },

  {
    keywords: [
      'oil lamp', 'kerosene lamp', 'hand pump', 'wood cook stove', 'wood cooking stove',
      'grain mill', 'hand grain mill', 'hand grinder', 'kerosene', 'hand-crank',
      'non-electric', 'off-grid kitchen', 'butter churn', 'apple cider press',
      'cider press', 'apple press', 'lehman', 'treadle', 'hand-operated',
    ],
    partner: "Lehman's",
    buildUrl: (_, term) => urls.lehmans(term),
  },

  // ── Tier 2b: Solar battery / power stations (broader Renogy) ────

  {
    keywords: [
      'lifepo4 battery', 'lithium iron phosphate', 'lithium battery bank',
      'deep cycle lithium', 'solar battery bank', 'power station',
      'portable power station', 'battery storage system',
    ],
    partner: 'Renogy',
    buildUrl: (_, term) => urls.renogy(term),
  },

  // ── Tier 3: Heavy equipment / engines ───────────────────────────

  {
    keywords: [
      'welder', 'welding machine', 'mig welder', 'tig welder', 'stick welder',
      'plasma cutter', 'engine hoist', 'engine stand',
      'hydraulic jack', 'floor jack', 'jack stand',
      'come-along', 'chain hoist', 'cable puller', 'winch',
      'log splitter', 'wood splitter', 'post driver', 'post pounder',
      'auger', 'hydraulic auger',
      'air compressor', 'pressure washer',
    ],
    partner: 'Northern Tool',
    buildUrl: (_, term) => urls.northernTool(term),
  },

  // ── Tier 4: General hardware / building ─────────────────────────

  {
    keywords: [
      'lumber', 'plywood', '2x4', '2x6', '4x4', 'osb board', 'sheathing',
      'concrete', 'cement', 'quikrete', 'rebar', 'wire mesh', 'post base',
      'pvc pipe', 'cpvc', 'copper pipe', 'conduit', 'emt conduit',
      'romex', 'electrical wire', 'outlet', 'gfci outlet', 'light switch',
      'breaker', 'circuit breaker', 'junction box', 'wire connector',
      'roofing shingle', 'asphalt shingle', 'metal roofing', 'gutter',
      'gutter guard', 'downspout', 'flashing', 'drip edge',
      'insulation', 'fiberglass batt', 'spray foam', 'rigid foam', 'r-value',
      'drywall', 'sheetrock', 'joint compound', 'drywall screw',
      'paint', 'primer', 'exterior paint', 'caulk', 'weatherstrip',
      'deck screw', 'lag bolt', 'carriage bolt', 'joist hanger', 'post cap',
      'drill bit', 'saw blade', 'circular saw blade', 'hole saw',
      'sanding disc', 'sandpaper', 'wood stain', 'deck sealer',
      'waterproofing membrane', 'mortar', 'grout', 'tile adhesive',
      'patio block', 'paving stone', 'retaining wall block',
      'pressure-treated', 'treated lumber', 'treated post',
    ],
    partner: 'Home Depot',
    buildUrl: (_, term) => urls.homeDepot(term),
  },

  // ── Tier 5: Farm / livestock / outdoor ──────────────────────────

  {
    keywords: [
      'tractor', 'tractor part', 'farm equipment',
      'atv', 'utv', 'side-by-side',
      'cattle panel', 'hog panel', 'wire panel', 't-post', 'fence post',
      'electric fence', 'fence charger', 'step-in post',
      'livestock waterer', 'stock tank', 'water tank', 'round tank',
      'poultry feeder', 'chicken feeder', 'chick feeder', 'waterer nipple',
      'heat lamp', 'chick brooder', 'brooder plate',
      'feed bag', 'grain bag', 'scratch grains', 'layer pellets', 'chicken feed',
      'goat feed', 'rabbit pellets', 'rabbit hutch',
      'hay net', 'hay bag', 'salt block', 'mineral block',
      'hoof trimmers', 'livestock syringe', 'ear tag', 'cattle tag',
      'tractor supply', 'weed killer farm', 'herbicide broadleaf',
    ],
    partner: 'Tractor Supply Co.',
    buildUrl: (_, term) => urls.tractorSupply(term),
  },
]

// ─── Core matcher ─────────────────────────────────────────────────

/**
 * Match a single item to an affiliate partner.
 * @param {string} itemName
 * @param {string} affiliateSearchTerm
 * @returns {{ partner: string, url: string }}
 */
function matchAffiliate(itemName, affiliateSearchTerm) {
  const haystack = `${itemName} ${affiliateSearchTerm}`.toLowerCase()

  for (const matcher of MATCHERS) {
    const hit = matcher.keywords.some(kw => haystack.includes(kw))
    if (hit) {
      return {
        partner: matcher.partner,
        url:     matcher.buildUrl(itemName, affiliateSearchTerm || itemName),
      }
    }
  }

  // Fallback: Amazon
  return {
    partner: 'Amazon',
    url:     urls.amazon(affiliateSearchTerm || itemName),
  }
}

/**
 * Inject affiliate_url and affiliate_partner into every tools_and_materials item.
 * Mutates the guide object in place and returns it.
 * @param {object} guide — parsed Gemini guide JSON
 * @returns {object}
 */
function injectAffiliateLinks(guide) {
  if (!Array.isArray(guide.tools_and_materials)) return guide

  guide.tools_and_materials = guide.tools_and_materials.map(item => {
    const match = matchAffiliate(
      item.item || '',
      item.affiliate_search_term || item.item || '',
    )
    return { ...item, affiliate_url: match.url, affiliate_partner: match.partner }
  })

  return guide
}

module.exports = { injectAffiliateLinks, matchAffiliate }
