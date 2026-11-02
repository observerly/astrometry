/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/galactic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { Matrix3 } from './common'

import { getMatrixProduct, getRotationMatrix } from './maths'

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
export const getEquatorialToGalacticMatrix = (): Matrix3 => {
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
