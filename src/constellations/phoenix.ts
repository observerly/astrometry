/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/phoenix
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { createConstellationAsGeoJSON } from './create'

import type { EquatorialCoordinate } from '../common'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 13.23505,
  dec: -47.585609
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Ankaa to β Phoenicis:
  [
    [6.570939, -42.306084],
    [16.521292, -46.718500]
  ],
  // β Phoenicis to γ Phoenicis:
  [
    [16.521292, -46.718500],
    [22.091417, -43.317722]
  ],
  // γ Phoenicis to δ Phoenicis:
  [
    [22.091417, -43.317722],
    [22.812417, -49.073083]
  ],
  // δ Phoenicis to Wurren:
  [
    [22.812417, -49.073083],
    [17.096173, -55.245758]
  ],
  // Wurren to β Phoenicis:
  [
    [17.096173, -55.245758],
    [16.521292, -46.718500]
  ],
  // β Phoenicis to ε Phoenicis:
  [
    [16.521292, -46.718500],
    [2.352250, -45.747000]
  ],
  // ε Phoenicis to Ankaa:
  [
    [2.352250, -45.747000],
    [6.570939, -42.306084]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [351.692705, -39.312759],
    [351.768522, -56.312687],
    [351.778394, -57.812679],
    [21.206229, -57.848415],
    [21.273263, -52.848560],
    [24.967355, -52.865856],
    [24.993847, -50.865921],
    [28.693257, -50.885922],
    [28.738323, -47.552723],
    [36.152948, -47.600494],
    [36.264014, -39.434216],
    [26.350728, -39.372623],
    [351.692705, -39.312759]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#pho
export const phoenix = createConstellationAsGeoJSON(
  'Phoenix',
  'Phoenix (mythological immortal bird)',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
