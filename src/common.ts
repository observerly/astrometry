/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/common
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

export type EquatorialCoordinate = {
  /**
   *
   *
   * The right ascension of a celestial object is the angular distance measured
   * eastward along the celestial equator from the Sun at the March equinox to
   * the (hour circle of the) point above the earth in question.
   *
   *
   */
  ra: number
  /**
   *
   *
   * The declination of a celestial object is the angular distance measured
   * north or south of the celestial equator along the hour circle passing
   * through the point in question.
   *
   *
   */
  dec: number
}

/*****************************************************************************************************************/
