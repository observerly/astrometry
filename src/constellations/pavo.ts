/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/pavo
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 295.428238,
  dec: -66.964093
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Peacock to γ Pavonis:
  [
    [306.411904, -56.735090],
    [321.610375, -65.368139]
  ],
  // γ Pavonis to β Pavonis:
  [
    [321.610375, -65.368139],
    [311.239833, -66.203250]
  ],
  // β Pavonis to δ Pavonis:
  [
    [311.239833, -66.203250],
    [302.174417, -66.179333]
  ],
  // δ Pavonis to Peacock:
  [
    [302.174417, -66.179333],
    [306.411904, -56.735090]
  ],
  // δ Pavonis to ε Pavonis:
  [
    [302.174417, -66.179333],
    [300.147458, -72.910194]
  ],
  // δ Pavonis to ζ Pavonis:
  [
    [302.174417, -66.179333],
    [280.758875, -71.427722]
  ],
  // δ Pavonis to λ Pavonis:
  [
    [302.174417, -66.179333],
    [283.054333, -62.187556]
  ],
  // δ Pavonis to κ Pavonis:
  [
    [302.174417, -66.179333],
    [284.237667, -67.233528]
  ],
  // λ Pavonis to ξ Pavonis:
  [
    [283.054333, -62.187556],
    [275.806750, -61.493917]
  ],
  // ξ Pavonis to π Pavonis:
  [
    [275.806750, -61.493917],
    [272.144958, -63.668056]
  ],
  // κ Pavonis to π Pavonis:
  [
    [284.237667, -67.233528],
    [272.144958, -63.668056]
  ],
  // π Pavonis to η Pavonis:
  [
    [272.144958, -63.668056],
    [266.433333, -64.723722]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [274.195060, -74.974518],
    [323.184757, -74.454468],
    [322.348651, -59.457684],
    [307.564801, -59.588055],
    [307.458801, -56.588577],
    [272.672253, -56.983772],
    [265.168190, -57.074776],
    [265.775729, -67.571106],
    [273.280077, -67.480080],
    [274.195060, -74.974518]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#pav
export const pavo = createConstellationAsGeoJSON('Pavo', 'the peacock', centrum, aster, boundaries)

/*****************************************************************************************************************/
