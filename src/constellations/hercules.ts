/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/hercules
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 255.3956,
  dec: 30.3076
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Rasalgethi to Kornephoros:
  [
    [258.661910, 14.390333],
    [247.554998, 21.489611]
  ],
  // Kornephoros to γ Herculis:
  [
    [247.554998, 21.489611],
    [245.480167, 19.153028]
  ],
  // Kornephoros to ζ Herculis:
  [
    [247.554998, 21.489611],
    [250.322833, 31.601889]
  ],
  // γ Herculis to Cujam:
  [
    [245.480167, 19.153028],
    [246.353979, 14.033274]
  ],
  // Cujam to h Herculis:
  [
    [246.353979, 14.033274],
    [248.151667, 11.488222]
  ],
  // Rasalgethi to Sarin:
  [
    [258.661910, 14.390333],
    [258.757963, 24.839204]
  ],
  // Sarin to ε Herculis:
  [
    [258.757963, 24.839204],
    [255.072542, 30.926333]
  ],
  // ε Herculis to ζ Herculis:
  [
    [255.072542, 30.926333],
    [250.322833, 31.601889]
  ],
  // ζ Herculis to η Herculis:
  [
    [250.322833, 31.601889],
    [250.723917, 38.922472]
  ],
  // η Herculis to σ Herculis:
  [
    [250.723917, 38.922472],
    [248.525792, 42.436889]
  ],
  // σ Herculis to τ Herculis:
  [
    [248.525792, 42.436889],
    [244.935208, 46.313278]
  ],
  // τ Herculis to φ Herculis:
  [
    [244.935208, 46.313278],
    [242.192500, 44.934806]
  ],
  // φ Herculis to χ Herculis:
  [
    [242.192500, 44.934806],
    [238.167458, 42.450000]
  ],
  // Sarin to Maasym:
  [
    [258.757963, 24.839204],
    [262.684626, 26.110645]
  ],
  // Maasym to μ Herculis:
  [
    [262.684626, 26.110645],
    [266.615500, 27.722500]
  ],
  // μ Herculis to ξ Herculis:
  [
    [266.615500, 27.722500],
    [269.440958, 29.247917]
  ],
  // ξ Herculis to ο Herculis:
  [
    [269.440958, 29.247917],
    [271.885625, 28.762472]
  ],
  // ε Herculis to π Herculis:
  [
    [255.072542, 30.926333],
    [258.761875, 36.809167]
  ],
  // π Herculis to η Herculis:
  [
    [258.761875, 36.809167],
    [250.723917, 38.922472]
  ],
  // π Herculis to ρ Herculis:
  [
    [258.761875, 36.809167],
    [260.919583, 37.146667]
  ],
  // ρ Herculis to θ Herculis:
  [
    [260.919583, 37.146667],
    [269.063250, 37.250528]
  ],
  // θ Herculis to ι Herculis:
  [
    [269.063250, 37.250528],
    [264.866208, 46.006333]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [245.558595, 3.703381],
    [242.809668, 3.673514],
    [242.676630, 15.672800],
    [240.181074, 15.646335],
    [240.111007, 21.645968],
    [241.856575, 21.664411],
    [241.805735, 25.664141],
    [243.800182, 25.685595],
    [243.786706, 26.685524],
    [246.279803, 26.712872],
    [246.071949, 39.711720],
    [237.365427, 39.618908],
    [237.124585, 51.117680],
    [255.756826, 51.324268],
    [255.786352, 50.324444],
    [274.257689, 50.547089],
    [274.342375, 47.547604],
    [273.466874, 47.536987],
    [273.824386, 30.039156],
    [276.700773, 30.073977],
    [276.762886, 26.074350],
    [284.269867, 26.164097],
    [284.277162, 25.664141],
    [284.339133, 21.247835],
    [284.373636, 18.664709],
    [284.456262, 12.165196],
    [281.388045, 12.128774],
    [275.203085, 12.054331],
    [275.173274, 14.387479],
    [260.176878, 14.206035],
    [260.195847, 12.706148],
    [252.701482, 12.617938],
    [252.805910, 3.785211],
    [245.558595, 3.703381]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#her
export const hercules = createConstellationAsGeoJSON(
  'Hercules',
  'Hercules (mythological character)',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/