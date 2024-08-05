/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/horologium
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 52.5684,
  dec: -51.3962
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // α Horologii to ι Horologii:
  [
    [63.500333, -42.293861],
    [40.638167, -50.800833]
  ],
  // ι Horologii to η Horologii:
  [
    [40.638167, -50.800833],
    [39.351083, -52.543083]
  ],
  // η Horologii to ζ Horologii:
  [
    [39.351083, -52.543083],
    [40.164917, -54.549917]
  ],
  // ζ Horologii to μ Horologii:
  [
    [40.164917, -54.549917],
    [45.903750, -59.737611]
  ],
  // μ Horologii to β Horologii:
  [
    [45.903750, -59.737611],
    [44.699042, -64.071306]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [65.076413, -39.700729],
    [64.882386, -48.699665],
    [62.149908, -48.669972],
    [62.098640, -50.669701],
    [58.377166, -50.630478],
    [58.318788, -52.796844],
    [53.365002, -52.747078],
    [53.236816, -57.079784],
    [48.791131, -57.037785],
    [48.362690, -67.035820],
    [33.202360, -66.915192],
    [33.489425, -57.916157],
    [33.584144, -53.416470],
    [37.283346, -53.442356],
    [37.341210, -50.442570],
    [41.047694, -50.470860],
    [41.085309, -48.471004],
    [46.034514, -48.512234],
    [46.090771, -45.512478],
    [52.289003, -45.569221],
    [52.326773, -43.569405],
    [59.031365, -43.636440],
    [59.105885, -39.636826],
    [65.076413, -39.700729]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#hor
export const horologium = createConstellationAsGeoJSON(
  'Horologium',
  'a clock with a pendulum',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/