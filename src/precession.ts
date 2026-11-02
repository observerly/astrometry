/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { convertCartesianToEquatorial, convertEquatorialToCartesian } from './coordinates'

import { getNumberOfCenturiesSinceJ2000, getTerrestrialTime } from './epoch'

import { getMatrixProduct, getRotatedCartesianCoordinate, getRotationMatrix } from './maths'

import { getNormalizedAzimuthalDegree, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForFrameBias()
 *
 * Corrects the equatorial coordinates of a target for the frame bias, e.g., the fixed rotation
 * between the International Celestial Reference System (ICRS), which a modern catalogue coordinate
 * is referred to, and the mean equator and equinox of J2000.0, which the precession of the
 * equinoxes is referred from. The correction terms should be added to the target's coordinate by
 * the caller, before the correction for the precession of the equinoxes is resolved.
 *
 * @param target - The equatorial ICRS coordinates of the target.
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export function getCorrectionToEquatorialForFrameBias(
  target: EquatorialCoordinate
): EquatorialCoordinate {
  // The frame bias matrix of IAU 2000, B = R1(−δε₀) · R2(δψ₀ sin ε₀) · R3(δα₀), for δα₀ of −14.6
  // mas, δψ₀ of −41.775 mas, δε₀ of −6.8192 mas and ε₀ of 84381.448″, e.g., getFrameBiasMatrix() of
  // the frames module, which is composed here as the frames module depends on this one:
  const B = getMatrixProduct(
    getRotationMatrix('x', 0.0068192 / 3600),
    getMatrixProduct(
      getRotationMatrix('y', (-0.041775 / 3600) * Math.sin(radians(84381.448 / 3600))),
      getRotationMatrix('z', -0.0146 / 3600)
    )
  )

  // The unit vector of the target in the ICRS, carried to the mean equator and equinox of J2000.0
  // by the frame bias matrix:
  const mean = convertCartesianToEquatorial(
    getRotatedCartesianCoordinate(B, convertEquatorialToCartesian(target))
  )

  // Recover the correction as the displacement of the rotated target from the target, e.g., as a
  // rotated vector, and not expanded about the target, which would divide by cos δ and so degrade
  // towards the celestial poles:
  return {
    ra: getNormalizedAzimuthalDegree(mean.ra - target.ra + 180) - 180,
    dec: mean.dec - target.dec
  }
}

/*****************************************************************************************************************/

/**
 *
 * getPrecessionAngles()
 *
 * The equatorial precession angles ζ, z and θ of IAU 2006, e.g., the angles of the rotation from the mean
 * equator and equinox of J2000.0 to the mean equator and equinox of the date, as the product R3(−z) · R2(θ) ·
 * R3(−ζ) of the passive rotations of the frame, as is defined by the precession of P03 (Capitaine et al. 2003).
 *
 * N.B. The transpose of the rotation, R3(ζ) · R2(−θ) · R3(z), carries a coordinate from the mean equator and
 * equinox of the date back to the mean equator and equinox of J2000.0.
 *
 * @param datetime - The date to resolve the precession angles for.
 * @returns The precession angles ζ, z and θ (in degrees).
 *
 */
export function getPrecessionAngles(datetime: Date): { ζ: number; z: number; θ: number } {
  // The precession angles are referred to Terrestrial Time, and so they are resolved at the Terrestrial Time of
  // the given date:
  const tt = getTerrestrialTime(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = getNumberOfCenturiesSinceJ2000(tt)

  // Calculate the precession angle ζ of the equatorial precession of IAU 2006 (in degrees):
  const ζ =
    (2.650545 +
      2306.083227 * T +
      0.2988499 * T ** 2 +
      0.01801828 * T ** 3 -
      0.000005971 * T ** 4 -
      0.0000003173 * T ** 5) /
    3600

  // Calculate the precession angle z of the equatorial precession of IAU 2006 (in degrees):
  const z =
    (-2.650545 +
      2306.077181 * T +
      1.0927348 * T ** 2 +
      0.01826837 * T ** 3 -
      0.000028596 * T ** 4 -
      0.0000002904 * T ** 5) /
    3600

  // Calculate the precession angle θ of the equatorial precession of IAU 2006 (in degrees):
  const θ =
    (2004.191903 * T -
      0.4294934 * T ** 2 -
      0.04182264 * T ** 3 -
      0.000007089 * T ** 4 -
      0.0000001274 * T ** 5) /
    3600

  return { ζ, z, θ }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForPrecessionOfEquinoxes()
 *
 * Corrects the equatorial coordinates of a target for the precession of the equinoxes.
 *
 * @param datetime - The date to correct the equatorial coordinates for.
 * @param target - The equatorial J2000 coordinates of the target.
 * @returns The corrected equatorial coordinates of the target.
 *
 */
export function getCorrectionToEquatorialForPrecessionOfEquinoxes(
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate {
  // Get the equatorial precession angles of IAU 2006 (in degrees):
  const { ζ, z, θ } = getPrecessionAngles(datetime)

  // The precession matrix of IAU 2006, P = R3(−z) · R2(θ) · R3(−ζ), e.g., getPrecessionMatrix() of
  // the frames module, which is composed here as the frames module depends on this one:
  const P = getMatrixProduct(
    getRotationMatrix('z', -z),
    getMatrixProduct(getRotationMatrix('y', θ), getRotationMatrix('z', -ζ))
  )

  // The unit vector of the target in the mean frame of J2000.0, carried to the mean equator and
  // equinox of the date by the precession matrix:
  const mean = convertCartesianToEquatorial(
    getRotatedCartesianCoordinate(P, convertEquatorialToCartesian(target))
  )

  // Recover the correction as the displacement of the rotated target from the target, with the
  // displacement in right ascension normalised into [−180°, 180°) to avoid a ±360° branch-cut jump
  // when the target lies near a right ascension of 0°/360°:
  return {
    ra: getNormalizedAzimuthalDegree(mean.ra - target.ra + 180) - 180,
    dec: mean.dec - target.dec
  }
}

/*****************************************************************************************************************/
