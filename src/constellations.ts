/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

export interface Constellation {
  /**
   *
   *
   * The IAU designation of the constellation.
   *
   */
  name:
    | 'Andromeda'
    | 'Antlia'
    | 'Apus'
    | 'Aquarius'
    | 'Aquila'
    | 'Ara'
    | 'Aries'
    | 'Auriga'
    | 'Boötes'
    | 'Caelum'
    | 'Camelopardalis'
    | 'Cancer'
    | 'Canes Venatici'
    | 'Canis Major'
    | 'Canis Minor'
    | 'Capricornus'
    | 'Carina'
    | 'Cassiopeia'
    | 'Centaurus'
    | 'Cepheus'
    | 'Cetus'
    | 'Chamaeleon'
    | 'Circinus'
    | 'Columba'
    | 'Coma Berenices'
    | 'Corona Australis'
    | 'Corona Borealis'
    | 'Corvus'
    | 'Crater'
    | 'Crux'
    | 'Cygnus'
    | 'Delphinus'
    | 'Dorado'
    | 'Draco'
    | 'Equuleus'
    | 'Eridanus'
    | 'Fornax'
    | 'Gemini'
    | 'Grus'
    | 'Hercules'
    | 'Horologium'
    | 'Hydra'
    | 'Hydrus'
    | 'Indus'
    | 'Lacerta'
    | 'Leo'
    | 'Leo Minor'
    | 'Lepus'
    | 'Libra'
    | 'Lupus'
    | 'Lynx'
    | 'Lyra'
    | 'Mensa'
    | 'Microscopium'
    | 'Monoceros'
    | 'Musca'
    | 'Norma'
    | 'Octans'
    | 'Ophiuchus'
    | 'Orion'
    | 'Pavo'
    | 'Pegasus'
    | 'Perseus'
    | 'Phoenix'
    | 'Pictor'
    | 'Pisces'
    | 'Piscis Austrinus'
    | 'Puppis'
    | 'Pyxis'
    | 'Reticulum'
    | 'Sagitta'
    | 'Sagittarius'
    | 'Scorpius'
    | 'Sculptor'
    | 'Scutum'
    | 'Serpens'
    | 'Serpens Caput'
    | 'Serpens Cauda'
    | 'Sextans'
    | 'Taurus'
    | 'Telescopium'
    | 'Triangulum'
    | 'Triangulum Australe'
    | 'Tucana'
    | 'Ursa Major'
    | 'Ursa Minor'
    | 'Vela'
    | 'Virgo'
    | 'Volans'
    | 'Vulpecula'
  /**
   *
   *
   * The meaning of the constellation's name.
   *
   */
  meaning: string
  /**
   *
   *
   * The abbreviation of the constellation's name.
   *
   */
  abbreviation: string
}

/*****************************************************************************************************************/

export const constellations = new Map<Constellation['abbreviation'], Constellation>([
  [
    'And',
    {
      name: 'Andromeda',
      meaning: 'The Chained Princess',
      abbreviation: 'And'
    }
  ],
  [
    'Ant',
    {
      name: 'Antlia',
      meaning: 'The Air Pump',
      abbreviation: 'Ant'
    }
  ],
  [
    'Aps',
    {
      name: 'Apus',
      meaning: 'The Bird of Paradise',
      abbreviation: 'Aps'
    }
  ],
  [
    'Aqr',
    {
      name: 'Aquarius',
      meaning: 'The Water Bearer',
      abbreviation: 'Aqr'
    }
  ],
  [
    'Aql',
    {
      name: 'Aquila',
      meaning: 'The Eagle',
      abbreviation: 'Aql'
    }
  ],
  [
    'Ara',
    {
      name: 'Ara',
      meaning: 'The Altar',
      abbreviation: 'Ara'
    }
  ],
  [
    'Ari',
    {
      name: 'Aries',
      meaning: 'The Ram',
      abbreviation: 'Ari'
    }
  ],
  [
    'Aur',
    {
      name: 'Auriga',
      meaning: 'The Charioteer',
      abbreviation: 'Aur'
    }
  ],
  [
    'Boo',
    {
      name: 'Boötes',
      meaning: 'The Herdsman',
      abbreviation: 'Boo'
    }
  ],
  [
    'Cae',
    {
      name: 'Caelum',
      meaning: 'The Chisel',
      abbreviation: 'Cae'
    }
  ],
  [
    'Cam',
    {
      name: 'Camelopardalis',
      meaning: 'The Giraffe',
      abbreviation: 'Cam'
    }
  ],
  [
    'Cnc',
    {
      name: 'Cancer',
      meaning: 'The Crab',
      abbreviation: 'Cnc'
    }
  ],
  [
    'CVn',
    {
      name: 'Canes Venatici',
      meaning: 'The Hunting Dogs',
      abbreviation: 'CVn'
    }
  ],
  [
    'CMa',
    {
      name: 'Canis Major',
      meaning: 'The Great Dog',
      abbreviation: 'CMa'
    }
  ],
  [
    'CMi',
    {
      name: 'Canis Minor',
      meaning: 'The Lesser Dog',
      abbreviation: 'CMi'
    }
  ],
  [
    'Cap',
    {
      name: 'Capricornus',
      meaning: 'The Sea Goat',
      abbreviation: 'Cap'
    }
  ],
  [
    'Car',
    {
      name: 'Carina',
      meaning: 'The Keel',
      abbreviation: 'Car'
    }
  ],
  [
    'Cas',
    {
      name: 'Cassiopeia',
      meaning: 'The Queen',
      abbreviation: 'Cas'
    }
  ],
  [
    'Cen',
    {
      name: 'Centaurus',
      meaning: 'The Centaur',
      abbreviation: 'Cen'
    }
  ],
  [
    'Cep',
    {
      name: 'Cepheus',
      meaning: 'The King',
      abbreviation: 'Cep'
    }
  ],
  [
    'Cet',
    {
      name: 'Cetus',
      meaning: 'The Whale',
      abbreviation: 'Cet'
    }
  ],
  [
    'Cha',
    {
      name: 'Chamaeleon',
      meaning: 'The Chameleon',
      abbreviation: 'Cha'
    }
  ],
  [
    'Cir',
    {
      name: 'Circinus',
      meaning: 'The Compasses',
      abbreviation: 'Cir'
    }
  ],
  [
    'Col',
    {
      name: 'Columba',
      meaning: 'The Dove',
      abbreviation: 'Col'
    }
  ],
  [
    'Com',
    {
      name: 'Coma Berenices',
      meaning: "Berenice's Hair",
      abbreviation: 'Com'
    }
  ],
  [
    'CrA',
    {
      name: 'Corona Australis',
      meaning: 'The Southern Crown',
      abbreviation: 'CrA'
    }
  ],
  [
    'CrB',
    {
      name: 'Corona Borealis',
      meaning: 'The Northern Crown',
      abbreviation: 'CrB'
    }
  ],
  [
    'Crv',
    {
      name: 'Corvus',
      meaning: 'The Crow',
      abbreviation: 'Crv'
    }
  ],
  [
    'Crt',
    {
      name: 'Crater',
      meaning: 'The Cup',
      abbreviation: 'Crt'
    }
  ],
  [
    'Cru',
    {
      name: 'Crux',
      meaning: 'The Southern Cross',
      abbreviation: 'Cru'
    }
  ],
  [
    'Cyg',
    {
      name: 'Cygnus',
      meaning: 'The Swan',
      abbreviation: 'Cyg'
    }
  ],
  [
    'Del',
    {
      name: 'Delphinus',
      meaning: 'The Dolphin',
      abbreviation: 'Del'
    }
  ],
  [
    'Dor',
    {
      name: 'Dorado',
      meaning: 'The Swordfish',
      abbreviation: 'Dor'
    }
  ],
  [
    'Dra',
    {
      name: 'Draco',
      meaning: 'The Dragon',
      abbreviation: 'Dra'
    }
  ],
  [
    'Equ',
    {
      name: 'Equuleus',
      meaning: 'The Little Horse',
      abbreviation: 'Equ'
    }
  ],
  [
    'Eri',
    {
      name: 'Eridanus',
      meaning: 'The River',
      abbreviation: 'Eri'
    }
  ],
  [
    'For',
    {
      name: 'Fornax',
      meaning: 'The Furnace',
      abbreviation: 'For'
    }
  ],
  [
    'Gem',
    {
      name: 'Gemini',
      meaning: 'The Twins',
      abbreviation: 'Gem'
    }
  ],
  [
    'Gru',
    {
      name: 'Grus',
      meaning: 'The Crane',
      abbreviation: 'Gru'
    }
  ],
  [
    'Her',
    {
      name: 'Hercules',
      meaning: 'The Hero',
      abbreviation: 'Her'
    }
  ],
  [
    'Hor',
    {
      name: 'Horologium',
      meaning: 'The Pendulum Clock',
      abbreviation: 'Hor'
    }
  ],
  [
    'Hya',
    {
      name: 'Hydra',
      meaning: 'The Water Snake',
      abbreviation: 'Hya'
    }
  ],
  [
    'Hyi',
    {
      name: 'Hydrus',
      meaning: 'The Water Snake',
      abbreviation: 'Hyi'
    }
  ],
  [
    'Ind',
    {
      name: 'Indus',
      meaning: 'The Indian',
      abbreviation: 'Ind'
    }
  ],
  [
    'Lac',
    {
      name: 'Lacerta',
      meaning: 'The Lizard',
      abbreviation: 'Lac'
    }
  ],
  [
    'Leo',
    {
      name: 'Leo',
      meaning: 'The Lion',
      abbreviation: 'Leo'
    }
  ],
  [
    'LMi',
    {
      name: 'Leo Minor',
      meaning: 'The Lesser Lion',
      abbreviation: 'LMi'
    }
  ],
  [
    'Lep',
    {
      name: 'Lepus',
      meaning: 'The Hare',
      abbreviation: 'Lep'
    }
  ],
  [
    'Lib',
    {
      name: 'Libra',
      meaning: 'The Scales',
      abbreviation: 'Lib'
    }
  ],
  [
    'Lup',
    {
      name: 'Lupus',
      meaning: 'The Wolf',
      abbreviation: 'Lup'
    }
  ],
  [
    'Lyn',
    {
      name: 'Lynx',
      meaning: 'The Lynx',
      abbreviation: 'Lyn'
    }
  ],
  [
    'Lyr',
    {
      name: 'Lyra',
      meaning: 'The Lyre',
      abbreviation: 'Lyr'
    }
  ],
  [
    'Men',
    {
      name: 'Mensa',
      meaning: 'The Table Mountain',
      abbreviation: 'Men'
    }
  ],
  [
    'Mic',
    {
      name: 'Microscopium',
      meaning: 'The Microscope',
      abbreviation: 'Mic'
    }
  ],
  [
    'Mon',
    {
      name: 'Monoceros',
      meaning: 'The Unicorn',
      abbreviation: 'Mon'
    }
  ],
  [
    'Mus',
    {
      name: 'Musca',
      meaning: 'The Fly',
      abbreviation: 'Mus'
    }
  ],
  [
    'Nor',
    {
      name: 'Norma',
      meaning: "The Carpenter's Square",
      abbreviation: 'Nor'
    }
  ],
  [
    'Oct',
    {
      name: 'Octans',
      meaning: 'The Octant',
      abbreviation: 'Oct'
    }
  ],
  [
    'Oph',
    {
      name: 'Ophiuchus',
      meaning: 'The Serpent Bearer',
      abbreviation: 'Oph'
    }
  ],
  [
    'Ori',
    {
      name: 'Orion',
      meaning: 'Orion the Hunter',
      abbreviation: 'Ori'
    }
  ],
  [
    'Pav',
    {
      name: 'Pavo',
      meaning: 'The Peacock',
      abbreviation: 'Pav'
    }
  ],
  [
    'Peg',
    {
      name: 'Pegasus',
      meaning: 'The Winged Horse',
      abbreviation: 'Peg'
    }
  ],
  [
    'Per',
    {
      name: 'Perseus',
      meaning: 'Perseus',
      abbreviation: 'Per'
    }
  ],
  [
    'Phe',
    {
      name: 'Phoenix',
      meaning: 'The Phoenix',
      abbreviation: 'Phe'
    }
  ],
  [
    'Pic',
    {
      name: 'Pictor',
      meaning: "The Painter's Easel",
      abbreviation: 'Pic'
    }
  ],
  [
    'Psc',
    {
      name: 'Pisces',
      meaning: 'The Fishes',
      abbreviation: 'Psc'
    }
  ],
  [
    'PsA',
    {
      name: 'Piscis Austrinus',
      meaning: 'The Southern Fish',
      abbreviation: 'PsA'
    }
  ],
  [
    'Pup',
    {
      name: 'Puppis',
      meaning: 'The Poop Deck',
      abbreviation: 'Pup'
    }
  ],
  [
    'Pyx',
    {
      name: 'Pyxis',
      meaning: 'The Compass',
      abbreviation: 'Pyx'
    }
  ],
  [
    'Ret',
    {
      name: 'Reticulum',
      meaning: 'The Reticle',
      abbreviation: 'Ret'
    }
  ],
  [
    'Sge',
    {
      name: 'Sagitta',
      meaning: 'The Arrow',
      abbreviation: 'Sge'
    }
  ],
  [
    'Sgr',
    {
      name: 'Sagittarius',
      meaning: 'The Archer',
      abbreviation: 'Sgr'
    }
  ],
  [
    'Sco',
    {
      name: 'Scorpius',
      meaning: 'The Scorpion',
      abbreviation: 'Sco'
    }
  ],
  [
    'Scl',
    {
      name: 'Sculptor',
      meaning: "The Sculptor's Studio",
      abbreviation: 'Scl'
    }
  ],
  [
    'Sct',
    {
      name: 'Scutum',
      meaning: 'The Shield',
      abbreviation: 'Sct'
    }
  ],
  [
    'Ser',
    {
      name: 'Serpens',
      meaning: 'The Serpent',
      abbreviation: 'Ser'
    }
  ],
  [
    'Sex',
    {
      name: 'Sextans',
      meaning: 'The Sextant',
      abbreviation: 'Sex'
    }
  ],
  [
    'Tau',
    {
      name: 'Taurus',
      meaning: 'The Bull',
      abbreviation: 'Tau'
    }
  ],
  [
    'Tel',
    {
      name: 'Telescopium',
      meaning: 'The Telescope',
      abbreviation: 'Tel'
    }
  ],
  [
    'Tri',
    {
      name: 'Triangulum',
      meaning: 'The Triangle',
      abbreviation: 'Tri'
    }
  ],
  [
    'TrA',
    {
      name: 'Triangulum Australe',
      meaning: 'The Southern Triangle',
      abbreviation: 'TrA'
    }
  ],
  [
    'Tuc',
    {
      name: 'Tucana',
      meaning: 'The Toucan',
      abbreviation: 'Tuc'
    }
  ],
  [
    'UMa',
    {
      name: 'Ursa Major',
      meaning: 'The Great Bear',
      abbreviation: 'UMa'
    }
  ],
  [
    'UMi',
    {
      name: 'Ursa Minor',
      meaning: 'The Little Bear',
      abbreviation: 'UMi'
    }
  ],
  [
    'Vel',
    {
      name: 'Vela',
      meaning: 'The Sails',
      abbreviation: 'Vel'
    }
  ],
  [
    'Vir',
    {
      name: 'Virgo',
      meaning: 'The Virgin',
      abbreviation: 'Vir'
    }
  ],
  [
    'Vol',
    {
      name: 'Volans',
      meaning: 'The Flying Fish',
      abbreviation: 'Vol'
    }
  ],
  [
    'Vul',
    {
      name: 'Vulpecula',
      meaning: 'The Little Fox',
      abbreviation: 'Vul'
    }
  ]
])

/*****************************************************************************************************************/
