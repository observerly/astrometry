/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/lyra
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 281.805206,
  dec: 36.773751
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Vega to ε¹ Lyrae:
  [
    [279.234735, 38.783689],
    [281.084583, 39.671111]
  ],
  // ε¹ Lyrae to ζ¹ Lyrae:
  [
    [281.084583, 39.671111],
    [281.193083, 37.605056]
  ],
  // ζ¹ Lyrae to Vega:
  [
    [281.193083, 37.605056],
    [279.234735, 38.783689]
  ],
  // ζ¹ Lyrae to δ¹ Lyrae:
  [
    [281.193083, 37.605056],
    [283.431500, 36.971722]
  ],
  // δ¹ Lyrae to Sulafat:
  [
    [283.431500, 36.971722],
    [284.735928, 32.689557]
  ],
  // Sulafat to β Lyrae:
  [
    [284.735928, 32.689557],
    [282.505000, 33.357222]
  ],
  // β Lyrae to ζ¹ Lyrae:
  [
    [282.505000, 33.357222],
    [281.193083, 37.605056]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [284.277162, 25.664141],
    [284.269867, 26.164097],
    [276.762886, 26.074350],
    [276.700773, 30.073977],
    [273.824386, 30.039156],
    [273.466874, 47.536987],
    [274.342375, 47.547604],
    [287.120648, 47.699867],
    [288.375520, 47.714394],
    [288.470307, 43.714939],
    [291.983527, 43.755035],
    [292.119655, 36.755802],
    [291.492605, 36.748714],
    [291.598778, 30.249315],
    [290.095253, 30.232197],
    [290.132646, 27.732408],
    [290.161314, 25.732574],
    [284.277162, 25.664141]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#lyr
export const lyra = createConstellationAsGeoJSON(
  'Lyra',
  'the harp (lyre)',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/