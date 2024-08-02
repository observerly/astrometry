/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/coronaAustralis
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 278.0,
  dec: -39.0
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // γ Coronae Australis to Meridiana:
  [
    [286.604333, -37.062750],
    [287.368087, -37.904473]
  ],
  // Meridiana to β Coronae Australis:
  [
    [287.368087, -37.904473],
    [287.507292, -39.340694]
  ],
  // β Coronae Australis to δ Coronae Australis:
  [
    [287.507292, -39.340694],
    [287.087208, -40.496639]
  ],
  // δ Coronae Australis to θ Coronae Australis:
  [
    [287.087208, -40.496639],
    [278.375667, -42.312472]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [269.625464, -37.017460],
    [289.596320, -36.778565],
    [289.769640, -45.277565],
    [272.309017, -45.485973],
    [269.809284, -45.516346],
    [269.625464, -37.017460]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cra
export const coronaAustralis = createConstellationAsGeoJSON(
  'Corona Australis',
  'southern crown',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
