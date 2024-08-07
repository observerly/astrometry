/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sagitta
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 294.751863,
  dec: 19.005649
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // γ Sagittae to δ Sagittae:
  [
    [299.689125, 19.492083],
    [296.846250, 18.533611]
  ],
  // δ Sagittae to Sham:
  [
    [296.846250, 18.533611],
    [295.024133, 18.013891]
  ],
  // δ Sagittae to β Sagittae:
  [
    [296.846250, 18.533611],
    [295.262208, 17.476111]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [284.373636, 18.664709],
    [284.339133, 21.247835],
    [290.096311, 21.314816],
    [290.121288, 19.398298],
    [298.885689, 19.495539],
    [298.860255, 21.578733],
    [305.125409, 21.643656],
    [305.134049, 20.893700],
    [305.186949, 16.143963],
    [303.558998, 16.127516],
    [298.926000, 16.079084],
    [298.921165, 16.495729],
    [286.405477, 16.355068],
    [286.375494, 18.688223],
    [284.373636, 18.664709]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#sag
export const sagitta = createConstellationAsGeoJSON(
  'Sagitta',
  'the arrow',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
