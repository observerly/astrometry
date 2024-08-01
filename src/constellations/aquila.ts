/*****************************************************************************************************************/

// @author         Michael Roberts
// @package        @observerly/astrometry/aquila
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 297.695827,
  dec: 8.868321
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Alshain to Altair:
  [
    [298.828304, 6.406763],
    [297.695827, 8.868321]
  ],
  // Altair to Tarazed:
  [
    [297.695827, 8.868321],
    [296.564915, 10.613262]
  ],
  // Altair to δ Aquilae:
  [
    [297.695827, 8.868321],
    [291.373958, 3.114583]
  ],
  // δ Aquilae to Okab:
  [
    [291.373958, 3.114583],
    [286.352533, 13.863477]
  ],
  // Okab to ε Aquilae:
  [
    [286.352533, 13.863477],
    [284.905792, 15.068472]
  ],
  // δ Aquilae to η Aquilae:
  [
    [291.373958, 3.114583],
    [298.118167, 1.005667]
  ],
  // η Aquilae to θ Aquilae:
  [
    [298.118167, 1.005667],
    [302.826083, -0.821472]
  ],
  // θ Aquilae to ι Aquilae:
  [
    [302.826083, -0.821472],
    [294.180333, -1.286556]
  ],
  // ι Aquilae to λ Aquilae:
  [
    [294.180333, -1.286556],
    [286.562292, -4.882333]
  ],
  // δ Aquilae to λ Aquilae:
  [
    [291.373958, 3.114583],
    [286.562292, -4.882333]
  ],
  // λ Aquilae to Okab:
  [
    [286.562292, -4.882333],
    [286.352533, 13.863477]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [280.350209, 0.115489],
    [280.326233, 2.115346],
    [284.576425, 2.165905],
    [284.525985, 6.415608],
    [281.458569, 6.379194],
    [281.388045, 12.128774],
    [284.456262, 12.165196],
    [284.373636, 18.664709],
    [286.375494, 18.688223],
    [286.405477, 16.355068],
    [298.921165, 16.495729],
    [298.926000, 16.079084],
    [303.558998, 16.127516],
    [303.636675, 8.877912],
    [306.013956, 8.901824],
    [306.079101, 2.402147],
    [309.579877, 2.436087],
    [309.598846, 0.436177],
    [309.684648, -8.563417],
    [301.693696, -8.643075],
    [301.726370, -11.676234],
    [284.744054, -11.866436],
    [284.647293, -3.833677],
    [280.398188, -3.884223],
    [280.350209, 0.115489]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#aql
export const aquila = createConstellationAsGeoJSON('Aquila', 'the eagle', centrum, aster, boundary)

/*****************************************************************************************************************/