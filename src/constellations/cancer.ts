/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/cancer
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 131.666667,
  dec: 28.765167
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // ι Cancri to Asellus Borealis:
  [
    [131.666667, 28.765167],
    [130.821442, 21.468501]
  ],
  // Asellus Borealis to Asellus Australis:
  [
    [130.821442, 21.468501],
    [131.171248, 18.154309]
  ],
  // Asellus Australis to Acubens:
  [
    [131.171248, 18.154309],
    [134.621761, 11.857700]
  ],
  // Asellus Australis to Tarf:
  [
    [131.171248, 18.154309],
    [124.128838, 9.185544]
  ]
];

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [140.404259, 6.470069],
    [122.921391, 6.630238],
    [120.548343, 6.654985],
    [120.580672, 9.654814],
    [118.832489, 9.673426],
    [118.871605, 13.173217],
    [118.947545, 19.672808],
    [120.070124, 19.660820],
    [120.171646, 27.660282],
    [121.915970, 27.641914],
    [121.993231, 33.141514],
    [140.645985, 32.969116],
    [140.404259, 6.470069]
  ]
];

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cns
export const cancer = createConstellationAsGeoJSON('Cancer', 'the crab', centrum, aster, boundary)

/*****************************************************************************************************************/
