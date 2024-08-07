/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ursaMajor
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 178.745522,
  dec: 54.244607
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Alkaid to Mizar:
  [
    [206.885157, 49.313267],
    [200.981429, 54.925362]
  ],
  // Mizar to Alioth:
  [
    [200.981429, 54.925362],
    [193.507290, 55.959823]
  ],
  // Alioth to Megrez:
  [
    [193.507290, 55.959823],
    [183.856503, 57.032615]
  ],
  // Megrez to Dubhe:
  [
    [183.856503, 57.032615],
    [165.931965, 61.751035]
  ],
  // Dubhe to Merak:
  [
    [165.931965, 61.751035],
    [165.460319, 56.382426]
  ],
  // Merak to Phecda:
  [
    [165.460319, 56.382426],
    [178.457679, 53.694758]
  ],
  // Megrez to Phecda:
  [
    [183.856503, 57.032615],
    [178.457679, 53.694758]
  ],
  // Phecda to Taiyangshou:
  [
    [178.457679, 53.694758],
    [176.512559, 47.779406]
  ],
  // Taiyangshou to Alula Borealis:
  [
    [176.512559, 47.779406],
    [169.619737, 33.094305]
  ],
  // Alula Borealis to Alula Australis:
  [
    [169.619737, 33.094305],
    [169.545423, 31.529161]
  ],
  // Taiyangshou to ψ Ursae Majoris:
  [
    [176.512559, 47.779406],
    [167.416083, 44.498556]
  ],
  // ψ Ursae Majoris to Tania Australis:
  [
    [167.416083, 44.498556],
    [155.582250, 41.499519]
  ],
  // Tania Australis to Tania Borealis:
  [
    [155.582250, 41.499519],
    [154.274095, 42.914356]
  ],
  // Dubhe to h Ursae Majoris:
  [
    [165.931965, 61.751035],
    [142.881542, 63.061806]
  ],
  // Merak to υ Ursae Majoris:
  [
    [165.460319, 56.382426],
    [147.748708, 59.039111]
  ],
  // υ Ursae Majoris to h Ursae Majoris:
  [
    [147.748708, 59.039111],
    [142.881542, 63.061806]
  ],
  // h Ursae Majoris to Muscida:
  [
    [142.881542, 63.061806],
    [127.566128, 60.718170]
  ],
  // υ Ursae Majoris to Muscida:
  [
    [147.748708, 59.039111],
    [127.566128, 60.718170]
  ],
  // υ Ursae Majoris to θ Ursae Majoris:
  [
    [147.748708, 59.039111],
    [143.218042, 51.678611]
  ],
  // θ Ursae Majoris to Alkaphrah:
  [
    [143.218042, 51.678611],
    [135.906365, 47.156525]
  ],
  // Alkaphrah to Talitha:
  [
    [135.906365, 47.156525],
    [134.801890, 48.041826]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [145.709238, 41.431675],
    [139.512490, 41.478596],
    [139.590711, 46.478279],
    [128.440104, 46.577728],
    [128.799134, 59.575989],
    [122.129101, 59.643398],
    [123.086229, 73.138374],
    [140.615474, 72.974136],
    [171.961370, 72.812500],
    [171.849346, 65.812607],
    [181.579255, 65.803963],
    [181.581560, 63.303963],
    [203.550539, 63.359344],
    [203.573641, 62.359398],
    [217.045254, 62.441482],
    [217.251249, 54.942238],
    [211.584391, 54.903576],
    [211.698732, 47.903938],
    [203.795114, 47.859928],
    [203.742399, 52.359806],
    [182.818523, 52.304336],
    [182.826434, 44.304336],
    [181.591416, 44.303963],
    [181.594506, 33.303963],
    [181.595664, 28.303963],
    [179.608941, 28.304047],
    [166.693998, 28.325026],
    [166.714225, 33.324993],
    [163.489409, 33.335678],
    [163.523169, 39.335613],
    [154.359412, 39.377411],
    [154.378224, 41.377361],
    [145.709238, 41.431675]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#uma
export const ursaMajor = createConstellationAsGeoJSON(
  'Ursa Major',
  'the greater bear',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
