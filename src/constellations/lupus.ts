/*****************************************************************************************************************/

// @package        @observerly/astrometry/lupus
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 228.404811,
  dec: -42.7088575
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // α Lupi to ζ Lupi:
  [
    [220.482375, -47.388139],
    [228.071667, -52.099083]
  ],
  // ζ Lupi to μ Lupi:
  [
    [228.071667, -52.099083],
    [229.633542, -47.875194]
  ],
  // ζ Lupi to η Lupi:
  [
    [228.071667, -52.099083],
    [240.030583, -38.396639]
  ],
  // μ Lupi to ε Lupi:
  [
    [229.633542, -47.875194],
    [230.670375, -44.689583]
  ],
  // ε Lupi to γ Lupi:
  [
    [230.670375, -44.689583],
    [233.785250, -41.166694]
  ],
  // γ Lupi to η Lupi:
  [
    [233.785250, -41.166694],
    [240.030583, -38.396639]
  ],
  // η Lupi to χ Lupi:
  [
    [240.030583, -38.396639],
    [237.739750, -33.627111]
  ],
  // χ Lupi to φ¹ Lupi:
  [
    [237.739750, -33.627111],
    [230.451833, -36.261167]
  ],
  // φ¹ Lupi to η Lupi:
  [
    [230.451833, -36.261167],
    [240.030583, -38.396639]
  ],
  // γ Lupi to δ Lupi:
  [
    [233.785250, -41.166694],
    [230.343083, -40.647472]
  ],
  // δ Lupi to β Lupi:
  [
    [230.343083, -40.647472],
    [224.633125, -43.133861]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [214.656816, -55.579952],
    [220.234465, -55.540089],
    [228.083511, -55.475494],
    [228.056716, -54.475617],
    [232.353372, -54.436417],
    [232.207246, -48.437107],
    [237.247281, -48.388023],
    [237.124585, -42.388638],
    [242.152806, -42.336678],
    [241.947699, -29.837763],
    [236.929980, -29.889616],
    [225.630770, -29.994879],
    [225.796280, -42.494175],
    [214.450265, -42.580647],
    [214.656816, -55.579952]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#lup
export const lupus = createConstellationAsGeoJSON('Lupus', 'the wolf', centrum, aster, boundaries)

/*****************************************************************************************************************/
