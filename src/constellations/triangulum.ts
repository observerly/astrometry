/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/triangulum
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 30.328817,
  dec: 32.137849
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Mothallahto β Trianguli:
  [
    [28.270450, 29.578826],
    [32.385500, 34.987389]
  ],
  // β Trianguli to γ Trianguli:
  [
    [32.385500, 34.987389],
    [34.328500, 33.847333]
  ],
  // γ Trianguli to Mothallah:
  [
    [34.328500, 33.847333],
    [28.270450, 29.578826]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [26.744675, 25.626335],
    [26.764710, 28.626282],
    [22.866420, 28.645439],
    [22.897426, 33.645370],
    [22.910835, 35.645336],
    [31.854250, 35.597138],
    [31.871091, 37.347084],
    [39.679341, 37.293156],
    [40.434659, 37.287388],
    [40.402383, 34.537514],
    [42.666468, 34.519676],
    [42.628380, 31.186502],
    [38.103194, 31.221315],
    [38.070149, 27.804764],
    [30.530616, 27.855019],
    [30.513711, 25.605070],
    [26.744675, 25.626335]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#tri
export const triangulum = createConstellationAsGeoJSON(
  'Triangulum',
  'the triangle',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
