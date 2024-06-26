/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type EquatorialCoordinate } from './common'

import { NANCY_ROMAN_TABLE_I, isNancyRomanRecord } from './nancy'

import { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

/*****************************************************************************************************************/

export type ConstellationName =
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

/*****************************************************************************************************************/

/**
 *
 * Constellation
 *
 * Represents a constellation.
 *
 */
export interface Constellation {
  /**
   *
   *
   * The IAU designation of the constellation.
   *
   */
  name: ConstellationName

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

export const constellations: Map<ConstellationName, Constellation> = new Map<
  ConstellationName,
  Constellation
>([
  [
    'Andromeda',
    {
      name: 'Andromeda',
      meaning: 'The Chained Princess',
      abbreviation: 'And'
    }
  ],
  [
    'Antlia',
    {
      name: 'Antlia',
      meaning: 'The Air Pump',
      abbreviation: 'Ant'
    }
  ],
  [
    'Apus',
    {
      name: 'Apus',
      meaning: 'The Bird of Paradise',
      abbreviation: 'Aps'
    }
  ],
  [
    'Aquarius',
    {
      name: 'Aquarius',
      meaning: 'The Water Bearer',
      abbreviation: 'Aqr'
    }
  ],
  [
    'Aquila',
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
    'Aries',
    {
      name: 'Aries',
      meaning: 'The Ram',
      abbreviation: 'Ari'
    }
  ],
  [
    'Auriga',
    {
      name: 'Auriga',
      meaning: 'The Charioteer',
      abbreviation: 'Aur'
    }
  ],
  [
    'Boötes',
    {
      name: 'Boötes',
      meaning: 'The Herdsman',
      abbreviation: 'Boo'
    }
  ],
  [
    'Caelum',
    {
      name: 'Caelum',
      meaning: 'The Chisel',
      abbreviation: 'Cae'
    }
  ],
  [
    'Camelopardalis',
    {
      name: 'Camelopardalis',
      meaning: 'The Giraffe',
      abbreviation: 'Cam'
    }
  ],
  [
    'Cancer',
    {
      name: 'Cancer',
      meaning: 'The Crab',
      abbreviation: 'Cnc'
    }
  ],
  [
    'Canes Venatici',
    {
      name: 'Canes Venatici',
      meaning: 'The Hunting Dogs',
      abbreviation: 'CVn'
    }
  ],
  [
    'Canis Major',
    {
      name: 'Canis Major',
      meaning: 'The Great Dog',
      abbreviation: 'CMa'
    }
  ],
  [
    'Canis Minor',
    {
      name: 'Canis Minor',
      meaning: 'The Lesser Dog',
      abbreviation: 'CMi'
    }
  ],
  [
    'Capricornus',
    {
      name: 'Capricornus',
      meaning: 'The Sea Goat',
      abbreviation: 'Cap'
    }
  ],
  [
    'Carina',
    {
      name: 'Carina',
      meaning: 'The Keel',
      abbreviation: 'Car'
    }
  ],
  [
    'Cassiopeia',
    {
      name: 'Cassiopeia',
      meaning: 'The Queen',
      abbreviation: 'Cas'
    }
  ],
  [
    'Centaurus',
    {
      name: 'Centaurus',
      meaning: 'The Centaur',
      abbreviation: 'Cen'
    }
  ],
  [
    'Cepheus',
    {
      name: 'Cepheus',
      meaning: 'The King',
      abbreviation: 'Cep'
    }
  ],
  [
    'Cetus',
    {
      name: 'Cetus',
      meaning: 'The Whale',
      abbreviation: 'Cet'
    }
  ],
  [
    'Chamaeleon',
    {
      name: 'Chamaeleon',
      meaning: 'The Chameleon',
      abbreviation: 'Cha'
    }
  ],
  [
    'Circinus',
    {
      name: 'Circinus',
      meaning: 'The Compasses',
      abbreviation: 'Cir'
    }
  ],
  [
    'Columba',
    {
      name: 'Columba',
      meaning: 'The Dove',
      abbreviation: 'Col'
    }
  ],
  [
    'Coma Berenices',
    {
      name: 'Coma Berenices',
      meaning: "Berenice's Hair",
      abbreviation: 'Com'
    }
  ],
  [
    'Corona Australis',
    {
      name: 'Corona Australis',
      meaning: 'The Southern Crown',
      abbreviation: 'CrA'
    }
  ],
  [
    'Corona Borealis',
    {
      name: 'Corona Borealis',
      meaning: 'The Northern Crown',
      abbreviation: 'CrB'
    }
  ],
  [
    'Corvus',
    {
      name: 'Corvus',
      meaning: 'The Crow',
      abbreviation: 'Crv'
    }
  ],
  [
    'Crater',
    {
      name: 'Crater',
      meaning: 'The Cup',
      abbreviation: 'Crt'
    }
  ],
  [
    'Crux',
    {
      name: 'Crux',
      meaning: 'The Southern Cross',
      abbreviation: 'Cru'
    }
  ],
  [
    'Cygnus',
    {
      name: 'Cygnus',
      meaning: 'The Swan',
      abbreviation: 'Cyg'
    }
  ],
  [
    'Delphinus',
    {
      name: 'Delphinus',
      meaning: 'The Dolphin',
      abbreviation: 'Del'
    }
  ],
  [
    'Dorado',
    {
      name: 'Dorado',
      meaning: 'The Swordfish',
      abbreviation: 'Dor'
    }
  ],
  [
    'Draco',
    {
      name: 'Draco',
      meaning: 'The Dragon',
      abbreviation: 'Dra'
    }
  ],
  [
    'Equuleus',
    {
      name: 'Equuleus',
      meaning: 'The Little Horse',
      abbreviation: 'Equ'
    }
  ],
  [
    'Eridanus',
    {
      name: 'Eridanus',
      meaning: 'The River',
      abbreviation: 'Eri'
    }
  ],
  [
    'Fornax',
    {
      name: 'Fornax',
      meaning: 'The Furnace',
      abbreviation: 'For'
    }
  ],
  [
    'Gemini',
    {
      name: 'Gemini',
      meaning: 'The Twins',
      abbreviation: 'Gem'
    }
  ],
  [
    'Grus',
    {
      name: 'Grus',
      meaning: 'The Crane',
      abbreviation: 'Gru'
    }
  ],
  [
    'Hercules',
    {
      name: 'Hercules',
      meaning: 'The Hero',
      abbreviation: 'Her'
    }
  ],
  [
    'Horologium',
    {
      name: 'Horologium',
      meaning: 'The Pendulum Clock',
      abbreviation: 'Hor'
    }
  ],
  [
    'Hydra',
    {
      name: 'Hydra',
      meaning: 'The Water Snake',
      abbreviation: 'Hya'
    }
  ],
  [
    'Hydrus',
    {
      name: 'Hydrus',
      meaning: 'The Water Snake',
      abbreviation: 'Hyi'
    }
  ],
  [
    'Indus',
    {
      name: 'Indus',
      meaning: 'The Indian',
      abbreviation: 'Ind'
    }
  ],
  [
    'Lacerta',
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
    'Leo Minor',
    {
      name: 'Leo Minor',
      meaning: 'The Lesser Lion',
      abbreviation: 'LMi'
    }
  ],
  [
    'Lepus',
    {
      name: 'Lepus',
      meaning: 'The Hare',
      abbreviation: 'Lep'
    }
  ],
  [
    'Libra',
    {
      name: 'Libra',
      meaning: 'The Scales',
      abbreviation: 'Lib'
    }
  ],
  [
    'Lupus',
    {
      name: 'Lupus',
      meaning: 'The Wolf',
      abbreviation: 'Lup'
    }
  ],
  [
    'Lynx',
    {
      name: 'Lynx',
      meaning: 'The Lynx',
      abbreviation: 'Lyn'
    }
  ],
  [
    'Lyra',
    {
      name: 'Lyra',
      meaning: 'The Lyre',
      abbreviation: 'Lyr'
    }
  ],
  [
    'Mensa',
    {
      name: 'Mensa',
      meaning: 'The Table Mountain',
      abbreviation: 'Men'
    }
  ],
  [
    'Microscopium',
    {
      name: 'Microscopium',
      meaning: 'The Microscope',
      abbreviation: 'Mic'
    }
  ],
  [
    'Monoceros',
    {
      name: 'Monoceros',
      meaning: 'The Unicorn',
      abbreviation: 'Mon'
    }
  ],
  [
    'Musca',
    {
      name: 'Musca',
      meaning: 'The Fly',
      abbreviation: 'Mus'
    }
  ],
  [
    'Norma',
    {
      name: 'Norma',
      meaning: "The Carpenter's Square",
      abbreviation: 'Nor'
    }
  ],
  [
    'Octans',
    {
      name: 'Octans',
      meaning: 'The Octant',
      abbreviation: 'Oct'
    }
  ],
  [
    'Ophiuchus',
    {
      name: 'Ophiuchus',
      meaning: 'The Serpent Bearer',
      abbreviation: 'Oph'
    }
  ],
  [
    'Orion',
    {
      name: 'Orion',
      meaning: 'Orion the Hunter',
      abbreviation: 'Ori'
    }
  ],
  [
    'Pavo',
    {
      name: 'Pavo',
      meaning: 'The Peacock',
      abbreviation: 'Pav'
    }
  ],
  [
    'Pegasus',
    {
      name: 'Pegasus',
      meaning: 'The Winged Horse',
      abbreviation: 'Peg'
    }
  ],
  [
    'Perseus',
    {
      name: 'Perseus',
      meaning: 'Perseus',
      abbreviation: 'Per'
    }
  ],
  [
    'Phoenix',
    {
      name: 'Phoenix',
      meaning: 'The Phoenix',
      abbreviation: 'Phe'
    }
  ],
  [
    'Pictor',
    {
      name: 'Pictor',
      meaning: "The Painter's Easel",
      abbreviation: 'Pic'
    }
  ],
  [
    'Pisces',
    {
      name: 'Pisces',
      meaning: 'The Fishes',
      abbreviation: 'Psc'
    }
  ],
  [
    'Piscis Austrinus',
    {
      name: 'Piscis Austrinus',
      meaning: 'The Southern Fish',
      abbreviation: 'PsA'
    }
  ],
  [
    'Puppis',
    {
      name: 'Puppis',
      meaning: 'The Poop Deck',
      abbreviation: 'Pup'
    }
  ],
  [
    'Pyxis',
    {
      name: 'Pyxis',
      meaning: 'The Compass',
      abbreviation: 'Pyx'
    }
  ],
  [
    'Reticulum',
    {
      name: 'Reticulum',
      meaning: 'The Reticle',
      abbreviation: 'Ret'
    }
  ],
  [
    'Sagitta',
    {
      name: 'Sagitta',
      meaning: 'The Arrow',
      abbreviation: 'Sge'
    }
  ],
  [
    'Sagittarius',
    {
      name: 'Sagittarius',
      meaning: 'The Archer',
      abbreviation: 'Sgr'
    }
  ],
  [
    'Scorpius',
    {
      name: 'Scorpius',
      meaning: 'The Scorpion',
      abbreviation: 'Sco'
    }
  ],
  [
    'Sculptor',
    {
      name: 'Sculptor',
      meaning: "The Sculptor's Studio",
      abbreviation: 'Scl'
    }
  ],
  [
    'Scutum',
    {
      name: 'Scutum',
      meaning: 'The Shield',
      abbreviation: 'Sct'
    }
  ],
  [
    'Serpens',
    {
      name: 'Serpens',
      meaning: 'The Serpent',
      abbreviation: 'Ser'
    }
  ],
  [
    'Sextans',
    {
      name: 'Sextans',
      meaning: 'The Sextant',
      abbreviation: 'Sex'
    }
  ],
  [
    'Taurus',
    {
      name: 'Taurus',
      meaning: 'The Bull',
      abbreviation: 'Tau'
    }
  ],
  [
    'Telescopium',
    {
      name: 'Telescopium',
      meaning: 'The Telescope',
      abbreviation: 'Tel'
    }
  ],
  [
    'Triangulum',
    {
      name: 'Triangulum',
      meaning: 'The Triangle',
      abbreviation: 'Tri'
    }
  ],
  [
    'Triangulum Australe',
    {
      name: 'Triangulum Australe',
      meaning: 'The Southern Triangle',
      abbreviation: 'TrA'
    }
  ],
  [
    'Tucana',
    {
      name: 'Tucana',
      meaning: 'The Toucan',
      abbreviation: 'Tuc'
    }
  ],
  [
    'Ursa Major',
    {
      name: 'Ursa Major',
      meaning: 'The Great Bear',
      abbreviation: 'UMa'
    }
  ],
  [
    'Ursa Minor',
    {
      name: 'Ursa Minor',
      meaning: 'The Little Bear',
      abbreviation: 'UMi'
    }
  ],
  [
    'Vela',
    {
      name: 'Vela',
      meaning: 'The Sails',
      abbreviation: 'Vel'
    }
  ],
  [
    'Virgo',
    {
      name: 'Virgo',
      meaning: 'The Virgin',
      abbreviation: 'Vir'
    }
  ],
  [
    'Volans',
    {
      name: 'Volans',
      meaning: 'The Flying Fish',
      abbreviation: 'Vol'
    }
  ],
  [
    'Vulpecula',
    {
      name: 'Vulpecula',
      meaning: 'The Little Fox',
      abbreviation: 'Vul'
    }
  ]
])

/*****************************************************************************************************************/

/**
 *
 * getConstellation()
 *
 * Performs a lookup of the Nancy Roman lookup table to find the constellation
 * that the target equatorial coordinate is in.
 *
 * @param target - The target equatorial coordinate.
 * @returns The constellation that the target equatorial coordinate is in, or undefined
 *
 */
export const getConstellation = (target: EquatorialCoordinate): Constellation | undefined => {
  // We precess to 1875, as the Nancy Roman lookup table is accurate for that epoch:
  const corr = getCorrectionToEquatorialForPrecessionOfEquinoxes(new Date(1875, 0, 0), target)

  // Apply the correction to the target's right ascension:
  const ra = target.ra + (corr.ra % 360)

  // Apply the correction to the target's declination:
  const dec = target.dec + corr.dec

  // N.B. The Nancy Roman lookup table uses right ascension in hours,
  // so we convert the target's right ascension to hours:
  const ha = ra / 15

  // Find the constellation that matches the target's coordinates in the Nancy Roman lookup table :
  const record = NANCY_ROMAN_TABLE_I.find(
    constellation =>
      !(dec < constellation.decl || ha < constellation.ral || ha >= constellation.rau)
  )

  if (!isNancyRomanRecord(record)) {
    return undefined
  }

  // If we have a match, return the constellation, otherwise return undefined:
  return record ? constellations.get(record.name as ConstellationName) : undefined
}

/*****************************************************************************************************************/
