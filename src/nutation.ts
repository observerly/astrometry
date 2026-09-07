/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nutation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getJulianDate, getTerrestrialTime } from './epoch'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

// The luni-solar terms of the IAU 2000B nutation series, e.g., for each term the multipliers of the fundamental
// arguments l, l', F, D and Ω, the coefficients of the nutation in longitude, in sine, in sine by T and in cosine,
// and the coefficients of the nutation in obliquity, in cosine, in cosine by T and in sine (in units of 0.1
// microarcseconds), per McCarthy, D. D., & Luzum, B. J. (2003), "An abridged model of the precession-nutation of
// the celestial pole", Celestial Mechanics and Dynamical Astronomy, 85(1), 37-49:
const IAU2000B_NUTATION_TERMS = [
  [0, 0, 0, 0, 1, -172064161, -174666, 33386, 92052331, 9086, 15377],
  [0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015, -4587],
  [0, 0, 2, 0, 2, -2276413, -234, 2796, 978459, -485, 1374],
  [0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291],
  [0, 1, 0, 0, 0, 1475877, -3633, 11817, 73871, -184, -1924],
  [0, 1, 2, -2, 2, -516821, 1226, -524, 224386, -677, -174],
  [1, 0, 0, 0, 0, 711159, 73, -872, -6750, 0, 358],
  [0, 0, 2, 0, 1, -387298, -367, 380, 200728, 18, 318],
  [1, 0, 2, 0, 2, -301461, -36, 816, 129025, -63, 367],
  [0, -1, 2, -2, 2, 215829, -494, 111, -95929, 299, 132],
  [0, 0, 2, -2, 1, 128227, 137, 181, -68982, -9, 39],
  [-1, 0, 2, 0, 2, 123457, 11, 19, -53311, 32, -4],
  [-1, 0, 0, 2, 0, 156994, 10, -168, -1235, 0, 82],
  [1, 0, 0, 0, 1, 63110, 63, 27, -33228, 0, -9],
  [-1, 0, 0, 0, 1, -57976, -63, -189, 31429, 0, -75],
  [-1, 0, 2, 2, 2, -59641, -11, 149, 25543, -11, 66],
  [1, 0, 2, 0, 1, -51613, -42, 129, 26366, 0, 78],
  [-2, 0, 2, 0, 1, 45893, 50, 31, -24236, -10, 20],
  [0, 0, 0, 2, 0, 63384, 11, -150, -1220, 0, 29],
  [0, 0, 2, 2, 2, -38571, -1, 158, 16452, -11, 68],
  [0, -2, 2, -2, 2, 32481, 0, 0, -13870, 0, 0],
  [-2, 0, 0, 2, 0, -47722, 0, -18, 477, 0, -25],
  [2, 0, 2, 0, 2, -31046, -1, 131, 13238, -11, 59],
  [1, 0, 2, -2, 2, 28593, 0, -1, -12338, 10, -3],
  [-1, 0, 2, 0, 1, 20441, 21, 10, -10758, 0, -3],
  [2, 0, 0, 0, 0, 29243, 0, -74, -609, 0, 13],
  [0, 0, 2, 0, 0, 25887, 0, -66, -550, 0, 11],
  [0, 1, 0, 0, 1, -14053, -25, 79, 8551, -2, -45],
  [-1, 0, 0, 2, 1, 15164, 10, 11, -8001, 0, -1],
  [0, 2, 2, -2, 2, -15794, 72, -16, 6850, -42, -5],
  [0, 0, -2, 2, 0, 21783, 0, 13, -167, 0, 13],
  [1, 0, 0, -2, 1, -12873, -10, -37, 6953, 0, -14],
  [0, -1, 0, 0, 1, -12654, 11, 63, 6415, 0, 26],
  [-1, 0, 2, 2, 1, -10204, 0, 25, 5222, 0, 15],
  [0, 2, 0, 0, 0, 16707, -85, -10, 168, -1, 10],
  [1, 0, 2, 2, 2, -7691, 0, 44, 3268, 0, 19],
  [-2, 0, 2, 0, 0, -11024, 0, -14, 104, 0, 2],
  [0, 1, 2, 0, 2, 7566, -21, -11, -3250, 0, -5],
  [0, 0, 2, 2, 1, -6637, -11, 25, 3353, 0, 14],
  [0, -1, 2, 0, 2, -7141, 21, 8, 3070, 0, 4],
  [0, 0, 0, 2, 1, -6302, -11, 2, 3272, 0, 4],
  [1, 0, 2, -2, 1, 5800, 10, 2, -3045, 0, -1],
  [2, 0, 2, -2, 2, 6443, 0, -7, -2768, 0, -4],
  [-2, 0, 0, 2, 1, -5774, -11, -15, 3041, 0, -5],
  [2, 0, 2, 0, 1, -5350, 0, 21, 2695, 0, 12],
  [0, -1, 2, -2, 1, -4752, -11, -3, 2719, 0, -3],
  [0, 0, 0, -2, 1, -4940, -11, -21, 2720, 0, -9],
  [-1, -1, 0, 2, 0, 7350, 0, -8, -51, 0, 4],
  [2, 0, 0, -2, 1, 4065, 0, 6, -2206, 0, 1],
  [1, 0, 0, 2, 0, 6579, 0, -24, -199, 0, 2],
  [0, 1, 2, -2, 1, 3579, 0, 5, -1900, 0, 1],
  [1, -1, 0, 0, 0, 4725, 0, -6, -41, 0, 3],
  [-2, 0, 2, 0, 2, -3075, 0, -2, 1313, 0, -1],
  [3, 0, 2, 0, 2, -2904, 0, 15, 1233, 0, 7],
  [0, -1, 0, 2, 0, 4348, 0, -10, -81, 0, 2],
  [1, -1, 2, 0, 2, -2878, 0, 8, 1232, 0, 4],
  [0, 0, 0, 1, 0, -4230, 0, 5, -20, 0, -2],
  [-1, -1, 2, 2, 2, -2819, 0, 7, 1207, 0, 3],
  [-1, 0, 2, 0, 0, -4056, 0, 5, 40, 0, -2],
  [0, -1, 2, 2, 2, -2647, 0, 11, 1129, 0, 5],
  [-2, 0, 0, 0, 1, -2294, 0, -10, 1266, 0, -4],
  [1, 1, 2, 0, 2, 2481, 0, -7, -1062, 0, -3],
  [2, 0, 0, 0, 1, 2179, 0, -2, -1129, 0, -2],
  [-1, 1, 0, 1, 0, 3276, 0, 1, -9, 0, 0],
  [1, 1, 0, 0, 0, -3389, 0, 5, 35, 0, -2],
  [1, 0, 2, 0, 0, 3339, 0, -13, -107, 0, 1],
  [-1, 0, 2, -2, 1, -1987, 0, -6, 1073, 0, -2],
  [1, 0, 0, 0, 2, -1981, 0, 0, 854, 0, 0],
  [-1, 0, 0, 1, 0, 4026, 0, -353, -553, 0, -139],
  [0, 0, 2, 1, 2, 1660, 0, -5, -710, 0, -2],
  [-1, 0, 2, 4, 2, -1521, 0, 9, 647, 0, 4],
  [-1, 1, 0, 1, 1, 1314, 0, 0, -700, 0, 0],
  [0, -2, 2, -2, 1, -1283, 0, 0, 672, 0, 0],
  [1, 0, 2, 2, 1, -1331, 0, 8, 663, 0, 4],
  [-2, 0, 2, 2, 2, 1383, 0, -2, -594, 0, -2],
  [-1, 0, 0, 0, 2, 1405, 0, 4, -610, 0, 2],
  [1, 1, 2, -2, 2, 1290, 0, 0, -556, 0, 0]
] as const

/*****************************************************************************************************************/

/**
 *
 * getNutation()
 *
 * The nutation of the Earth is the periodic oscillation of the Earth's axis of
 * rotation about its mean position, caused by the gravitational influence of
 * the Moon and Sun on the Earth's equatorial bulge.
 *
 * @param date - The date for which to calculate the nutation.
 * @returns The nutation in longitude (Δψ) and obliquity (Δε), both in degrees.
 *
 */
export const getNutation = (date: Date): { Δψ: number; Δε: number } => {
  // The series is referred to Terrestrial Time, and so it is resolved at the Terrestrial Time of the given date:
  const JD = getJulianDate(getTerrestrialTime(date))

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the fundamental (Delaunay) arguments of the series (in radians), e.g., the mean anomaly of the Moon, l,
  // the mean anomaly of the Sun, l', the mean argument of the latitude of the Moon, F, the mean elongation of the
  // Moon from the Sun, D, and the mean longitude of the ascending node of the Moon, Ω.
  //
  // N.B. The arguments are deliberately evaluated as the complete polynomials of the IERS Conventions (2003), as
  // the full IAU 2000A model evaluates them, and not as the linear terms alone that the abridged IAU 2000B model
  // truncates them to, which brings the series closer to the full model by ~0.1 milliarcseconds:
  const l = radians(
    ((485868.249036 + T * (1717915923.2178 + T * (31.8792 + T * (0.051635 + T * -0.0002447)))) %
      1296000) /
      3600
  )

  const lp = radians(
    ((1287104.793048 + T * (129596581.0481 + T * (-0.5532 + T * (0.000136 + T * -0.00001149)))) %
      1296000) /
      3600
  )

  const F = radians(
    ((335779.526232 + T * (1739527262.8478 + T * (-12.7512 + T * (-0.001037 + T * 0.00000417)))) %
      1296000) /
      3600
  )

  const D = radians(
    ((1072260.703692 + T * (1602961601.209 + T * (-6.3706 + T * (0.006593 + T * -0.00003169)))) %
      1296000) /
      3600
  )

  const Ω = radians(
    ((450160.398036 + T * (-6962890.5431 + T * (7.4722 + T * (0.007702 + T * -0.00005939)))) %
      1296000) /
      3600
  )

  // Sum the luni-solar series for the nutation in longitude and in obliquity (in units of 0.1 microarcseconds):
  let Δψ = 0

  let Δε = 0

  for (const [nl, nlp, nF, nD, nΩ, sψ, sψT, cψ, cε, cεT, sε] of IAU2000B_NUTATION_TERMS) {
    // The argument of the term, e.g., the combination of the fundamental arguments (in radians):
    const argument = nl * l + nlp * lp + nF * F + nD * D + nΩ * Ω

    Δψ += (sψ + sψT * T) * Math.sin(argument) + cψ * Math.cos(argument)

    Δε += (cε + cεT * T) * Math.cos(argument) + sε * Math.sin(argument)
  }

  // Return the nutation in longitude and obliquity (in degrees), corrected for the fixed offsets that stand in for
  // the planetary terms of the full series, e.g., -0.135 and +0.388 milliarcseconds:
  return {
    Δψ: (Δψ * 1e-7 - 0.135e-3) / 3600,
    Δε: (Δε * 1e-7 + 0.388e-3) / 3600
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForNutation()
 *
 * Calculates the correction terms (Δra, Δdec) to the equatorial coordinate of a target for
 * nutation in longitude and obliquity due to the gravitational influence of the moon and sun
 * on the Earth, causing the Earth's axial precession to vary over time. The correction terms
 * should be added to the target's coordinate by the caller.
 *
 * @param datetime - The date to calculate the equatorial correction for.
 * @param target - The equatorial J2000 coordinate of the target.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForNutation = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  const ra = radians(target.ra)

  const dec = radians(target.dec)

  // Get the nutation in longitude and obliquity (in degrees):
  const { Δψ, Δε } = getNutation(datetime)

  // Calculate the number of centuries since J2000.0, at the Terrestrial Time of the given date:
  const T = (getJulianDate(getTerrestrialTime(datetime)) - 2451545.0) / 36525

  // Get the mean obliquity of the ecliptic (in degrees), e.g., the mean obliquity of IAU 2006.
  //
  // N.B. The polynomial is that of getObliquityOfTheEcliptic(), which is resolved here so that this module does
  // not depend on the ecliptic module, which depends on this module:
  const ε0 =
    (84381.406 -
      46.836769 * T -
      0.0001831 * T ** 2 +
      0.0020034 * T ** 3 -
      0.000000576 * T ** 4 -
      0.0000000434 * T ** 5) /
    3600

  // Get the true obliquity of the ecliptic (in degrees):
  const ε = radians(ε0 + Δε)

  // Calculate the nutation correction in right ascension (in degrees)
  const Δra =
    (Math.cos(ε) + Math.sin(ε) * Math.sin(ra) * Math.tan(dec)) * Δψ -
    Math.cos(ra) * Math.tan(dec) * Δε

  // Calculate the nutation correction in declination (in degrees)
  const Δdec = Math.sin(ε) * Math.cos(ra) * Δψ + Math.sin(ra) * Δε

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/
