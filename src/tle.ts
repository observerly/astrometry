/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

/**
 *
 * A two-line element set (TLE) is the mean orbital elements of an Earth-orbiting object at an epoch,
 * as are published by the United States Space Force, e.g., by Space-Track and CelesTrak, in the
 * fixed-column format of two lines of 69 characters each.
 *
 * N.B. The elements are mean elements, e.g., the Kozai mean elements of the SGP4 theory they are
 * fitted against, and not osculating elements, and so they are only meaningful when they are
 * propagated by that same theory, e.g., SGP4, and not by a Keplerian orbit.
 *
 * N.B. The elements are given in the units of the format itself, e.g., degrees for the angles and
 * revolutions per day for the mean motion, and it is the propagator that converts them to the
 * units it works in.
 *
 * @see https://celestrak.org/columns/v04n03/
 *
 */
export type TwoLineElement = {
  /**
   *
   * The satellite catalogue number of the object, e.g., the NORAD ID, which is decoded from the
   * Alpha-5 scheme where it exceeds 99,999, e.g., "A0001" is 100001.
   *
   */
  satellite: number
  /**
   *
   * The security classification of the element set, e.g., "U" for unclassified, "C" for
   * classified, or "S" for secret.
   *
   */
  classification: 'U' | 'C' | 'S'
  /**
   *
   * The international designator of the object, e.g., the COSPAR ID, in the abbreviated form of the
   * last two digits of the launch year, the launch number of that year, and the piece of the
   * launch, e.g., "98067A" for the first piece of the 67th launch of 1998.
   *
   * N.B. The designator is empty for an object that was not assigned one, e.g., an analyst object.
   *
   */
  designator: string
  /**
   *
   * The epoch of the element set, as a Julian date in Coordinated Universal Time (UTC).
   *
   * N.B. The epoch is resolved to the ~0.9 milliseconds that the eight decimal places of the
   * fractional day of the format resolve, which a Date, of a millisecond resolution, would not
   * carry exactly.
   *
   */
  epoch: number
  /**
   *
   * The first time derivative of the mean motion divided by two, ṅ/2 (in revolutions per day²),
   * e.g., the "ballistic coefficient" of the format.
   *
   * N.B. SGP4 does not use the term, which is carried for the older SGP model it was fitted for.
   *
   */
  ndot: number
  /**
   *
   * The second time derivative of the mean motion divided by six, n̈/6 (in revolutions per day³).
   *
   * N.B. SGP4 does not use the term, which is carried for the older SGP model it was fitted for.
   *
   */
  nddot: number
  /**
   *
   * The B* drag term of the element set (in inverse Earth radii), e.g., the radiation pressure
   * coefficient of the SGP4 theory, which scales the atmospheric drag on the object.
   *
   */
  bstar: number
  /**
   *
   * The ephemeris type of the element set, which is 0 for every element set that is published,
   * e.g., the elements of the SGP4 theory.
   *
   */
  ephemeris: number
  /**
   *
   * The element set number, e.g., the count of the element sets that have been generated for the
   * object, which is incremented as each new element set is generated for it.
   *
   */
  element: number
  /**
   *
   * The inclination of the orbit (in degrees), e.g., the angle between the plane of the orbit and
   * the plane of the equator, in the range [0, 180].
   *
   */
  i: number
  /**
   *
   * The right ascension of the ascending node of the orbit (in degrees), e.g., the angle from the
   * vernal equinox to the point at which the object crosses the equator northward, in the range
   * [0, 360).
   *
   */
  Ω: number
  /**
   *
   * The eccentricity of the orbit (dimensionless), in the range [0, 1).
   *
   */
  e: number
  /**
   *
   * The argument of perigee of the orbit (in degrees), e.g., the angle from the ascending node to
   * the perigee, in the plane of the orbit, in the range [0, 360).
   *
   */
  ω: number
  /**
   *
   * The mean anomaly of the object at the epoch (in degrees), in the range [0, 360).
   *
   */
  M: number
  /**
   *
   * The mean motion of the object (in revolutions per day), e.g., the Kozai mean motion of the
   * SGP4 theory.
   *
   */
  n: number
  /**
   *
   * The revolution number of the object at the epoch, e.g., the count of the orbits it has made
   * since launch, modulo 100,000 in the five columns of the format.
   *
   */
  revolution: number
}

/*****************************************************************************************************************/

/**
 *
 * convertAlpha5ToSatelliteNumber()
 *
 * Converts a satellite catalogue number of the Alpha-5 scheme to the number it encodes, e.g., the
 * scheme by which the five columns of the format carry a catalogue number that exceeds 99,999.
 *
 * A catalogue number of up to 99,999 is given as its five digits. One that exceeds it is given as a
 * letter for its ten-thousands, followed by four digits for the remainder, where the letters "A"
 * to "Z" stand for 10 to 33, e.g., "A0001" is 100001 and "Z9999" is 339999, the greatest catalogue
 * number the scheme carries.
 *
 * N.B. The letters "I" and "O" are omitted from the scheme, so that they are not mistaken for the
 * digits "1" and "0", and so the letters that follow them are displaced, e.g., "J" stands for 18
 * and "P" stands for 23.
 *
 * @param alpha5 - The satellite catalogue number of the Alpha-5 scheme, e.g., "25544" or "A0001".
 * @throws An error if the catalogue number is not of the Alpha-5 scheme.
 * @returns The satellite catalogue number it encodes, e.g., 25544 or 100001.
 *
 */
export const convertAlpha5ToSatelliteNumber = (alpha5: string): number => {
  // The columns of the format are fixed, and so a catalogue number of fewer than five digits may
  // be padded with spaces, rather than with zeros, e.g., " 4632":
  const value = alpha5.trim()

  // A catalogue number of up to 99,999 is given as its digits alone:
  if (/^\d{1,5}$/.test(value)) {
    return Number(value)
  }

  // A catalogue number that exceeds 99,999 is given as a letter, other than "I" or "O", for its
  // ten-thousands, followed by four digits for the remainder:
  if (!/^[A-HJ-NP-Z]\d{4}$/.test(value)) {
    throw new Error(`Invalid satellite number: "${alpha5}" is not of the Alpha-5 scheme`)
  }

  const letter = value[0]

  // The letters stand for the ten-thousands from 10 onwards, in order, less the "I" and the "O"
  // that are omitted before them:
  const prefix =
    letter.charCodeAt(0) - 'A'.charCodeAt(0) + 10 - (letter > 'I' ? 1 : 0) - (letter > 'O' ? 1 : 0)

  return prefix * 10000 + Number(value.slice(1))
}

/*****************************************************************************************************************/
