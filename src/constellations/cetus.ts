/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/cetus
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 29.091667,
  dec: -8.328889
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Menkar to λ Ceti
  [
    [45.569885, 4.089737],
    [44.928750, 8.907389]
  ],
  // λ Ceti to μ Ceti
  [
    [44.928750, 8.907389],
    [41.234875, 10.114222]
  ],
  // μ Ceti to ν Ceti
  [
    [41.234875, 10.114222],
    [38.968708, 5.593306]
  ],
  // ν Ceti to Kaffaljidhma
  [
    [38.968708, 5.593306],
    [40.825163, 3.235816]
  ],
  // Kaffaljidhma to Menkar
  [
    [40.825163, 3.235816],
    [45.569885, 4.089737]
  ],
  // Kaffaljidhma to δ Ceti
  [
    [40.825163, 3.235816],
    [39.870625, 0.328528]
  ],
  // δ Ceti to Mira
  [
    [39.870625, 0.328528],
    [34.836617, -2.977640]
  ],
  // Mira to Baten Kaitos
  [
    [34.836617, -2.977640],
    [27.865137, -10.335044]
  ],
  // Baten Kaitos to τ Ceti
  [
    [27.865137, -10.335044],
    [26.021375, -15.939556]
  ],
  // τ Ceti to Diphda
  [
    [26.021375, -15.939556],
    [10.897379, -17.986606]
  ],
  // Diphda to ι Ceti
  [
    [10.897379, -17.986606],
    [4.857000, -8.823833]
  ],
  // ι Ceti to η Ceti
  [
    [4.857000, -8.823833],
    [17.146917, -10.181917]
  ],
  // η Ceti to θ Ceti
  [
    [17.146917, -10.181917],
    [21.006042, -8.182750]
  ],
  // θ Ceti to Baten Kaitos
  [
    [21.006042, -8.182750],
    [27.865137, -10.335044]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [6.601329, 0.692540],
    [6.603788, 2.692538],
    [31.615266, 2.597881],
    [31.665248, 10.514395],
    [50.946411, 10.363207],
    [50.852984, 0.446972],
    [50.836683, -1.302952],
    [41.339221, -1.221027],
    [41.148759, -23.853603],
    [26.465999, -23.756258],
    [26.458889, -24.872909],
    [359.110565, -24.804201],
    [359.103299, -6.304202],
    [6.592702, -6.307455],
    [6.601329, 0.692540]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cet
export const cetus = createConstellationAsGeoJSON('Cetus', 'the whale', centrum, aster, boundaries)

/*****************************************************************************************************************/
