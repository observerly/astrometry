/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tucana
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 350.4512756,
  dec: -64.5226708
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // α Tucanae to γ Tucanae:
  [
    [334.625750, -60.259500],
    [349.357542, -58.235917]
  ],
  // γ Tucanae to β¹ Tucanae:
  [
    [349.357542, -58.235917],
    [7.885667, -62.958083]
  ],
  // β¹ Tucanae to ζ Tucanae:
  [
    [7.885667, -62.958083],
    [5.007958, -64.877611]
  ],
  // ζ Tucanae to ε Tucanae:
  [
    [5.007958, -64.877611],
    [359.978792, -65.577083]
  ],
  // ε Tucanae to δ Tucanae:
  [
    [359.978792, -65.577083],
    [336.832792, -64.966389]
  ],
  // δ Tucanae to α Tucanae:
  [
    [336.832792, -64.966389],
    [334.625750, -60.259500]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [351.997833, -74.312462],
    [1.566297, -74.303963],
    [12.332438, -74.318573],
    [12.295415, -75.318527],
    [20.654050, -75.347221],
    [21.206229, -57.848415],
    [351.778394, -57.812679],
    [351.768522, -56.312687],
    [332.113695, -56.390835],
    [332.398568, -66.889992],
    [351.861391, -66.812599],
    [351.997833, -74.312462]
  ]
]

/*****************************************************************************************************************/

export const tucana = createConstellationAsGeoJSON(
  'Tucana',
  'the tucan',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
