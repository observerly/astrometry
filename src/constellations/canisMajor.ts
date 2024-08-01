/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/canisMajor
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 101.287155,
  dec: -16.716116
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Sirius to Mirzam:
  [
    [101.287155, -16.716116],
    [95.674939, -17.955919]
  ],
  // Sirius to ι Canis Majoris:
  [
    [101.287155, -16.716116],
    [104.034292, -17.054250]
  ],
  // ι Canis Majoris to Muliphein:
  [
    [104.034292, -17.054250],
    [105.939554, -15.633286]
  ],
  // ι Canis Majoris to θ Canis Majoris:
  [
    [104.034292, -17.054250],
    [103.547833, -12.038583]
  ],
  // Muliphein to θ Canis Majoris:
  [
    [105.939554, -15.633286],
    [103.547833, -12.038583]
  ],
  // Mirzam to ν² Canis Majoris:
  [
    [95.674939, -17.955919],
    [99.170833, -19.255722]
  ],
  // ν² Canis Majoris to ο¹ Canis Majoris:
  [
    [99.170833, -19.255722],
    [103.533125, -24.184222]
  ],
  // ο¹ Canis Majoris to Adhara:
  [
    [103.533125, -24.184222],
    [104.656453, -28.972086]
  ],
  // Adhara to Wezen:
  [
    [104.656453, -28.972086],
    [107.097850, -26.393200]
  ],
  // Wezen to Sirius:
  [
    [107.097850, -26.393200],
    [101.287155, -16.716116]
  ],
  // Wezen to Aludra:
  [
    [107.097850, -26.393200],
    [111.023760, -29.303106]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [93.215625, -11.030153],
    [111.973400, -11.252145],
    [111.677199, -33.250469],
    [99.903860, -33.112816],
    [92.899068, -33.028233],
    [92.992566, -27.278799],
    [93.215625, -11.030153]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cma
export const canisMajor = createConstellationAsGeoJSON(
  'Canis Major',
  'the greater dog',
  centrum,
  aster,
  boundary
)

/*****************************************************************************************************************/