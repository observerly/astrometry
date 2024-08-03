/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/draco
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 257.19665,
  dec: 65.714684
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Giausar to κ Draconis:
  [
    [172.850920, 69.331075],
    [188.371000, 69.788222]
  ],
  // κ Draconis to Thuban:
  [
    [188.371000, 69.788222],
    [211.097291, 64.375851]
  ],
  // Thuban to Edasich:
  [
    [211.097291, 64.375851],
    [231.232396, 58.966063]
  ],
  // Edasich to θ Draconis:
  [
    [231.232396, 58.966063],
    [240.473750, 58.564444]
  ],
  // θ Draconis to Athebyne:
  [
    [240.473750, 58.564444],
    [245.997858, 61.514214]
  ],
  // Athebyne to Aldhibah:
  [
    [245.997858, 61.514214],
    [257.196650, 65.714684]
  ],
  // Aldhibah to ω Draconis:
  [
    [257.196650, 65.714684],
    [264.237875, 68.757194]
  ],
  // ω Draconis to φ Draconis:
  [
    [264.237875, 68.757194],
    [275.189333, 71.337722]
  ],
  // φ Draconis to χ Draconis:
  [
    [275.189333, 71.337722],
    [275.259750, 72.733694]
  ],
  // φ Draconis to Altais:
  [
    [275.189333, 71.337722],
    [288.138750, 67.661541]
  ],
  // Altais to ε Draconis:
  [
    [288.138750, 67.661541],
    [297.042542, 70.267833]
  ],
  // Altais to Grumium:
  [
    [288.138750, 67.661541],
    [268.382207, 56.872646]
  ],
  // Grumium to ν¹ Draconis:
  [
    [268.382207, 56.872646],
    [263.043417, 55.184111]
  ],
  // ν¹ Draconis to Rastaban:
  [
    [263.043417, 55.184111],
    [262.608174, 52.301389]
  ],
  // Rastaban to Eltanin:
  [
    [262.608174, 52.301389],
    [269.151541, 51.488896]
  ],
  // Eltanin to Grumium:
  [
    [269.151541, 51.488896],
    [268.382207, 56.872646]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [140.615474, 72.974136],
    [142.191195, 81.467766],
    [163.105416, 81.339607],
    [162.818598, 79.340179],
    [174.531584, 79.308342],
    [174.434796, 76.308411],
    [195.820613, 76.328911],
    [196.097474, 69.329361],
    [210.650811, 69.399117],
    [210.820555, 65.399651],
    [235.329565, 65.602348],
    [235.050630, 69.600944],
    [247.841062, 69.738304],
    [247.220707, 74.734787],
    [261.536637, 74.903313],
    [260.217905, 79.895348],
    [267.656020, 79.985748],
    [261.722230, 85.949570],
    [308.720970, 86.465622],
    [313.705874, 80.486786],
    [300.673800, 80.364777],
    [301.873398, 75.370873],
    [309.573040, 75.445526],
    [310.334015, 67.449028],
    [306.517381, 67.412956],
    [306.811868, 61.914379],
    [300.485200, 61.850620],
    [300.573263, 59.851078],
    [297.039241, 59.813541],
    [297.100554, 58.313873],
    [291.809550, 58.255470],
    [291.904593, 55.756004],
    [286.876460, 55.698448],
    [287.120648, 47.699867],
    [274.342375, 47.547604],
    [274.257689, 50.547089],
    [255.786352, 50.324444],
    [255.756826, 51.324268],
    [237.124585, 51.117680],
    [237.084474, 52.617477],
    [229.657374, 52.545174],
    [229.591055, 55.044865],
    [217.251249, 54.942238],
    [217.045254, 62.441482],
    [203.573641, 62.359398],
    [203.550539, 63.359344],
    [181.581560, 63.303963],
    [181.579255, 65.803963],
    [171.849346, 65.812607],
    [171.961370, 72.812500],
    [140.615474, 72.974136]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#dra
export const draco = createConstellationAsGeoJSON('Draco', 'the dragon', centrum, aster, boundaries)

/*****************************************************************************************************************/