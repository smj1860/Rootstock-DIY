-- ═══════════════════════════════════════════════════════════════
-- seed.sql — 10 categories + 75 subcategories
-- Run AFTER schema.sql and rls.sql
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────
-- CATEGORIES (10)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.categories (id, label, icon, sort_order) VALUES
  ('landscape',       'Landscape & Gardening',      '🌿', 1),
  ('cooking',         'Cooking & Baking',            '🍳', 2),
  ('canning',         'Canning & Preservation',      '🫙', 3),
  ('auto',            'Auto & Small Engine Repair',  '🔧', 4),
  ('plumbing',        'Plumbing',                    '🚿', 5),
  ('electrical',      'Electrical',                  '⚡', 6),
  ('solar',           'Solar & Off-Grid Energy',     '☀️', 7),
  ('animals',         'Animals & Livestock',         '🐄', 8),
  ('building',        'Building & Renovation',       '🪵', 9),
  ('self-sufficiency','Other Self-Sufficiency',      '🌱', 10)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────
-- SUBCATEGORIES (75)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.subcategories (id, category_id, label, sort_order) VALUES

  -- 1. Landscape & Gardening (8)
  ('landscape-raised-beds',        'landscape', 'Raised bed & container gardens',  1),
  ('landscape-soil-composting',    'landscape', 'Soil & composting',               2),
  ('landscape-irrigation',         'landscape', 'Irrigation & watering systems',   3),
  ('landscape-fruit-trees',        'landscape', 'Fruit trees & food forests',      4),
  ('landscape-pest-control',       'landscape', 'Pest & weed control',             5),
  ('landscape-greenhouse',         'landscape', 'Greenhouse & cold frames',        6),
  ('landscape-lawn-pasture',       'landscape', 'Lawn care & pasture',             7),
  ('landscape-seed-saving',        'landscape', 'Seed saving & propagation',       8),

  -- 2. Cooking & Baking (7)
  ('cooking-cast-iron',            'cooking', 'Cast iron & wood stove cooking',    1),
  ('cooking-bread-sourdough',      'cooking', 'Bread & sourdough baking',          2),
  ('cooking-fermentation',         'cooking', 'Fermentation & cultures',           3),
  ('cooking-outdoor-fire',         'cooking', 'Outdoor & open-fire cooking',       4),
  ('cooking-dairy',                'cooking', 'Dairy — butter, cheese, yogurt',    5),
  ('cooking-meal-planning',        'cooking', 'Meal planning from scratch',        6),
  ('cooking-dehydrating',          'cooking', 'Dehydrating & drying food',         7),

  -- 3. Canning & Preservation (7)
  ('canning-water-bath',           'canning', 'Water bath canning',                1),
  ('canning-pressure',             'canning', 'Pressure canning',                  2),
  ('canning-pickling',             'canning', 'Pickling & brining',                3),
  ('canning-jams-jellies',         'canning', 'Jams, jellies & preserves',         4),
  ('canning-freezing',             'canning', 'Freezing & vacuum sealing',         5),
  ('canning-root-cellar',          'canning', 'Root cellar & cold storage',        6),
  ('canning-smoking-curing',       'canning', 'Smoking & curing meats',            7),

  -- 4. Auto & Small Engine Repair (7)
  ('auto-tractors',                'auto', 'Tractors & farm equipment',            1),
  ('auto-atvs-utvs',               'auto', 'ATVs & UTVs',                          2),
  ('auto-generators',              'auto', 'Generators & engines',                 3),
  ('auto-chainsaws-power-tools',   'auto', 'Chainsaws & power tools',              4),
  ('auto-mowers-tillers',          'auto', 'Lawn mowers & tillers',                5),
  ('auto-trucks-trailers',         'auto', 'Trucks & trailers',                    6),
  ('auto-welding-metalwork',       'auto', 'Welding & metalwork',                  7),

  -- 5. Plumbing (7)
  ('plumbing-well-systems',        'plumbing', 'Well systems & pumps',              1),
  ('plumbing-pipe-repair',         'plumbing', 'Pipe repair & replacement',         2),
  ('plumbing-water-heater',        'plumbing', 'Water heater install & repair',     3),
  ('plumbing-irrigation',          'plumbing', 'Irrigation & outdoor lines',        4),
  ('plumbing-septic',              'plumbing', 'Septic & greywater systems',        5),
  ('plumbing-rainwater',           'plumbing', 'Rainwater harvesting',              6),
  ('plumbing-fixtures',            'plumbing', 'Fixtures & faucets',                7),

  -- 6. Electrical (6)
  ('electrical-panel',             'electrical', 'Panel upgrades & breakers',          1),
  ('electrical-outlets-wiring',    'electrical', 'Outlets, switches & wiring',         2),
  ('electrical-generator-hookup',  'electrical', 'Generator hookups & transfer switches', 3),
  ('electrical-barn-wiring',       'electrical', 'Outbuilding & barn wiring',          4),
  ('electrical-low-voltage',       'electrical', 'Low-voltage & lighting',             5),
  ('electrical-ev-charging',       'electrical', 'EV & equipment charging',            6),

  -- 7. Solar & Off-Grid Energy (7)
  ('solar-panel-installation',     'solar', 'Solar panel installation',            1),
  ('solar-battery-banks',          'solar', 'Battery banks & storage',             2),
  ('solar-inverters',              'solar', 'Inverters & charge controllers',       3),
  ('solar-wind-hydro',             'solar', 'Wind & micro-hydro power',             4),
  ('solar-off-grid-cabin',         'solar', 'Off-grid cabin power systems',        5),
  ('solar-propane-backup',         'solar', 'Propane & backup fuel systems',        6),
  ('solar-efficiency-insulation',  'solar', 'Energy efficiency & insulation',       7),

  -- 8. Animals & Livestock (8)
  ('animals-chickens',             'animals', 'Chickens & poultry',                1),
  ('animals-goats-sheep',          'animals', 'Goats & sheep',                     2),
  ('animals-cattle-pigs',          'animals', 'Cattle & pigs',                     3),
  ('animals-rabbits-small',        'animals', 'Rabbits & small animals',           4),
  ('animals-beekeeping',           'animals', 'Beekeeping',                        5),
  ('animals-fencing-pasture',      'animals', 'Fencing & pasture management',      6),
  ('animals-barn-shelter',         'animals', 'Barn & shelter building',           7),
  ('animals-health-first-aid',     'animals', 'Animal health & first aid',         8),

  -- 9. Building & Renovation (8)
  ('building-sheds',               'building', 'Sheds & outbuildings',             1),
  ('building-fencing-gates',       'building', 'Fencing & gates',                  2),
  ('building-decks-porches',       'building', 'Decks & porches',                  3),
  ('building-roofing-gutters',     'building', 'Roofing & gutters',                4),
  ('building-framing-foundations', 'building', 'Framing & foundations',            5),
  ('building-flooring-finishes',   'building', 'Flooring & interior finishes',     6),
  ('building-concrete-masonry',    'building', 'Concrete & masonry',               7),
  ('building-insulation',          'building', 'Insulation & weatherproofing',     8),

  -- 10. Other Self-Sufficiency (8)
  ('self-herbal-medicine',         'self-sufficiency', 'Herbal medicine & first aid',      1),
  ('self-hunting-fishing',         'self-sufficiency', 'Hunting & fishing',                2),
  ('self-foraging',                'self-sufficiency', 'Foraging & wild edibles',          3),
  ('self-fiber-arts',              'self-sufficiency', 'Fiber arts — spinning & weaving',  4),
  ('self-candle-soap',             'self-sufficiency', 'Candle & soap making',             5),
  ('self-water-filtration',        'self-sufficiency', 'Water filtration & storage',       6),
  ('self-emergency-prep',          'self-sufficiency', 'Emergency preparedness',           7),
  ('self-natural-building',        'self-sufficiency', 'Natural building materials',       8)

ON CONFLICT (id) DO NOTHING;
