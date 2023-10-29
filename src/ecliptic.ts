/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type EquatorialCoordinate } from './common'

import { getSolarEquatorialCoordinate } from './sun'

/*****************************************************************************************************************/

/**
 *
 * getEclipticPlane()
 *
 * @param date - The date to calculate the ecliptic plane for.
 * @returns The ecliptic plane at the given date.
 *
 */
export const getEclipticPlane = (date: Date): EquatorialCoordinate[] => {
  const ecliptic = [] as EquatorialCoordinate[]

  // Get the current year start date:
  const start = new Date(date.getFullYear(), 0, 1)

  // Get the current year end date:
  const end = new Date(date.getFullYear() + 1, 0, 1)

  // Loop over all days between the start and end dates:
  for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
    ecliptic.push(getSolarEquatorialCoordinate(day))
  }

  return ecliptic
}

/*****************************************************************************************************************/
