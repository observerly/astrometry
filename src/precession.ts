/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type EquatorialCoordinate } from './common'

import { getJulianDate } from './epoch'

import { convertDegreesToRadians as radians, convertRadiansToDegrees as degrees } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForPrecessionOfEquinoxes()
 *
 * Corrects the equatorial coordinates of a target for the precession of the equinoxes.
 *
 * @param date - The date to correct the equatorial coordinates for.
 * @param target - The equatorial J2000 coordinates of the target.
 * @returns The corrected equatorial coordinates of the target.
 *
 */
export const getCorrectionToEquatorialForPrecessionOfEquinoxes = (
  datetime: Date,
  target: EquatorialCoordinate
) => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  const cdr = Math.PI / 180.0

  const csr = cdr / 3600.0

  const epochFrom = 2000.0

  const epochTo = 2000.0 + T * 100

  let { ra, dec } = target

  ra = radians(ra)

  dec = radians(dec)

  const x1 = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)]

  const t = 0.001 * (epochTo - epochFrom)

  const st = 0.001 * (epochFrom - 1900.0)

  const a = csr * t * (23042.53 + st * (139.75 + 0.06 * st) + t * (30.23 - 0.27 * st + 18.0 * t))
  const b = csr * t * t * (79.27 + 0.66 * st + 0.32 * t) + a
  const c = csr * t * (20046.85 - st * (85.33 + 0.37 * st) + t * (-42.67 - 0.37 * st - 41.8 * t))

  const sina = Math.sin(a)
  const sinb = Math.sin(b)
  const sinc = Math.sin(c)
  const cosa = Math.cos(a)
  const cosb = Math.cos(b)
  const cosc = Math.cos(c)

  const r = [
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0]
  ]

  r[0][0] = cosa * cosb * cosc - sina * sinb
  r[0][1] = -cosa * sinb - sina * cosb * cosc
  r[0][2] = -cosb * sinc
  r[1][0] = sina * cosb + cosa * sinb * cosc
  r[1][1] = cosa * cosb - sina * sinb * cosc
  r[1][2] = -sinb * sinc
  r[2][0] = cosa * sinc
  r[2][1] = -sina * sinc
  r[2][2] = cosc

  const x2 = [0.0, 0.0, 0.0]

  for (let i = 0; i < 3; i++) {
    x2[i] = r[i][0] * x1[0] + r[i][1] * x1[1] + r[i][2] * x1[2]
  }

  ra = Math.atan2(x2[1], x2[0])

  if (ra < 0.0) ra += 2.0 * Math.PI

  return {
    ra: degrees(ra) - target.ra,
    dec: degrees(Math.asin(x2[2])) - target.dec
  }
}

/*****************************************************************************************************************/
