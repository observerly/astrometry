/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constants
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

/**
 *
 * The approximateed average radius of the Earth in meters.
 *
 */
export const EARTH_RADIUS = 6.378e6 as const

/*****************************************************************************************************************/

export const SECONDS_IN_HOUR = 3600

/*****************************************************************************************************************/

export const SECONDS_IN_DAY = 86400

/*****************************************************************************************************************/

export const SECONDS_IN_YEAR = 31556925.445

/*****************************************************************************************************************/

/**
 *
 * The previous standard epoch "J1900" was defined by international agreement to
 * be equivalent to: The Gregorian date January 0.5, 1900, at 12:00 TT (Terrestrial Time),
 * equivalent to noon on December 31, 1899.
 *
 * The Julian date 2415020.0 TT (Terrestrial Time).
 *
 */
export const J1900 = 2415020.0 as const

/*****************************************************************************************************************/

/**
 *
 * The standard epoch "J1970" is defined by international agreement to be equivalent
 * to: The Gregorian date January 1, 1970, at 00:00 TT (Terrestrial Time).
 *
 * The Julian date 2440587.5 TT (Terrestrial Time).
 *
 * This is useful because it is the "epoch" referenced to the Unix 0 time system. The
 * Unix time 0 is exactly midnight UTC on 1 January 1970, with Unix time incrementing
 * by 1 for every non-leap second after this.
 *
 */
export const J1970 = 2440587.5 as const

/*****************************************************************************************************************/

/**
 *
 * The currently-used standard epoch "J2000" is defined by international agreement to
 * be equivalent to: The Gregorian date January 1, 2000, at 12:00 TT (Terrestrial Time).
 *
 * The Julian date 2451545.0 TT (Terrestrial Time).
 *
 */
export const J2000 = 2451545.0 as const

/*****************************************************************************************************************/
