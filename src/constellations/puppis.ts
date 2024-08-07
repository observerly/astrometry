/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/puppis
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 112.365076,
  dec: -32.176715
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Naos to Tureis:
  [
    [120.896031, -40.003148],
    [121.886037, -24.304324]
  ],
  // Tureis to Azmidi:
  [
    [121.886037, -24.304324],
    [117.323563, -24.859786]
  ],
  // Azmidi to κ¹ Puppis:
  [
    [117.323563, -24.859786],
    [114.707833, -26.803889]
  ],
  // Azmidi to l Puppis:
  [
    [117.323563, -24.859786],
    [115.951958, -28.954833]
  ],
  // κ¹ Puppis to p Puppis:
  [
    [114.707833, -26.803889],
    [113.845583, -28.369278]
  ],
  // l Puppis to p Puppis:
  [
    [115.951958, -28.954833],
    [113.845583, -28.369278]
  ],
  // p Puppis to π Puppis:
  [
    [113.845583, -28.369278],
    [109.285667, -37.097500]
  ],
  // π Puppis to ν Puppis:
  [
    [109.285667, -37.097500],
    [99.440292, -43.195917]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [111.973400, -11.252145],
    [111.677199, -33.250469],
    [99.903860, -33.112816],
    [99.708916, -43.111649],
    [90.951777, -43.005779],
    [90.748902, -50.754547],
    [120.861698, -51.102585],
    [121.038279, -43.353504],
    [126.572313, -43.409519],
    [126.677799, -37.160038],
    [126.927095, -17.411257],
    [126.989780, -11.411565],
    [122.734179, -11.368799],
    [111.973400, -11.252145]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#pav
export const puppis = createConstellationAsGeoJSON(
  'Puppis',
  "a ship's poop deck",
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/