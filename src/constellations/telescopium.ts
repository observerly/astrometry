/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/telescopium
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 283.650222,
  dec: -47.997898
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // ε Telescopii to α Telescopii:
  [
    [272.807417, -45.954333],
    [276.743458, -45.968333]
  ],
  // α Telescopii to ζ Telescopii:
  [
    [276.743458, -45.968333],
    [277.207250, -49.070028]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [307.458801, -56.588577],
    [307.169295, -45.090000],
    [289.769640, -45.277565],
    [272.309017, -45.485973],
    [272.672253, -56.983772],
    [307.458801, -56.588577]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#tel
export const telescopium = createConstellationAsGeoJSON(
  'Telescopium',
  'the telescope',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
