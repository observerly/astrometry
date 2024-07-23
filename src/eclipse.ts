/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/eclipse
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type HorizontalCoordinate, type Interval } from './common'

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
  Total = 'total',
  /**
   *
   * @member {string} AnnularTotal
   *
   *
   * N.B. Never used for a lunar eclipse.
   *
   */
  AnnularTotal = 'annular-total'
}

/*****************************************************************************************************************/

/**
 *
 * A representation of a lunar or solar eclipse.
 *
 */
export type Eclipse = {
  /**
   *
   * @member {enum} EclipseType
   *
   * The type of the eclipse, e.g., "total", "annular", "partial", or "penumbral".
   *
   */
  type: EclipseType
  /**
   *
   *
   * @member {Interval} interval
   *
   * When the eclipse begins and ends.
   *
   */
  interval: Interval
  /**
   *
   * @member {Date} maximum
   *
   * When the maximum of the eclipse occurs.
   *
   */
  maximum: Date
} & HorizontalCoordinate

/*****************************************************************************************************************/
