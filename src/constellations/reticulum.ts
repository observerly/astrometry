/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/reticulum
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 58.818737,
  dec: -60.774595
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // α Reticuli to β Reticuli:
  [
    [63.605958, -62.473972],
    [56.048125, -64.807083]
  ],
  // β Reticuli to δ Reticuli:
  [
    [56.048125, -64.807083],
    [59.686417, -61.400139]
  ],
  // δ Reticuli to ε Reticuli:
  [
    [59.686417, -61.400139],
    [64.121167, -59.301750]
  ],
  // ε Reticuli to α Reticuli:
  [
    [64.121167, -59.301750],
    [63.605958, -62.473972]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [48.362690, -67.035820],
    [68.794019, -67.247925],
    [69.274535, -58.750664],
    [65.554590, -58.708855],
    [65.650462, -56.209385],
    [60.692919, -56.155586],
    [60.797896, -52.822811],
    [58.318788, -52.796844],
    [53.365002, -52.747078],
    [53.236816, -57.079784],
    [48.791131, -57.037785],
    [48.362690, -67.035820]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#ret
export const reticulum = createConstellationAsGeoJSON(
  'Reticulum',
  'an eyepiece graticule',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
