/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/auriga
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 79.172328,
  dec: 45.997991
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Capella to Saclateni:
  [
    [79.172328, 45.997991],
    [75.619531, 41.075839]
  ],
  // Saclateni to Hassaleh:
  [
    [75.619531, 41.075839],
    [74.248421, 33.166100]
  ],
  // Hassaleh to Elnath:
  [
    [74.248421, 33.166100],
    [81.572971, 28.607452]
  ],
  // Elnath to Mahasim:
  [
    [81.572971, 28.607452],
    [89.930292, 37.212585]
  ],
  // Mahasim to Menkalinan:
  [
    [89.930292, 37.212585],
    [89.882179, 44.947433]
  ],
  // Menkalinan to Capella:
  [
    [89.882179, 44.947433],
    [79.172328, 45.997991]
  ]
];

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [69.486938, 30.921875],
    [69.573841, 36.254715],
    [72.457344, 36.221851],
    [72.840285, 52.719647],
    [77.484762, 52.665554],
    [77.606765, 56.164833],
    [94.131089, 55.965809],
    [94.057366, 53.966255],
    [100.046031, 53.893829],
    [99.919460, 49.894588],
    [104.406359, 49.841003],
    [104.265303, 44.341839],
    [112.734125, 44.243549],
    [112.560719, 35.244530],
    [100.090276, 35.390564],
    [99.965658, 27.891312],
    [90.221071, 28.009291],
    [90.228903, 28.509243],
    [73.212475, 28.712440],
    [73.235343, 30.212309],
    [69.476789, 30.255260]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#aur
export const auriga = createConstellationAsGeoJSON(
  'Auriga',
  'the charioteer',
  centrum,
  aster,
  boundary
)

/*****************************************************************************************************************/
