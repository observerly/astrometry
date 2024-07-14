/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/eclipse
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

/**
 * The different types of lunar and solar eclipses.
 *
 * @readonly
 * @enum {string}
 *
 */
export enum EclipseType {
  /**
   *
   * @member {string} Penumbral
   *
   * A lunar eclipse in which only the Earth's penumbra falls on the Moon.
   *
   */
  Penumbral = 'penumbral',
  /**
   *
   * @member {string} Partial
   *
   * A partial lunar/solar eclipse.
   *
   */
  Partial = 'partial',
  /**
   *
   * @member {string} Annular
   *
   * A solar eclipse in which the entire Moon is visible against the Sun,
   * but the Sun appears as a ring around the Moon.
   *
   * N.B. Never used for a lunar eclipse.
   *
   */
  Annular = 'annular',
  /**
   *
   * @member {string} Total
   *
   * A total lunar/solar eclipse.
   *
   */
  Total = 'total'
}

/*****************************************************************************************************************/
