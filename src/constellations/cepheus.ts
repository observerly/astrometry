/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/cepheus
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from '../common'

import { createConstellationAsGeoJSON } from './create'

/*****************************************************************************************************************/

const centrum: EquatorialCoordinate = {
  ra: 315.529167,
  dec: 65.285278
}

/*****************************************************************************************************************/

// prettier-ignore
const aster: number[][][] = [
  // Errai to Alfirk
  [
    [354.836655, 77.632313],
    [322.164987, 70.560715]
  ],
  // Errai to ι Cephei
  [
    [354.836655, 77.632313],
    [342.420458, 66.200722]
  ],
  // Alfirk to ι Cephei
  [
    [322.164987, 70.560715],
    [342.420458, 66.200722]
  ],
  // ι Cephei to δ Cephei
  [
    [342.420458, 66.200722],
    [337.292708, 58.415194]
  ],
  // δ Cephei to ε Cephei
  [
    [337.292708, 58.415194],
    [333.757000, 57.043472]
  ],
  // ε Cephei to μ Cephei
  [
    [333.757000, 57.043472],
    [325.876875, 58.780056]
  ],
  // μ Cephei to Alderamin
  [
    [325.876875, 58.780056],
    [319.644885, 62.585574]
  ],
  // Alfirk to Alderamin
  [
    [322.164987, 70.560715],
    [319.644885, 62.585574]
  ],
  // Alderamin to η Cephei
  [
    [319.644885, 62.585574],
    [311.321958, 61.836806]
  ],
  // η Cephei to θ Cephei
  [
    [311.321958, 61.836806],
    [307.395125, 62.994139]
  ]
]

/*****************************************************************************************************************/

// prettier-ignore
const boundaries: number[][][] = [
  [
    [300.573263, 59.851078],
    [300.485200, 61.850620],
    [306.811868, 61.914379],
    [306.517381, 67.412956],
    [310.334015, 67.449028],
    [309.573040, 75.445526],
    [301.873398, 75.370873],
    [300.673800, 80.364777],
    [313.705874, 80.486786],
    [308.720970, 86.465622],
    [308.331355, 86.630630],
    [343.510666, 86.836891],
    [339.260988, 88.663887],
    [135.832471, 87.568916],
    [130.402750, 86.097542],
    [127.953615, 84.610375],
    [84.536118, 85.123947],
    [80.488895, 80.147850],
    [57.530490, 80.398666],
    [56.726210, 77.402596],
    [55.308749, 77.416313],
    [6.922914, 77.692345],
    [6.763764, 66.692444],
    [355.197860, 66.692871],
    [355.217571, 63.692879],
    [348.816490, 63.681290],
    [348.859664, 59.764675],
    [344.269124, 59.751232],
    [344.304027, 56.917961],
    [335.910930, 56.882576],
    [335.931301, 55.632626],
    [333.137626, 55.617844],
    [333.174676, 53.367943],
    [330.639210, 53.353271],
    [330.602189, 55.436489],
    [309.831361, 55.275326],
    [309.623795, 61.357697],
    [308.660804, 61.348644],
    [308.716593, 59.932240],
    [300.573263, 59.851078]
  ]
]

/*****************************************************************************************************************/

// https://www.iau.org/public/themes/constellations/#cep
export const cepheus = createConstellationAsGeoJSON(
  'Cepheus',
  'Cepheus (a king of Aethiopia, mythological character)',
  centrum,
  aster,
  boundaries
)

/*****************************************************************************************************************/
