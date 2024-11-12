/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/wcs
// @license        Copyright © 2021-2025 observerly

/*****************************************************************************************************************/

import type { CartesianCoordinate, EquatorialCoordinate } from './common'

/*****************************************************************************************************************/

// SIP (Simple Imaging Polynomial) is a convention used in FITS (Flexible Image Transport System)
// headers to describe complex distortions in astronomical images. It extends the standard World
// Coordinate System (WCS) by introducing higher-order polynomial terms that account for non-linear
// optical distortions, such as those introduced by telescope optics or atmospheric effects.
// @see https://fits.gsfc.nasa.gov/registry/sip/SIP_distortion_v1_0.pdf
export type SIP2DParameters = {
  AOrder: number
  APower: { [key: string]: number }
  BOrder: number
  BPower: { [key: string]: number }
}

/*****************************************************************************************************************/

// Helper function to parse SIP terms like "A_0_1" and extract i, j values
export const parseSIPTerm = (term: string, prefix: 'A' | 'B'): [number, number] | null => {
  const match = term.match(`^${prefix}_(\\d+)_(\\d+)$`)
  return match ? [Number.parseInt(match[1], 10), Number.parseInt(match[2], 10)] : null
}

/*****************************************************************************************************************/

export type WCS = {
  /**
   *
   *
   * The central or reference pixel for the WCS, e.g., the central pixel of the image.
   *
   *
   */
  crpix: CartesianCoordinate
  /**
   *
   *
   * The central or reference equatorial coordinate for the WCS, corresponding to the pixel at the central reference pixel.
   *
   *
   */
  crval: EquatorialCoordinate
  // CD matrix elements for the WCS (correponding to the affine transformation matrix):
  /**
   *
   *
   * CD Matrix Element 1,1 for the WCS
   *
   *
   */
  cd11: number
  /**
   *
   *
   * CD Matrix Element 1,2 for the WCS
   *
   *
   */
  cd12: number
  /**
   *
   *
   * CD Matrix Element 2,1 for the WCS
   *
   *
   */
  cd21: number
  /**
   *
   *
   * CD Matrix Element 2,2 for the WCS
   *
   *
   */
  cd22: number
  /**
   *
   *
   * Constant term for the right ascension (from the Affine transformation matrix)
   *
   *
   */
  E: number
  /**
   *
   *
   * Constant term for the declination (from the Affine transformation matrix)
   *
   *
   */
  F: number
  // Non-linear correction terms (corresponding to SIP corrections):
  /**
   *
   *
   * SIP (Simple Imaging Polynomial) parameters for the WCS
   *
   *
   */
  SIP?: SIP2DParameters
}


/*****************************************************************************************************************/
