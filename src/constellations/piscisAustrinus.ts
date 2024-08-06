/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/piscisAustrinus
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { createConstellationAsGeoJSON } from './create'

import type { EquatorialCoordinate } from '../common'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 334.23952,
  dec: -30.594519
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Fomalhaut to δ Piscis Austrini:
  [
    [344.412693, -29.622237],
    [343.987042, -32.539694]
  ],
  // δ Piscis Austrini to γ Piscis Austrini:
  [
    [343.987042, -32.539694],
    [343.131500, -32.875444]
  ],
  // γ Piscis Austrini to β Piscis Austrini:
  [
    [343.131500, -32.875444],
    [337.876208, -32.346028]
  ],
  // β Piscis Austrini to μ Piscis Austrini:
  [
    [337.876208, -32.346028],
    [332.095625, -32.988389]
  ],
  // μ Piscis Austrini to ι Piscis Austrini:
  [
    [332.095625, -32.988389],
    [326.236625, -33.025556]
  ],
  // ι Piscis Austrini to θ Piscis Austrini:
  [
    [326.236625, -33.025556],
    [326.934042, -30.898306]
  ],
  // θ Piscis Austrini to μ Piscis Austrini:
  [
    [326.934042, -30.898306],
    [332.095625, -32.988389]
  ],
  // μ Piscis Austrini to ε Piscis Austrini:
  [
    [332.095625, -32.988389],
    [340.163875, -27.043611]
  ],
  // ε Piscis Austrini to Fomalhaut:
  [
    [340.163875, -27.043611],
    [344.412693, -29.622237]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [346.680966, -24.825045],
    [329.770289, -24.904041],
    [321.807775, -24.959761],
    [321.831636, -27.459667],
    [321.928053, -36.459297],
    [346.727514, -36.324974],
    [346.680966, -24.825045],
    [346.680966, -24.825045]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#pav
export const piscisAustrinus = createConstellationAsGeoJSON(
  'Piscis Austrinus',
  'the southern fish',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
