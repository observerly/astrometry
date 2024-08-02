/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'

import type { EquatorialCoordinate } from './common'

import { NANCY_ROMAN_TABLE_I, isNancyRomanRecord } from './nancy'

import { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

/*****************************************************************************************************************/

import { andromeda } from './constellations/andromeda'
import { antila } from './constellations/antila'
import { apus } from './constellations/apus'
import { aquarius } from './constellations/aquarius'
import { aquila } from './constellations/aquila'
import { ara } from './constellations/ara'
import { aries } from './constellations/aries'
import { auriga } from './constellations/auriga'
import { bootes } from './constellations/bootes'
import { caelum } from './constellations/caelum'
import { camelopardalis } from './constellations/camelopardalis'
import { cancer } from './constellations/cancer'
import { canesVenatici } from './constellations/canesVenatici'
import { canisMajor } from './constellations/canisMajor'
import { canisMinor } from './constellations/canisMinor'
import { capricornus } from './constellations/capricornus'
import { carina } from './constellations/carina'
import { cassiopeia } from './constellations/cassiopeia'
import { centaurus } from './constellations/centaurus'
import { cepheus } from './constellations/cepheus'
import { cetus } from './constellations/cetus'
import { chamaeleon } from './constellations/chamaeleon'
import { circinus } from './constellations/circinus'
import { columba } from './constellations/columba'
import { comaBerenices } from './constellations/comaBerenices'
import { coronaAustralis } from './constellations/coronaAustralis'
import { coronaBorealis } from './constellations/coronaBorealis'
import { corvus } from './constellations/corvus'
import { crater } from './constellations/crater'
import { crux } from './constellations/crux'
import { cygnus } from './constellations/cygnus'
import { delphinus } from './constellations/delphinus'
import { dorado } from './constellations/dorado'
import { draco } from './constellations/draco'
import { equuleus } from './constellations/equuleus'
import { eridanus } from './constellations/eridanus'
import { fornax } from './constellations/fornax'
import { gemini } from './constellations/gemini'
import { grus } from './constellations/grus'
import { hercules } from './constellations/hercules'
import { horologium } from './constellations/horologium'
import { hydra } from './constellations/hydra'
import { hydrus } from './constellations/hydrus'
import { indus } from './constellations/indus'
import { lacerta } from './constellations/lacerta'
import { leo } from './constellations/leo'
import { leoMinor } from './constellations/leoMinor'
import { lepus } from './constellations/lepus'
import { libra } from './constellations/libra'
import { lupus } from './constellations/lupus'
import { lynx } from './constellations/lynx'
import { lyra } from './constellations/lyra'
import { mensa } from './constellations/mensa'
import { microscopium } from './constellations/microscopium'
import { monoceros } from './constellations/monoceros'
import { musca } from './constellations/musca'
import { norma } from './constellations/norma'
import { octans } from './constellations/octans'
import { ophiuchus } from './constellations/ophiuchus'
import { orion } from './constellations/orion'
import { pavo } from './constellations/pavo'
import { pegasus } from './constellations/pegasus'
import { perseus } from './constellations/perseus'
import { phoenix } from './constellations/phoenix'
import { pictor } from './constellations/pictor'
import { pisces } from './constellations/pisces'
import { piscisAustrinus } from './constellations/piscisAustrinus'
import { puppis } from './constellations/puppis'
import { pyxis } from './constellations/pyxis'
import { reticulum } from './constellations/reticulum'
import { sagitta } from './constellations/sagitta'
import { sagittarius } from './constellations/sagittarius'
import { scorpius } from './constellations/scorpius'
import { sculptor } from './constellations/sculptor'
import { scutum } from './constellations/scutum'
import { serpensCaput, serpensCauda } from './constellations/serpens'
import { sextans } from './constellations/sextans'
import { taurus } from './constellations/taurus'
import { telescopium } from './constellations/telescopium'
import { triangulum } from './constellations/triangulum'
import { triangulumAustralae } from './constellations/triangulumAustralae'
import { tucana } from './constellations/tucana'
import { ursaMajor } from './constellations/ursaMajor'
import { ursaMinor } from './constellations/ursaMinor'
import { vela } from './constellations/vela'
import { virgo } from './constellations/virgo'
import { volans } from './constellations/volans'
import { vulpecula } from './constellations/vulpecula'

/*****************************************************************************************************************/

export type ConstellationName =
  | 'Andromeda'
  | 'Antila'
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
 * Represents one of the 88 official IAU constellations
 * @see https://www.iau.org/public/themes/constellations/
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
  /**
   *
   * The feature of the constellation, represenmted as a GeoJSON FeatureCollection.
   *
   */
  feature: FeatureCollection<Geometry, GeoJsonProperties>
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
      abbreviation: 'And',
      feature: andromeda
    }
  ],
  [
    'Antila',
    {
      name: 'Antila',
      meaning: 'The Air Pump',
      abbreviation: 'Ant',
      feature: antila
    }
  ],
  [
    'Apus',
    {
      name: 'Apus',
      meaning: 'The Bird of Paradise',
      abbreviation: 'Aps',
      feature: apus
    }
  ],
  [
    'Aquarius',
    {
      name: 'Aquarius',
      meaning: 'The Water Bearer',
      abbreviation: 'Aqr',
      feature: aquarius
    }
  ],
  [
    'Aquila',
    {
      name: 'Aquila',
      meaning: 'The Eagle',
      abbreviation: 'Aql',
      feature: aquila
    }
  ],
  [
    'Ara',
    {
      name: 'Ara',
      meaning: 'The Altar',
      abbreviation: 'Ara',
      feature: ara
    }
  ],
  [
    'Aries',
    {
      name: 'Aries',
      meaning: 'The Ram',
      abbreviation: 'Ari',
      feature: aries
    }
  ],
  [
    'Auriga',
    {
      name: 'Auriga',
      meaning: 'The Charioteer',
      abbreviation: 'Aur',
      feature: auriga
    }
  ],
  [
    'Boötes',
    {
      name: 'Boötes',
      meaning: 'The Herdsman',
      abbreviation: 'Boo',
      feature: bootes
    }
  ],
  [
    'Caelum',
    {
      name: 'Caelum',
      meaning: 'The Chisel',
      abbreviation: 'Cae',
      feature: caelum
    }
  ],
  [
    'Camelopardalis',
    {
      name: 'Camelopardalis',
      meaning: 'The Giraffe',
      abbreviation: 'Cam',
      feature: camelopardalis
    }
  ],
  [
    'Cancer',
    {
      name: 'Cancer',
      meaning: 'The Crab',
      abbreviation: 'Cnc',
      feature: cancer
    }
  ],
  [
    'Canes Venatici',
    {
      name: 'Canes Venatici',
      meaning: 'The Hunting Dogs',
      abbreviation: 'CVn',
      feature: canesVenatici
    }
  ],
  [
    'Canis Major',
    {
      name: 'Canis Major',
      meaning: 'The Great Dog',
      abbreviation: 'CMa',
      feature: canisMajor
    }
  ],
  [
    'Canis Minor',
    {
      name: 'Canis Minor',
      meaning: 'The Lesser Dog',
      abbreviation: 'CMi',
      feature: canisMinor
    }
  ],
  [
    'Capricornus',
    {
      name: 'Capricornus',
      meaning: 'The Sea Goat',
      abbreviation: 'Cap',
      feature: capricornus
    }
  ],
  [
    'Carina',
    {
      name: 'Carina',
      meaning: 'The Keel',
      abbreviation: 'Car',
      feature: carina
    }
  ],
  [
    'Cassiopeia',
    {
      name: 'Cassiopeia',
      meaning: 'The Queen',
      abbreviation: 'Cas',
      feature: cassiopeia
    }
  ],
  [
    'Centaurus',
    {
      name: 'Centaurus',
      meaning: 'The Centaur',
      abbreviation: 'Cen',
      feature: centaurus
    }
  ],
  [
    'Cepheus',
    {
      name: 'Cepheus',
      meaning: 'The King',
      abbreviation: 'Cep',
      feature: cepheus
    }
  ],
  [
    'Cetus',
    {
      name: 'Cetus',
      meaning: 'The Whale',
      abbreviation: 'Cet',
      feature: cetus
    }
  ],
  [
    'Chamaeleon',
    {
      name: 'Chamaeleon',
      meaning: 'The Chameleon',
      abbreviation: 'Cha',
      feature: chamaeleon
    }
  ],
  [
    'Circinus',
    {
      name: 'Circinus',
      meaning: 'The Compasses',
      abbreviation: 'Cir',
      feature: circinus
    }
  ],
  [
    'Columba',
    {
      name: 'Columba',
      meaning: 'The Dove',
      abbreviation: 'Col',
      feature: columba
    }
  ],
  [
    'Coma Berenices',
    {
      name: 'Coma Berenices',
      meaning: "Berenice's Hair",
      abbreviation: 'Com',
      feature: comaBerenices
    }
  ],
  [
    'Corona Australis',
    {
      name: 'Corona Australis',
      meaning: 'The Southern Crown',
      abbreviation: 'CrA',
      feature: coronaAustralis
    }
  ],
  [
    'Corona Borealis',
    {
      name: 'Corona Borealis',
      meaning: 'The Northern Crown',
      abbreviation: 'CrB',
      feature: coronaBorealis
    }
  ],
  [
    'Corvus',
    {
      name: 'Corvus',
      meaning: 'The Crow',
      abbreviation: 'Crv',
      feature: corvus
    }
  ],
  [
    'Crater',
    {
      name: 'Crater',
      meaning: 'The Cup',
      abbreviation: 'Crt',
      feature: crater
    }
  ],
  [
    'Crux',
    {
      name: 'Crux',
      meaning: 'The Southern Cross',
      abbreviation: 'Cru',
      feature: crux
    }
  ],
  [
    'Cygnus',
    {
      name: 'Cygnus',
      meaning: 'The Swan',
      abbreviation: 'Cyg',
      feature: cygnus
    }
  ],
  [
    'Delphinus',
    {
      name: 'Delphinus',
      meaning: 'The Dolphin',
      abbreviation: 'Del',
      feature: delphinus
    }
  ],
  [
    'Dorado',
    {
      name: 'Dorado',
      meaning: 'The Swordfish',
      abbreviation: 'Dor',
      feature: dorado
    }
  ],
  [
    'Draco',
    {
      name: 'Draco',
      meaning: 'The Dragon',
      abbreviation: 'Dra',
      feature: draco
    }
  ],
  [
    'Equuleus',
    {
      name: 'Equuleus',
      meaning: 'The Little Horse',
      abbreviation: 'Equ',
      feature: equuleus
    }
  ],
  [
    'Eridanus',
    {
      name: 'Eridanus',
      meaning: 'The River',
      abbreviation: 'Eri',
      feature: eridanus
    }
  ],
  [
    'Fornax',
    {
      name: 'Fornax',
      meaning: 'The Furnace',
      abbreviation: 'For',
      feature: fornax
    }
  ],
  [
    'Gemini',
    {
      name: 'Gemini',
      meaning: 'The Twins',
      abbreviation: 'Gem',
      feature: gemini
    }
  ],
  [
    'Grus',
    {
      name: 'Grus',
      meaning: 'The Crane',
      abbreviation: 'Gru',
      feature: grus
    }
  ],
  [
    'Hercules',
    {
      name: 'Hercules',
      meaning: 'The Hero',
      abbreviation: 'Her',
      feature: hercules
    }
  ],
  [
    'Horologium',
    {
      name: 'Horologium',
      meaning: 'The Pendulum Clock',
      abbreviation: 'Hor',
      feature: horologium
    }
  ],
  [
    'Hydra',
    {
      name: 'Hydra',
      meaning: 'The Water Snake',
      abbreviation: 'Hya',
      feature: hydra
    }
  ],
  [
    'Hydrus',
    {
      name: 'Hydrus',
      meaning: 'The Water Snake',
      abbreviation: 'Hyi',
      feature: hydrus
    }
  ],
  [
    'Indus',
    {
      name: 'Indus',
      meaning: 'The Indian',
      abbreviation: 'Ind',
      feature: indus
    }
  ],
  [
    'Lacerta',
    {
      name: 'Lacerta',
      meaning: 'The Lizard',
      abbreviation: 'Lac',
      feature: lacerta
    }
  ],
  [
    'Leo',
    {
      name: 'Leo',
      meaning: 'The Lion',
      abbreviation: 'Leo',
      feature: leo
    }
  ],
  [
    'Leo Minor',
    {
      name: 'Leo Minor',
      meaning: 'The Lesser Lion',
      abbreviation: 'LMi',
      feature: leoMinor
    }
  ],
  [
    'Lepus',
    {
      name: 'Lepus',
      meaning: 'The Hare',
      abbreviation: 'Lep',
      feature: lepus
    }
  ],
  [
    'Libra',
    {
      name: 'Libra',
      meaning: 'The Scales',
      abbreviation: 'Lib',
      feature: libra
    }
  ],
  [
    'Lupus',
    {
      name: 'Lupus',
      meaning: 'The Wolf',
      abbreviation: 'Lup',
      feature: lupus
    }
  ],
  [
    'Lynx',
    {
      name: 'Lynx',
      meaning: 'The Lynx',
      abbreviation: 'Lyn',
      feature: lynx
    }
  ],
  [
    'Lyra',
    {
      name: 'Lyra',
      meaning: 'The Lyre',
      abbreviation: 'Lyr',
      feature: lyra
    }
  ],
  [
    'Mensa',
    {
      name: 'Mensa',
      meaning: 'The Table Mountain',
      abbreviation: 'Men',
      feature: mensa
    }
  ],
  [
    'Microscopium',
    {
      name: 'Microscopium',
      meaning: 'The Microscope',
      abbreviation: 'Mic',
      feature: microscopium
    }
  ],
  [
    'Monoceros',
    {
      name: 'Monoceros',
      meaning: 'The Unicorn',
      abbreviation: 'Mon',
      feature: monoceros
    }
  ],
  [
    'Musca',
    {
      name: 'Musca',
      meaning: 'The Fly',
      abbreviation: 'Mus',
      feature: musca
    }
  ],
  [
    'Norma',
    {
      name: 'Norma',
      meaning: "The Carpenter's Square",
      abbreviation: 'Nor',
      feature: norma
    }
  ],
  [
    'Octans',
    {
      name: 'Octans',
      meaning: 'The Octant',
      abbreviation: 'Oct',
      feature: octans
    }
  ],
  [
    'Ophiuchus',
    {
      name: 'Ophiuchus',
      meaning: 'The Serpent Bearer',
      abbreviation: 'Oph',
      feature: ophiuchus
    }
  ],
  [
    'Orion',
    {
      name: 'Orion',
      meaning: 'Orion the Hunter',
      abbreviation: 'Ori',
      feature: orion
    }
  ],
  [
    'Pavo',
    {
      name: 'Pavo',
      meaning: 'The Peacock',
      abbreviation: 'Pav',
      feature: pavo
    }
  ],
  [
    'Pegasus',
    {
      name: 'Pegasus',
      meaning: 'The Winged Horse',
      abbreviation: 'Peg',
      feature: pegasus
    }
  ],
  [
    'Perseus',
    {
      name: 'Perseus',
      meaning: 'Perseus',
      abbreviation: 'Per',
      feature: perseus
    }
  ],
  [
    'Phoenix',
    {
      name: 'Phoenix',
      meaning: 'The Phoenix',
      abbreviation: 'Phe',
      feature: phoenix
    }
  ],
  [
    'Pictor',
    {
      name: 'Pictor',
      meaning: "The Painter's Easel",
      abbreviation: 'Pic',
      feature: pictor
    }
  ],
  [
    'Pisces',
    {
      name: 'Pisces',
      meaning: 'The Fishes',
      abbreviation: 'Psc',
      feature: pisces
    }
  ],
  [
    'Piscis Austrinus',
    {
      name: 'Piscis Austrinus',
      meaning: 'The Southern Fish',
      abbreviation: 'PsA',
      feature: piscisAustrinus
    }
  ],
  [
    'Puppis',
    {
      name: 'Puppis',
      meaning: 'The Poop Deck',
      abbreviation: 'Pup',
      feature: puppis
    }
  ],
  [
    'Pyxis',
    {
      name: 'Pyxis',
      meaning: 'The Compass',
      abbreviation: 'Pyx',
      feature: pyxis
    }
  ],
  [
    'Reticulum',
    {
      name: 'Reticulum',
      meaning: 'The Reticle',
      abbreviation: 'Ret',
      feature: reticulum
    }
  ],
  [
    'Sagitta',
    {
      name: 'Sagitta',
      meaning: 'The Arrow',
      abbreviation: 'Sge',
      feature: sagitta
    }
  ],
  [
    'Sagittarius',
    {
      name: 'Sagittarius',
      meaning: 'The Archer',
      abbreviation: 'Sgr',
      feature: sagittarius
    }
  ],
  [
    'Scorpius',
    {
      name: 'Scorpius',
      meaning: 'The Scorpion',
      abbreviation: 'Sco',
      feature: scorpius
    }
  ],
  [
    'Sculptor',
    {
      name: 'Sculptor',
      meaning: "The Sculptor's Studio",
      abbreviation: 'Scl',
      feature: sculptor
    }
  ],
  [
    'Scutum',
    {
      name: 'Scutum',
      meaning: 'The Shield',
      abbreviation: 'Sct',
      feature: scutum
    }
  ],
  [
    'Serpens Caput',
    {
      name: 'Serpens Caput',
      meaning: "The Serpent's Head",
      abbreviation: 'SerCap',
      feature: serpensCaput
    }
  ],
  [
    'Serpens Cauda',
    {
      name: 'Serpens Cauda',
      meaning: "The Serpent's Tail",
      abbreviation: 'SerCad',
      feature: serpensCauda
    }
  ],
  [
    'Sextans',
    {
      name: 'Sextans',
      meaning: 'The Sextant',
      abbreviation: 'Sex',
      feature: sextans
    }
  ],
  [
    'Taurus',
    {
      name: 'Taurus',
      meaning: 'The Bull',
      abbreviation: 'Tau',
      feature: taurus
    }
  ],
  [
    'Telescopium',
    {
      name: 'Telescopium',
      meaning: 'The Telescope',
      abbreviation: 'Tel',
      feature: telescopium
    }
  ],
  [
    'Triangulum',
    {
      name: 'Triangulum',
      meaning: 'The Triangle',
      abbreviation: 'Tri',
      feature: triangulum
    }
  ],
  [
    'Triangulum Australe',
    {
      name: 'Triangulum Australe',
      meaning: 'The Southern Triangle',
      abbreviation: 'TrA',
      feature: triangulumAustralae
    }
  ],
  [
    'Tucana',
    {
      name: 'Tucana',
      meaning: 'The Toucan',
      abbreviation: 'Tuc',
      feature: tucana
    }
  ],
  [
    'Ursa Major',
    {
      name: 'Ursa Major',
      meaning: 'The Great Bear',
      abbreviation: 'UMa',
      feature: ursaMajor
    }
  ],
  [
    'Ursa Minor',
    {
      name: 'Ursa Minor',
      meaning: 'The Little Bear',
      abbreviation: 'UMi',
      feature: ursaMinor
    }
  ],
  [
    'Vela',
    {
      name: 'Vela',
      meaning: 'The Sails',
      abbreviation: 'Vel',
      feature: vela
    }
  ],
  [
    'Virgo',
    {
      name: 'Virgo',
      meaning: 'The Virgin',
      abbreviation: 'Vir',
      feature: virgo
    }
  ],
  [
    'Volans',
    {
      name: 'Volans',
      meaning: 'The Flying Fish',
      abbreviation: 'Vol',
      feature: volans
    }
  ],
  [
    'Vulpecula',
    {
      name: 'Vulpecula',
      meaning: 'The Little Fox',
      abbreviation: 'Vul',
      feature: vulpecula
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
