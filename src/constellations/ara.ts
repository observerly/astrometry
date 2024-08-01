/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/ara
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 262.9605,
  dec: -49.875972
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // α Arae to β Arae:
  [
    [262.960500, -49.875972],
    [261.325000, -55.529833]
  ],
  // β Arae to γ Arae:
  [
    [261.325000, -55.529833],
    [261.348583, -56.377694]
  ],
  // γ Arae to δ Arae:
  [
    [261.348583, -56.377694],
    [262.774917, -60.683611]
  ],
  // δ Arae to η Arae:
  [
    [262.774917, -60.683611],
    [252.446292, -59.041306]
  ],
  // η Arae to ζ Arae:
  [
    [252.446292, -59.041306],
    [254.655125, -55.990056]
  ],
  // ζ Arae to ε¹ Arae:
  [
    [254.655125, -55.990056],
    [254.896042, -53.160500]
  ],
  // ε¹ Arae to α Arae
  [
    [254.896042, -53.160500],
    [262.960500, -49.875972]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [249.034681, -60.264458],
    [248.570624, -45.767052],
    [269.809284, -45.516346],
    [272.309017, -45.485973],
    [272.672253, -56.983772],
    [265.16819, -57.074776],
    [265.775729, -67.571106],
    [258.242482, -67.661087],
    [255.724983, -67.690582],
    [255.542393, -65.191643],
    [254.283515, -65.206253],
    [254.195137, -63.790093],
    [251.676321, -63.818996],
    [251.537847, -61.236458],
    [249.081630, -61.264195],
    [249.034681, -60.264458]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#ara
export const ara = createConstellationAsGeoJSON('Ara', 'the Altar', centrum, aster, boundary)

/*****************************************************************************************************************/
