/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/andromeda
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 5.957586,
  dec: 32.1326
}

/*****************************************************************************************************************/

// prettier-ignore
const aster = [
  // Almach to Mirach:
  [
    [30.974804, 42.329725],
    [17.433013, 35.620557]
  ],
  // Mirach to δ Andromedae:
  [
    [17.433013, 35.620557],
    [9.831667, 30.861222]
  ],
  // Mirach to π Andromedae:
  [
    [17.433013, 35.620557],
    [9.220167, 33.719361]
  ],
  // δ Andromedae to Alpheratz:
  [
    [9.831667, 30.861222],
    [2.096916, 29.090431]
  ],
  // δ Andromedae to π Andromedae:
  [
    [9.831667, 30.861222],
    [9.220167, 33.719361]
  ],
  // Mirach to μ Andromedae:
  [
    [17.433013, 35.620557],
    [14.187917, 38.499250]
  ],
  // μ Andromedae to ν Andromedae:
  [
    [14.187917, 38.499250],
    [12.453458, 41.078944]
  ],
  // ν Andromedae to φ Andromedae:
  [
    [12.453458, 41.078944],
    [17.375500, 47.241833]
  ],
  // φ Andromedae to Nembus:
  [
    [17.375500, 47.241833],
    [24.498154, 48.628214]
  ],
  // δ Andromedae to ε Andromedae:
  [
    [9.831667, 30.861222],
    [9.639583, 29.312361]
  ],
  // ε Andromedae to ζ Andromedae:
  [
    [9.6395830, 29.312361],
    [11.834958, 24.267389]
  ],
  // ζ Andromedae to η Andromedae:
  [
    [11.834958, 24.267389],
    [14.301792, 23.417750]
  ],
  // π Andromedae to ι Andromedae:
  [
    [9.2201600, 33.719361],
    [354.534083, 43.268083]
  ],
  // ι Andromedae to κ Andromedae:
  [
    [354.534083, 43.268083],
    [355.101833, 44.333972]
  ],
  // κ Andromedae to λ Andromedae:
  [
    [355.101833, 44.333972],
    [354.390458, 46.459167]
  ],
  // ι Andromedae to ο Andromedae:
  [
    [354.534083, 43.268083],
    [345.480208, 42.325972]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundary: number[][][] = [
  [
    [344.4653038, 35.1682358],
    [344.3428513, 53.1680298],
    [351.4528938, 53.1870041],
    [351.4656825, 50.6870193],
    [355.2705571, 50.6929131],
    [355.2760788, 48.6929169],
    [4.146367500, 48.6949348],
    [4.143278750, 46.6949348],
    [14.77607708, 46.6757545],
    [14.78886750, 48.6757393],
    [18.58840792, 48.6632690],
    [18.60590375, 50.6632347],
    [22.40793625, 50.6478767],
    [26.96852375, 50.6257439],
    [26.93143958, 47.6258430],
    [32.62149125, 47.5927505],
    [32.67380125, 51.0925827],
    [39.88547875, 51.0423737],
    [39.67934125, 37.2931557],
    [31.87109125, 37.3470840],
    [31.85425042, 35.5971375],
    [22.91083500, 35.6453362],
    [22.89742625, 33.6453705],
    [12.44306375, 33.6818962],
    [12.41349125, 24.4319324],
    [14.42406458, 24.4266243],
    [14.41481542, 21.6766376],
    [3.739921250, 21.6951923],
    [3.740644580, 22.6951923],
    [2.610016250, 22.6957588],
    [2.612842500, 28.6957588],
    [1.606216250, 28.6960354],
    [1.606977083, 32.0293655],
    [357.8287413, 32.0285034],
    [357.8280825, 32.7785072],
    [354.0491580, 32.7746468],
    [354.0441796, 35.1913109],
    [344.4653038, 35.1682358]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#and
export const andromeda = createConstellationAsGeoJSON(
  'Andromeda',
  'The Chained Princess',
  centrum,
  aster,
  boundary
)

/*****************************************************************************************************************/
