/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/capricornus
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 304.513566,
  dec: -12.544852
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Algedi to Dabih:
  [
    [304.513566, -12.544852],
    [305.252803, -14.781405]
  ],
  // Dabih to ψ Capricorni:
  [
    [305.252803, -14.781405],
    [311.524042, -25.270528]
  ],
  // ψ Capricorni to ω Capricorni:
  [
    [311.524042, -25.270528],
    [312.955417, -26.919139]
  ],
  // ω Capricorni to ζ Capricorni:
  [
    [312.955417, -26.919139],
    [321.666792, -22.411389]
  ],
  // ζ Capricorni to ε Capricorni:
  [
    [321.666792, -22.411389],
    [324.270083, -19.466000]
  ],
  // ε Capricorni to Deneb Algedi:
  [
    [324.270083, -19.466000],
    [326.760184, -16.127287]
  ],
  // Deneb Algedi to Nashira:
  [
    [326.760184, -16.127287],
    [325.022735, -16.662308]
  ],
  // Nashira to ι Capricorni:
  [
    [325.022735, -16.662308],
    [320.561583, -16.834556]
  ],
  // ι Capricorni to θ Capricorni:
  [
    [320.561583, -16.834556],
    [316.486583, -17.232722]
  ],
  // θ Capricorni to Algedi:
  [
    [316.486583, -17.232722],
    [304.513566, -12.544852]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [309.684648, -8.563417],
    [301.693696, -8.643075],
    [301.726370, -11.676234],
    [301.915970, -27.641914],
    [306.897955, -27.591339],
    [321.831636, -27.459667],
    [321.807775, -24.959761],
    [329.770289, -24.904041],
    [329.656162, -8.404400],
    [321.668415, -8.460295],
    [321.716451, -14.460111],
    [309.743901, -14.563136],
    [309.684648, -8.563417]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cap
export const capricornus = createConstellationAsGeoJSON(
  'Capricornus',
  'the horned goat',
  centrum,
  aster,
  boundary
)

/*****************************************************************************************************************/
