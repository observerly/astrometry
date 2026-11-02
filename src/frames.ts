/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/frames
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getLocalApparentSiderealTime } from './astrometry'

import type { GeographicCoordinate, Matrix3 } from './common'
import { getObliquityOfTheEcliptic } from './ecliptic'
import { getMatrixProduct, getRotationMatrix } from './maths'

import { getNutation, getTrueObliquityOfTheEcliptic } from './nutation'

import { getPrecessionAngles } from './precession'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getFrameBiasMatrix()
 *
 * Resolves the frame bias matrix B of IAU 2000, e.g., the fixed rotation from the International
 * Celestial Reference System (ICRS), which a modern catalogue coordinate is referred to, to the
 * mean equator and equinox of J2000.0, which the precession of the equinoxes is referred from, as
 * is defined by the iauBi00 and iauBp00 routines of the IAU SOFA library:
 *
 * B = R1(−δε₀) · R2(δψ₀ sin ε₀) · R3(δα₀)
 *
 * where δα₀ is the offset of the ICRS origin of right ascension from the mean equinox of
 * J2000.0, and δψ₀ and δε₀ are the offsets of the ICRS pole from the mean pole of J2000.0 in
 * longitude and in obliquity, respectively, referred to the mean obliquity of the ecliptic at
 * J2000.0, ε₀.
 *
 * N.B. The frame bias is fixed, e.g., it is not a function of the date, and is of the order of
 * 20 mas, such that the matrix differs from the identity by less than 1e-7 in each element.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., Bᵀ rotates the mean equator and equinox
 * of J2000.0 back into the ICRS.
 *
 * @returns The 3×3 frame bias matrix, in row-major order.
 *
 */
export function getFrameBiasMatrix(): Matrix3 {
  // The frame bias in right ascension of IAU 2000, e.g., the offset of the ICRS origin of right
  // ascension from the mean equinox of J2000.0 (in degrees):
  const δα0 = -0.0146 / 3600

  // The frame bias in longitude of IAU 2000, e.g., the offset of the ICRS pole from the mean pole
  // of J2000.0 in the direction of the mean equinox of J2000.0 (in degrees):
  const δψ0 = -0.041775 / 3600

  // The frame bias in obliquity of IAU 2000, e.g., the offset of the ICRS pole from the mean pole
  // of J2000.0 at right angles to the mean equinox of J2000.0 (in degrees):
  const δε0 = -0.0068192 / 3600

  // The mean obliquity of the ecliptic at J2000.0 of IAU 1980, which the frame bias in longitude
  // is referred to (in degrees):
  const ε0 = 84381.448 / 3600

  // The rotation about the z-axis is applied first, and the rotation about the x-axis last:
  return getMatrixProduct(
    getRotationMatrix('x', -δε0),
    getMatrixProduct(
      getRotationMatrix('y', δψ0 * Math.sin(radians(ε0))),
      getRotationMatrix('z', δα0)
    )
  )
}

/*****************************************************************************************************************/

/**
 *
 * getPrecessionMatrix()
 *
 * Resolves the precession matrix P of IAU 2006, e.g., the rotation from the mean equator and
 * equinox of J2000.0 to the mean equator and equinox of the date, as the product of the passive
 * rotations of the frame through the equatorial precession angles ζ, z and θ of P03 (Capitaine
 * et al. 2003):
 *
 * P = R3(−z) · R2(θ) · R3(−ζ)
 *
 * N.B. The matrix is referred to the mean equator and equinox of J2000.0, and not to the ICRS,
 * e.g., a catalogue coordinate is carried by the frame bias matrix first, as P · B.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., Pᵀ carries a coordinate from the mean
 * equator and equinox of the date back to the mean equator and equinox of J2000.0.
 *
 * @param datetime - The date to resolve the precession matrix for.
 * @returns The 3×3 precession matrix, in row-major order.
 *
 */
export function getPrecessionMatrix(datetime: Date): Matrix3 {
  // Get the equatorial precession angles of IAU 2006 (in degrees):
  const { ζ, z, θ } = getPrecessionAngles(datetime)

  // The rotation about the z-axis through −ζ is applied first, and the rotation about the z-axis
  // through −z last:
  return getMatrixProduct(
    getRotationMatrix('z', -z),
    getMatrixProduct(getRotationMatrix('y', θ), getRotationMatrix('z', -ζ))
  )
}

/*****************************************************************************************************************/

/**
 *
 * getNutationMatrix()
 *
 * Resolves the nutation matrix N, e.g., the rotation from the mean equator and equinox of the date
 * to the true equator and equinox of the date, as the product of the passive rotations of the
 * frame through the mean obliquity of the ecliptic, ε₀, and the nutation in longitude, Δψ, and in
 * obliquity, Δε, of the date, as is defined by the iauNumat routine of the IAU SOFA library:
 *
 * N = R1(−(ε₀ + Δε)) · R3(−Δψ) · R1(ε₀)
 *
 * where R1(ε₀) carries the mean equator of the date onto the ecliptic, R3(−Δψ) carries the mean
 * equinox of the date to the true equinox of the date along the ecliptic, and R1(−(ε₀ + Δε))
 * carries the ecliptic onto the true equator of the date.
 *
 * N.B. The matrix is referred to the mean equator and equinox of the date, e.g., a catalogue
 * coordinate is carried by the frame bias and precession matrices first, as N · P · B.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., Nᵀ carries a coordinate from the true
 * equator and equinox of the date back to the mean equator and equinox of the date.
 *
 * @param datetime - The date to resolve the nutation matrix for.
 * @returns The 3×3 nutation matrix, in row-major order.
 *
 */
export function getNutationMatrix(datetime: Date): Matrix3 {
  // Get the nutation in longitude and obliquity (in degrees):
  const { Δψ, Δε } = getNutation(datetime)

  // Get the mean obliquity of the ecliptic, e.g., the mean obliquity of IAU 2006 (in degrees):
  const ε0 = getObliquityOfTheEcliptic(datetime)

  // The rotation about the x-axis through the mean obliquity is applied first, and the rotation
  // about the x-axis through the negative of the true obliquity last:
  return getMatrixProduct(
    getRotationMatrix('x', -(ε0 + Δε)),
    getMatrixProduct(getRotationMatrix('z', -Δψ), getRotationMatrix('x', ε0))
  )
}

/*****************************************************************************************************************/

/**
 *
 * getEquatorialToGalacticMatrix()
 *
 * Resolves the equatorial to galactic matrix G, e.g., the fixed rotation from the International
 * Celestial Reference System (ICRS) to the galactic frame, as is defined by the Hipparcos
 * catalogue (ESA 1997, Vol. 1, §1.5.3) and resolved by the iauIcrs2g routine of the IAU SOFA
 * library, as the product of the passive rotations of the frame:
 *
 * G = R3(90° − θ) · R1(90° − δP) · R3(αP + 90°)
 *
 * where αP and δP are the right ascension and declination of the north galactic pole, and θ is
 * the galactic longitude of the north celestial pole.
 *
 * N.B. The galactic frame is fixed, e.g., it is not a function of the date, and is referred to the
 * ICRS, e.g., a catalogue coordinate is carried into it directly.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., Gᵀ carries a galactic coordinate back
 * into the ICRS.
 *
 * @returns The 3×3 equatorial to galactic matrix, in row-major order.
 *
 */
export function getEquatorialToGalacticMatrix(): Matrix3 {
  // The right ascension of the north galactic pole, referred to the ICRS (in degrees):
  const αP = 192.85948

  // The declination of the north galactic pole, referred to the ICRS (in degrees):
  const δP = 27.12825

  // The galactic longitude of the north celestial pole of the ICRS (in degrees):
  const θ = 122.93192

  // The rotation about the z-axis to the ascending node of the galactic equator on the celestial
  // equator is applied first, the rotation about the x-axis to the north galactic pole second, and
  // the rotation about the z-axis from the node to the galactic centre last:
  return getMatrixProduct(
    getRotationMatrix('z', 90 - θ),
    getMatrixProduct(getRotationMatrix('x', 90 - δP), getRotationMatrix('z', αP + 90))
  )
}

/*****************************************************************************************************************/

/**
 *
 * getBiasPrecessionNutationMatrix()
 *
 * Resolves the bias-precession-nutation matrix NPB of IAU 2006/2000A, e.g., the rotation from the
 * International Celestial Reference System (ICRS), which a modern catalogue coordinate is referred
 * to, to the true equator and equinox of the date, as the product of the nutation matrix N, the
 * precession matrix P and the frame bias matrix B, as is defined by the iauPnm06a routine of the
 * IAU SOFA library:
 *
 * NPB = N · P · B
 *
 * where B carries the ICRS to the mean equator and equinox of J2000.0, P carries the mean equator
 * and equinox of J2000.0 to the mean equator and equinox of the date, and N carries the mean
 * equator and equinox of the date to the true equator and equinox of the date.
 *
 * N.B. The third row of the matrix is the direction of the celestial intermediate pole (CIP) of
 * the date, referred to the ICRS.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., NPBᵀ carries a coordinate from the true
 * equator and equinox of the date back to the ICRS.
 *
 * @param datetime - The date to resolve the bias-precession-nutation matrix for.
 * @returns The 3×3 bias-precession-nutation matrix, in row-major order.
 *
 */
export function getBiasPrecessionNutationMatrix(datetime: Date): Matrix3 {
  // The frame bias is applied first, the precession second, and the nutation last:
  return getMatrixProduct(
    getNutationMatrix(datetime),
    getMatrixProduct(getPrecessionMatrix(datetime), getFrameBiasMatrix())
  )
}

/*****************************************************************************************************************/

/**
 *
 * getEquatorialToEclipticMatrix()
 *
 * Resolves the equatorial to ecliptic matrix E, e.g., the rotation from the true equator and
 * equinox of the date to the true ecliptic and equinox of the date, as the passive rotation of the
 * frame about the x-axis, e.g., the direction of the true equinox of the date, which is common to
 * both, through the true obliquity of the ecliptic of the date, ε:
 *
 * E = R1(ε)
 *
 * where ε is the mean obliquity of the ecliptic of IAU 2006 corrected for the nutation in
 * obliquity, e.g., ε₀ + Δε.
 *
 * N.B. The matrix is referred to the true equator and equinox of the date, e.g., a catalogue
 * coordinate is carried by the bias-precession-nutation matrix first, as E · N · P · B.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., Eᵀ carries an ecliptic coordinate of the
 * date back to the true equator and equinox of the date.
 *
 * @param datetime - The date to resolve the equatorial to ecliptic matrix for.
 * @returns The 3×3 equatorial to ecliptic matrix, in row-major order.
 *
 */
export function getEquatorialToEclipticMatrix(datetime: Date): Matrix3 {
  // The rotation about the x-axis through the true obliquity of the ecliptic of the date:
  return getRotationMatrix('x', getTrueObliquityOfTheEcliptic(datetime))
}

/*****************************************************************************************************************/

/**
 *
 * getEquatorialToHorizontalMatrix()
 *
 * Resolves the equatorial to horizontal matrix H, e.g., the transformation from the true equator
 * and equinox of the date to the horizontal frame of the observer, of (north, east, zenith), as
 * the product of the passive rotations of the frame through the Local Apparent Sidereal Time,
 * LAST, and the colatitude of the observer, 90° − φ, followed by the reflection of the x-axis, F:
 *
 * H = F · R2(90° − φ) · R3(LAST)
 *
 * where R3(LAST) carries the true equinox of the date to the meridian of the observer, R2(90° − φ)
 * carries the celestial pole to the zenith of the observer, e.g., onto a frame of (south, east,
 * zenith), and F = diag(−1, 1, 1) carries the south point to the north point.
 *
 * N.B. The horizontal frame of (north, east, zenith) is left-handed, e.g., the azimuth is measured
 * from the north point towards the east point, and so the matrix is a reflection, with a
 * determinant of −1, and not a rotation.
 *
 * N.B. The matrix is referred to the true equator and equinox of the date, e.g., a catalogue
 * coordinate is carried by the bias-precession-nutation matrix first, as H · N · P · B, and it
 * does not correct for the atmospheric refraction or the diurnal parallax of the target.
 *
 * N.B. The transpose of the matrix is its inverse, e.g., Hᵀ carries a horizontal coordinate back
 * to the true equator and equinox of the date.
 *
 * @param datetime - The date to resolve the equatorial to horizontal matrix for.
 * @param observer - The geographic coordinate of the observer.
 * @returns The 3×3 equatorial to horizontal matrix, in row-major order.
 *
 */
export function getEquatorialToHorizontalMatrix(
  datetime: Date,
  observer: GeographicCoordinate
): Matrix3 {
  const { latitude, longitude } = observer

  // Get the Local Apparent Sidereal Time (LAST) of the observer, converted from hours to degrees:
  const LAST = getLocalApparentSiderealTime(datetime, longitude) * 15

  // The reflection of the x-axis, e.g., from the south point to the north point of the horizon:
  const F: Matrix3 = [
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]

  // The rotation about the z-axis through the Local Apparent Sidereal Time is applied first, the
  // rotation about the y-axis through the colatitude of the observer second, and the reflection
  // last:
  return getMatrixProduct(
    F,
    getMatrixProduct(getRotationMatrix('y', 90 - latitude), getRotationMatrix('z', LAST))
  )
}

/*****************************************************************************************************************/
