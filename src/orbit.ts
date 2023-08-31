/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/orbit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

export const getFOrbitalParameter = (ν: number, e: number): number => {
  return (1 + e * Math.cos(radians(ν))) / (1 - Math.pow(e, 2))
}

/*****************************************************************************************************************/
