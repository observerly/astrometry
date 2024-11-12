/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/wcs
// @license        Copyright © 2021-2025 observerly

/*****************************************************************************************************************/

export type {}
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
