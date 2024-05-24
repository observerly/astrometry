/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/iers
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

// The current Unix timestamp for the expiry of the current IERS leap second table.
// This is when we should next check for an updated table.
export const CURRENT_EXPIRY_UNIX_TIMESTAMP = new Date(2024, 12, 28).getTime()

/*****************************************************************************************************************/

interface IERS_LEAP_SECONDS_NTP {
  /**
   *
   *
   * The ntp timestamp is the number of seconds since 1st Jan 1900 as defined by the
   * International Earth Rotation and Reference Systems Service (IERS) when the
   * leap second was added to the UTC time scale.
   *
   */
  ntp: number
  /**
   *
   *
   * The corresponding Unix timestamp is the number of seconds since 1st Jan 1970
   * when the leap second was added to the UTC time scale.
   *
   *
   */
  unix: number
  /**
   *
   *
   * DTAI is the difference between TAI and UTC, and is the number of seconds that
   * the UTC time scale is ahead of TAI.
   *
   */
  dtai: number

  when: Date
}

/*****************************************************************************************************************/

/**
 *
 * Leap seconds are added to the UTC time scale to keep it within 0.9 seconds of UT1 and
 * are announced by the International Earth Rotation and Reference Systems Service (IERS).
 *
 *
 * @see https://data.iana.org/time-zones/data/leap-seconds.list
 *
 */
const getLeapSeconds = () => {
  // Log a warning if the current leap seconds table is out of date according
  // to the IERS expiry date.
  if (Date.now() > CURRENT_EXPIRY_UNIX_TIMESTAMP) {
    console.warn('The current IERS leap seconds table is out of date. Please update it.')
  }

  return [
    {
      ntp: 2272060800,
      unix: 63072000000,
      dtai: 10,
      when: new Date(63072000000)
    },
    {
      ntp: 2287785600,
      unix: 78796800000,
      dtai: 11,
      when: new Date(78796800000)
    },
    {
      ntp: 2303683200,
      unix: 94694400000,
      dtai: 12,
      when: new Date(94694400000)
    },
    {
      ntp: 2335219200,
      unix: 126230400000,
      dtai: 13,
      when: new Date(126230400000)
    },
    {
      ntp: 2366755200,
      unix: 157766400000,
      dtai: 14,
      when: new Date(157766400000)
    },
    {
      ntp: 2398291200,
      unix: 189302400000,
      dtai: 15,
      when: new Date(189302400000)
    },
    {
      ntp: 2429913600,
      unix: 220924800000,
      dtai: 16,
      when: new Date(220924800000)
    },
    {
      ntp: 2461449600,
      unix: 252460800000,
      dtai: 17,
      when: new Date(252460800000)
    },
    {
      ntp: 2492985600,
      unix: 283996800000,
      dtai: 18,
      when: new Date(283996800000)
    },
    {
      ntp: 2524521600,
      unix: 315532800000,
      dtai: 19,
      when: new Date(315532800000)
    },
    {
      ntp: 2571782400,
      unix: 362793600000,
      dtai: 20,
      when: new Date(362793600000)
    },
    {
      ntp: 2603318400,
      unix: 394329600000,
      dtai: 21,
      when: new Date(394329600000)
    },
    {
      ntp: 2634854400,
      unix: 425865600000,
      dtai: 22,
      when: new Date(425865600000)
    },
    {
      ntp: 2698012800,
      unix: 489024000000,
      dtai: 23,
      when: new Date(489024000000)
    },
    {
      ntp: 2776982400,
      unix: 567993600000,
      dtai: 24,
      when: new Date(567993600000)
    },
    {
      ntp: 2840140800,
      unix: 631152000000,
      dtai: 25,
      when: new Date(631152000000)
    },
    {
      ntp: 2871676800,
      unix: 662688000000,
      dtai: 26,
      when: new Date(662688000000)
    },
    {
      ntp: 2918937600,
      unix: 709948800000,
      dtai: 27,
      when: new Date(709948800000)
    },
    {
      ntp: 2950473600,
      unix: 741484800000,
      dtai: 28,
      when: new Date(741484800000)
    },
    {
      ntp: 2982009600,
      unix: 773020800000,
      dtai: 29,
      when: new Date(773020800000)
    },
    {
      ntp: 3029443200,
      unix: 820454400000,
      dtai: 30,
      when: new Date(820454400000)
    },
    {
      ntp: 3076704000,
      unix: 867715200000,
      dtai: 31,
      when: new Date(867715200000)
    },
    {
      ntp: 3124137600,
      unix: 915148800000,
      dtai: 32,
      when: new Date(915148800000)
    },
    {
      ntp: 3345062400,
      unix: 1136073600000,
      dtai: 33,
      when: new Date(1136073600000)
    },
    {
      ntp: 3439756800,
      unix: 1230768000000,
      dtai: 34,
      when: new Date(1230768000000)
    },
    {
      ntp: 3550089600,
      unix: 1341100800000,
      dtai: 35,
      when: new Date(1341100800000)
    },
    {
      ntp: 3644697600,
      unix: 1435708800000,
      dtai: 36,
      when: new Date(1435708800000)
    },
    {
      ntp: 3692217600,
      unix: 1483228800000,
      dtai: 37,
      when: new Date(1483228800000)
    }
  ] as const satisfies IERS_LEAP_SECONDS_NTP[]
}

/*****************************************************************************************************************/

// We return a function to ensure a warning is logged if the leap seconds table is out of date.
export const LEAP_SECONDS = getLeapSeconds()

/*****************************************************************************************************************/
