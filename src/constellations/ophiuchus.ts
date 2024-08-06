/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ophiuchus
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 263.001775,
  dec: -5.399442
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Rasalhague to κ Ophiuchi:
  [
    [263.733627, 12.560035],
    [254.417792, 9.375056]
  ],
  // κ Ophiuchi to Yed Prior:
  [
    [254.417792, 9.375056],
    [243.586411, -3.694323]
  ],
  // Yed Prior to Yed Posterior:
  [
    [243.586411, -3.694323],
    [244.580374, -4.692510]
  ],
  // Yed Posterior to υ Ophiuchi:
  [
    [244.580374, -4.692510],
    [246.950958, -8.371694]
  ],
  // υ Ophiuchi to ζ Ophiuchi:
  [
    [246.950958, -8.371694],
    [249.289708, -10.567139]
  ],
  // ζ Ophiuchi to Sabik:
  [
    [249.289708, -10.567139],
    [257.594529, -15.724907]
  ],
  // Sabik to Cebalrai:
  [
    [257.594529, -15.724907],
    [265.868136, 4.567300]
  ],
  // Cebalrai to Rasalhague:
  [
    [265.868136, 4.567300],
    [263.733627, 12.560035]
  ],
  // Cebalrai to γ Ophiuchi:
  [
    [265.868136, 4.567300],
    [266.973208, 2.707472]
  ],
  // γ Ophiuchi to ν Ophiuchi:
  [
    [266.973208, 2.707472],
    [269.756667, -9.773361]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [245.602627, -0.296377],
    [245.558595, 3.703381],
    [252.805910, 3.785211],
    [252.701482, 12.617938],
    [260.195847, 12.706148],
    [260.176878, 14.206035],
    [275.173274, 14.387479],
    [275.203085, 12.054331],
    [281.388045, 12.128774],
    [281.458569, 6.379194],
    [275.274610, 6.304763],
    [275.296011, 4.554893],
    [277.871131, 4.586016],
    [277.889300, 3.086125],
    [275.314236, 3.055003],
    [275.350599, 0.055224],
    [269.101038, -0.020647],
    [269.149704, -4.020351],
    [271.149674, -3.996055],
    [271.223716, -9.995605],
    [266.723757, -10.050234],
    [266.744700, -11.716777],
    [265.494404, -11.731914],
    [265.473490, -10.065370],
    [259.222070, -10.140438],
    [259.297428, -16.139990],
    [265.800190, -16.061882],
    [266.001835, -30.060663],
    [253.235349, -30.212309],
    [253.155670, -24.796097],
    [245.891446, -24.878118],
    [245.822984, -19.545166],
    [247.450675, -19.527155],
    [247.438230, -18.527226],
    [245.810680, -18.545235],
    [245.691204, -8.295890],
    [240.437279, -8.352324],
    [240.386954, -3.602587],
    [245.638389, -3.546180],
    [245.602627, -0.296377]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#oph
export const ophiuchus = createConstellationAsGeoJSON(
  'Ophiuchus',
  'serpent-bearer',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/