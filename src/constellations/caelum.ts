/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/caelum
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 70.140917,
  dec: -41.863583
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // α Caeli to β Caeli:
  [
    [70.140917, -41.863583],
    [70.514375, -37.144778]
  ],
  // β Caeli to γ Caeli:
  [
    [70.514375, -37.144778],
    [76.101292, -35.482861]
  ],
  // α Caeli to δ Caeli:
  [
    [70.140917, -41.863583],
    [67.708750, -44.953750]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [65.076413, -39.700729],
    [64.882386, -48.699665],
    [68.362248, -48.738449],
    [68.424096, -46.238796],
    [73.402083, -46.295902],
    [73.482370, -42.796368],
    [75.974444, -42.825550],
    [76.254937, -27.077204],
    [73.759296, -27.047979],
    [71.763331, -27.024877],
    [71.722419, -29.774643],
    [69.976651, -29.754660],
    [69.862375, -36.754005],
    [65.129850, -36.701023],
    [65.076413, -39.700729]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cae
export const caelum = createConstellationAsGeoJSON('Caelum', 'the chisel', centrum, aster, boundary)

/*****************************************************************************************************************/
