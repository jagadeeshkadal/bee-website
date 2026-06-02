export interface PollenGrain {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}

export interface HighlightCard {
  value: string;
  label: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  subtitle: string;
  desc: string;
}

export interface ConnoisseurTestimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface SocialLink {
  name: string;
  url: string;
  iconName: 'instagram' | 'twitter' | 'compass';
}

export interface LoyaltyTier {
  rank: string;
  jarsNeeded: number;
  badgeColor: string;
  badgeGlow: string;
  rankName: string;
  benefits: string[];
}

export const cmsConfig = {
  globalSettings: {
    brandName: 'BEE WILD',
    tagline: 'Single-Origin Sanctuary',
    copyright: '© 2026 BEE WILD. ALL RIGHTS RESERVED.',
    seo: {
      title: 'BEE WILD - Luxury Single-Origin Honey Sanctuary',
      description: 'Experience pure, organic, unpasteurized wild honey harvested from ancient forest canopies.'
    },
    navItems: [
      { label: 'Sanctuary', href: '#hero' },
      { label: 'Origin Story', href: '#origin' },
      { label: 'Nectar Catalog', href: '#flavors' },
      { label: 'Alchemy Journey', href: '#process' },
      { label: 'Endorsements', href: '#testimonials' },
      { label: 'Harvest Inquiry', href: '#contact' }
    ]
  },
  
  welcomeGate: {
    badge: 'Craft Raw Nectar',
    titleLine1: 'Premium Wild Honey',
    titleLine2: 'Single-Origin Batches',
    description: 'Collected from ancient forest blossoms. Completely raw, unheated, and unfiltered to preserve natural pollen, minerals, and organic enzymes.',
    previewCards: [
      {
        name: 'WILD FOREST',
        desc: 'Harvested from pine and oak blossoms. Rich, bold, and slow-crystallizing.',
        price: '$45.00',
        badge: 'Limited Harvest'
      },
      {
        name: 'CLOVER BLOSSOM',
        desc: 'Delicate meadow sweetness with butter, vanilla, and fresh grass notes.',
        price: '$38.00',
        badge: 'Seasonal Run'
      },
      {
        name: 'ROYAL BLACK',
        desc: 'An elite infusion of raw wild honey with premium Italian black winter truffles.',
        price: '$85.00',
        badge: 'Reserve Release'
      }
    ],
    gateTitle: 'Explore Interactive Canopy',
    gateDescription: 'Sign in below to unlock access to our Interactive 3D Flying Bee Canvas, secure allocations ledger, and personalized rewards.',
    trustText: 'Firebase 256-bit Auth Handshake'
  },

  heroSection: {
    badge: 'EST. 2026 • PREMIUM NECTAR',
    titleLine1: 'PURE WILD',
    titleLine2: 'HONEY',
    description: 'Indulge in organic, raw honey harvested from the untouched canopies of wild, ancient forests. Unheated, unfiltered, and untamed.',
    scrollText: 'Scroll to discover',
    pollenGrains: [
      { left: '12%', top: '25%', size: 3, delay: 0, duration: 8 },
      { left: '85%', top: '15%', size: 4, delay: 1.5, duration: 10 },
      { left: '45%', top: '78%', size: 2, delay: 0.5, duration: 6 },
      { left: '72%', top: '65%', size: 5, delay: 3, duration: 12 },
      { left: '22%', top: '55%', size: 3, delay: 2, duration: 9 },
      { left: '92%', top: '48%', size: 2, delay: 4, duration: 7 },
      { left: '30%', top: '18%', size: 4, delay: 1, duration: 11 },
      { left: '60%', top: '30%', size: 3, delay: 2.5, duration: 9.5 }
    ] as PollenGrain[]
  },

  originSection: {
    tag: 'OUR WILD ORIGIN',
    titleLine1: 'Crafted by Nature,',
    titleLine2: 'Perfected by Bees',
    description: 'Deep within protected forests, wild bees forage nectar from ancient wild flowers, creating a honey rich in enzymes, antioxidants, and a unique earthy aroma that cannot be manufactured or replicated in a farm environment.',
    highlights: [
      { value: '100%', label: 'Unpasteurized & Raw' },
      { value: 'Forest', label: 'Single-Origin Nectar' }
    ] as HighlightCard[],
    imageSrc: '/images/tree-leaves-green-photo.jpg',
    imageAlt: 'Wild Forest Leaves Backdrop',
    detailTag: 'BIODIVERSE HABITAT',
    detailDescription: 'Where the wild bees perform their legendary aerial ballet, gathering pollen from hundreds of unique botanical sources.'
  },

  processSection: {
    tag: 'THE ANCIENT ALCHEMY',
    titleLine1: 'Journey of',
    titleLine2: 'Gold',
    description: 'Tracing our premium honey from wild high-altitude blooms directly to your exquisite custom jar.',
    imageSrc: '/images/bee-flower.jpg',
    imageAlt: 'Honey Bee Pollen Harvesting',
    detailTag: 'STAGE 01 IN DETAIL',
    detailDescription: 'Witness the microscopic precision of the honey bee as it gathers pure floral essences amid untamed blossom fields.',
    steps: [
      {
        num: '01',
        title: 'POLLEN HARVEST',
        subtitle: 'Nature’s Botanical Search',
        desc: 'Bees fly miles into high altitude forests to harvest nectar from the rarest medicinal blossoms.'
      },
      {
        num: '02',
        title: 'NECTAR ENRICHMENT',
        subtitle: 'Enzymatic Metamorphosis',
        desc: 'Inside the hive, bees refine raw nectar, combining it with their natural enzymes to cure it.'
      },
      {
        num: '03',
        title: 'HONEYCOMB CURING',
        subtitle: 'Hexagonal Storing',
        desc: 'Cured in pristine beeswax structures, sealed with propolis until optimal water density is met.'
      },
      {
        num: '04',
        title: 'ARTISANAL SPINNING',
        subtitle: 'Cold-Pressed Extraction',
        desc: 'Spinning the honeycombs at room temperature to preserve the live enzymes and organic pollen.'
      }
    ] as ProcessStep[]
  },

  testimonialsSection: {
    tag: 'VERIFIED APPRECIATION',
    titleLine1: 'Endorsed by the',
    titleLine2: 'Elite',
    description: 'Read stories from world-class chefs, sommeliers, and honey purists who define luxury by wild standards.',
    list: [
      {
        name: 'Elena Rostova',
        role: 'Michelin Star Chef',
        text: '“The depth of flavor in this Wild Forest honey is completely unmatched. Its smoky spice profile elevates our desserts to pure art.”',
        rating: 5
      },
      {
        name: 'Julian Vance',
        role: 'Luxury Connoisseur',
        text: '“Simply elite. The packaging matches the state of the liquid gold inside. Perfect as a gift, but too delicious to share.”',
        rating: 5
      },
      {
        name: 'Marcus Thorne',
        role: 'Wellness Alchemist',
        text: '“Unfiltered enzymes that truly sustain your energy. It has become a crucial element of my morning ritual. Nature at its finest.”',
        rating: 5
      }
    ] as ConnoisseurTestimonial[]
  },

  contactSection: {
    tag: 'JOIN THE SOCIETY',
    titleLine1: 'Sustain the',
    titleLine2: 'Wild Legacy',
    description: 'Sign up to join our inner circle and receive early allocations of rare harvests, seasonal single-origin releases, and private reserve tastings.',
    details: {
      email: 'sanctuary@beewild.com',
      phone: '+1 (800) BEE-WILD',
      address: 'Wild Canopy Estate, Suite 100, Redwood Valley, CA'
    },
    socialLinks: [
      { name: 'Instagram', url: '#', iconName: 'instagram' },
      { name: 'Twitter', url: '#', iconName: 'twitter' },
      { name: 'Sourcing Guidelines', url: '#', iconName: 'compass' }
    ] as SocialLink[]
  },

  userPortalSettings: {
    ranks: [
      {
        rank: 'Novice',
        jarsNeeded: 0,
        badgeColor: 'border-slate-500 bg-slate-500/10 text-slate-400',
        badgeGlow: 'rgba(148, 163, 184, 0.1)',
        rankName: 'Novice Forager',
        benefits: [
          'Access to core single-origin catalog releases',
          'Standard allocations check ledger',
          'Access to basic wellness recipe portal'
        ]
      },
      {
        rank: 'Bronze',
        jarsNeeded: 1,
        badgeColor: 'border-amber-600 bg-amber-600/10 text-amber-500',
        badgeGlow: 'rgba(217, 119, 6, 0.1)',
        rankName: 'Bronze Forager',
        benefits: [
          '24-hour advance reservation window on seasonal run batches',
          'Digital certificate of wild hive sponsorship',
          'Complimentary raw pollen sample with next allocation'
        ]
      },
      {
        rank: 'Gold',
        jarsNeeded: 3,
        badgeColor: 'border-orange-500 bg-orange-500/10 text-orange-400',
        badgeGlow: 'rgba(249, 115, 22, 0.15)',
        rankName: 'Golden Alchemist',
        benefits: [
          'Priority reserve list placement (guaranteed order fulfillment)',
          '10% dynamic nectar reserve reduction coupon',
          'Invites to online alchemical honey curation events'
        ]
      },
      {
        rank: 'Royal',
        jarsNeeded: 5,
        badgeColor: 'border-honey-gold bg-honey-gold/10 text-honey-gold',
        badgeGlow: 'rgba(255, 183, 3, 0.25)',
        rankName: 'Royal Beekeeper',
        benefits: [
          'Bespoke culinary batch consultations (custom infusions)',
          'First priority allocation of private reserve harvests (before public listing)',
          'VIP invitations to Redwood Valley forest canopy tastings',
          'Steward-class dynamic profile badge'
        ]
      }
    ] as LoyaltyTier[]
  }
};
