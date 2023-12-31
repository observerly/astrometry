/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/earth
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getJulianDate } from './epoch'

import { type Planet } from './planets'

/*****************************************************************************************************************/

export const earth: Planet = {
  uid: '01HD4AM60QS3SXKKJWY1A2Z3JF',
  name: 'Earth',
  symbol: '♁',
  T: 1.0000174,
  m: 1,
  r: 6378140,
  e: 0.01671123,
  a: 1.0000003,
  i: -0.00001531,
  ε: 100.464572,
  ϖ: 102.937682,
  Ω: null,
  isInferior: false
}

/*****************************************************************************************************************/

/**
 *
 * getEccentricityOfOrbit()
 *
 * The eccentricity of the Earth's orbit is a measure of how elliptical the Earth's
 * orbit is. The eccentricity of the Earth's orbit is not constant, but varies over
 * time. This function returns the eccentricity of the Earth's orbit for a given date.
 *
 * @param date - The date to get the eccentricity of the Earth's orbit for
 * @returns The eccentricity of the Earth's orbit in degrees
 *
 */
export const getEccentricityOfOrbit = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Get the eccentricity of the Earth's orbit
  return 0.0167086342 - 0.000042037 * T - ((0.0000001267 * Math.pow(T, 2)) % 360)
}

/*****************************************************************************************************************/
