/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/twilight
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/


export enum Twilight {
  /**
   *
   * Night - The time when the sun is -18 degrees below the horizon.
   *
   */
  Night = 'Night',
  /**
   *
   * Astronomical - The time when the sun is between -12 and -18 degrees below the horizon.
   *
   */
  Astronomical = 'Astronomical',
  /**
   *
   * Nautical - The time when the sun is between -6 and -12 degrees below the horizon.
   *
   */
  Nautical = 'Nautical',
  /**
   *
   * Civil - The time when the sun is between 0 and -6 degrees below the horizon.
   *
   */
  Civil = 'Civil',
  /**
   *
   * Day - The time when the sun is above the horizon.
   *
   */
  Day = 'Day'
}

/*****************************************************************************************************************/


const getWhatTwilight = (altitude: number) => {
  switch (true) {
    case altitude < -18:
      return Twilight.Night
    case altitude < -12:
      return Twilight.Astronomical
    case altitude < -6:
      return Twilight.Nautical
    case altitude < 0:
      return Twilight.Civil
    default:
      return Twilight.Day
  }
}

/*****************************************************************************************************************/
/*****************************************************************************************************************/
