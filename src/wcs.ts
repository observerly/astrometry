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

/**
 *
 * convertPixelToWorldCoordinateSystem
 *
 * Converts a given image pixel to an equatorial coordinate base on the prescribed WCS
 *
 * @param wcs the World Coordinate System (WCS) parameters to use for the conversion
 * @param pixel the pixel to convert to an equatorial coordinate, e.g., { x: 0, y: 0 }
 * @returns the equatorial coordinate of a given pixel in the prescribed WCS
 */
export const convertPixelToWorldCoordinateSystem = (
  wcs: WCS,
  pixel: CartesianCoordinate
): EquatorialCoordinate => {
  // Calculate the pixel delta in the X dimension relative to central reference pixel:
  let deltaX = pixel.x - wcs.crpix.x

  // Calculate the pixel delta in the Y dimension relative to central reference pixel:
  let deltaY = pixel.y - wcs.crpix.y

  // Initialize SIP correction terms for A and B:
  let A = 0
  let B = 0

  // Apply SIP polynomial corrections if SIP parameters are defined
  if (wcs.SIP) {
    // Apply A polynomial corrections:
    for (const term in wcs.SIP.APower) {
      const coeff = wcs.SIP.APower[term]
      const indices = parseSIPTerm(term, 'A')
      if (indices) {
        const [i, j] = indices
        A += coeff * deltaX ** i * deltaY ** j
      }
    }

    // Apply B polynomial corrections:
    for (const term in wcs.SIP.BPower) {
      const coeff = wcs.SIP.BPower[term]
      const indices = parseSIPTerm(term, 'B')
      if (indices) {
        const [i, j] = indices
        B += coeff * deltaX ** i * deltaY ** j
      }
    }
  }

  // Apply forward SIP transformation to correct for non-linear distortions:
  deltaX += A
  deltaY += B

  // Calculate the reference equatorial coordinate for the right ascension:
  let ra = wcs.cd11 * deltaX + wcs.cd12 * deltaY + wcs.E

  // Correct for large values of RA:
  ra = ra % 360

  // Correct for negative values of RA:
  if (ra < 0) {
    ra += 360
  }

  // Calculate the reference equatorial coordinate for the declination:
  let dec = wcs.cd21 * deltaX + wcs.cd22 * deltaY + wcs.F

  // Correct for large values of DEC:
  dec = dec % 90

  return {
    ra,
    dec
  }
}

/*****************************************************************************************************************/
