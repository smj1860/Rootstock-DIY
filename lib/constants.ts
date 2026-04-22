export interface Category {
  id: string
  label: string
  icon: string
}

export interface Subcategory {
  id: string
  categoryId: string
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'landscape',  icon: '🌿', label: 'Landscape & Gardening' },
  { id: 'cooking',    icon: '🍳', label: 'Cooking & Baking' },
  { id: 'canning',    icon: '🫙', label: 'Canning' },
  { id: 'auto',       icon: '🔧', label: 'Auto & Small Engine' },
  { id: 'plumbing',   icon: '🚿', label: 'Plumbing' },
  { id: 'electrical', icon: '⚡', label: 'Electrical' },
  { id: 'solar',      icon: '☀️', label: 'Solar' },
  { id: 'livestock',  icon: '🐄', label: 'Animals & Livestock' },
  { id: 'building',   icon: '🪵', label: 'Building & Renovation' },
  { id: 'other',      icon: '🌱', label: 'Other Self-Sufficiency' },
]

export const SUBCATEGORIES: Subcategory[] = [
  { id: 'raised-beds',      categoryId: 'landscape',  label: 'Raised Beds' },
  { id: 'composting',       categoryId: 'landscape',  label: 'Composting' },
  { id: 'irrigation',       categoryId: 'landscape',  label: 'Irrigation Systems' },
  { id: 'greenhouse',       categoryId: 'landscape',  label: 'Greenhouse' },
  { id: 'pest-control',     categoryId: 'landscape',  label: 'Pest Control' },
  { id: 'soil-prep',        categoryId: 'landscape',  label: 'Soil Preparation' },
  { id: 'fruit-trees',      categoryId: 'landscape',  label: 'Fruit Trees' },
  { id: 'bread',            categoryId: 'cooking',    label: 'Bread Baking' },
  { id: 'fermentation',     categoryId: 'cooking',    label: 'Fermentation' },
  { id: 'sourdough',        categoryId: 'cooking',    label: 'Sourdough' },
  { id: 'smoking-meat',     categoryId: 'cooking',    label: 'Smoking Meat' },
  { id: 'dehydrating',      categoryId: 'cooking',    label: 'Dehydrating Food' },
  { id: 'cheese-making',    categoryId: 'cooking',    label: 'Cheese Making' },
  { id: 'water-bath',       categoryId: 'canning',    label: 'Water Bath Canning' },
  { id: 'pressure-canning', categoryId: 'canning',    label: 'Pressure Canning' },
  { id: 'pickling',         categoryId: 'canning',    label: 'Pickling' },
  { id: 'jams-jellies',     categoryId: 'canning',    label: 'Jams & Jellies' },
  { id: 'tomatoes',         categoryId: 'canning',    label: 'Tomatoes' },
  { id: 'oil-change',       categoryId: 'auto',       label: 'Oil Change' },
  { id: 'brakes',           categoryId: 'auto',       label: 'Brakes' },
  { id: 'small-engine',     categoryId: 'auto',       label: 'Small Engine Repair' },
  { id: 'tires',            categoryId: 'auto',       label: 'Tires' },
  { id: 'battery',          categoryId: 'auto',       label: 'Battery & Electrical' },
  { id: 'pipe-repair',      categoryId: 'plumbing',   label: 'Pipe Repair' },
  { id: 'well-pump',        categoryId: 'plumbing',   label: 'Well Pump' },
  { id: 'water-heater',     categoryId: 'plumbing',   label: 'Water Heater' },
  { id: 'septic',           categoryId: 'plumbing',   label: 'Septic System' },
  { id: 'faucets',          categoryId: 'plumbing',   label: 'Faucets & Fixtures' },
  { id: 'panel-work',       categoryId: 'electrical', label: 'Panel Work' },
  { id: 'outlets',          categoryId: 'electrical', label: 'Outlets & Switches' },
  { id: 'lighting',         categoryId: 'electrical', label: 'Lighting' },
  { id: 'generator',        categoryId: 'electrical', label: 'Generator Setup' },
  { id: 'solar-panels',     categoryId: 'solar',      label: 'Solar Panel Install' },
  { id: 'battery-bank',     categoryId: 'solar',      label: 'Battery Bank' },
  { id: 'inverter',         categoryId: 'solar',      label: 'Inverter Setup' },
  { id: 'off-grid',         categoryId: 'solar',      label: 'Off-Grid System' },
  { id: 'chickens',         categoryId: 'livestock',  label: 'Chickens' },
  { id: 'goats',            categoryId: 'livestock',  label: 'Goats' },
  { id: 'pigs',             categoryId: 'livestock',  label: 'Pigs' },
  { id: 'cattle',           categoryId: 'livestock',  label: 'Cattle' },
  { id: 'bees',             categoryId: 'livestock',  label: 'Beekeeping' },
  { id: 'rabbits',          categoryId: 'livestock',  label: 'Rabbits' },
  { id: 'shed',             categoryId: 'building',   label: 'Shed Building' },
  { id: 'fencing',          categoryId: 'building',   label: 'Fencing' },
  { id: 'roofing',          categoryId: 'building',   label: 'Roofing' },
  { id: 'framing',          categoryId: 'building',   label: 'Framing' },
  { id: 'concrete',         categoryId: 'building',   label: 'Concrete Work' },
  { id: 'insulation',       categoryId: 'building',   label: 'Insulation' },
  { id: 'water-storage',    categoryId: 'other',      label: 'Water Storage' },
  { id: 'food-storage',     categoryId: 'other',      label: 'Food Storage' },
  { id: 'first-aid',        categoryId: 'other',      label: 'First Aid' },
  { id: 'foraging',         categoryId: 'other',      label: 'Foraging' },
  { id: 'hunting',          categoryId: 'other',      label: 'Hunting & Trapping' },
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id)
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): Subcategory | undefined {
  return SUBCATEGORIES.find(s => s.categoryId === categoryId && s.id === subcategoryId)
}

export function getSubcategoriesByCategoryId(categoryId: string): Subcategory[] {
  return SUBCATEGORIES.filter(s => s.categoryId === categoryId)
}