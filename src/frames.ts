/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/frames
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { Matrix3 } from './common'

import { getMatrixProduct, getRotationMatrix } from './maths'

import { getNutationMatrix, getTrueObliquityOfTheEcliptic } from './nutation'

import { getFrameBiasMatrix, getPrecessionMatrix } from './precession'

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
export const getBiasPrecessionNutationMatrix = (datetime: Date): Matrix3 => {
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
export const getEquatorialToEclipticMatrix = (datetime: Date): Matrix3 => {
  // The rotation about the x-axis through the true obliquity of the ecliptic of the date:
  return getRotationMatrix('x', getTrueObliquityOfTheEcliptic(datetime))
}

/*****************************************************************************************************************/
