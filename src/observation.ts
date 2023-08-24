/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observation
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getCorrectionToEquatorialForAbberation } from './abberation'

import { getHourAngle } from './astrometry'

import { type EquatorialCoordinate, type HorizontalCoordinate, type Observer } from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getCorrectionToEquatorialForNutation } from './nutation'

import { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

/*****************************************************************************************************************/

/**
 *
 *
 * @class new Observation()
 *
 * @description A class to represent an observation of an astronomical target { ra, dec } at a specific
 * location (geographic longitude, latitude and elevation above sea level) and datetime (in Universal
 * Coordinated Time, UTC) on Earth.
 *
 *
 */
export class Observation extends Object {
  // The initial target coordinate in epoch J2000 (ICRS) reference frame:
  public target: EquatorialCoordinate = {
    ra: -Infinity,
    dec: -Infinity
  }

  // The Right Ascension in the current epoch:
  public ra: number = -Infinity

  // The Declination in the current epoch:
  public dec: number = -Infinity

  public az: number = -Infinity

  public alt: number = -Infinity

  public ha: number = -Infinity

  public datetime: Date = new Date()

  public longitude: number = -Infinity

  public latitude: number = -Infinity

  constructor({ ra = -Infinity, dec = -Infinity }: EquatorialCoordinate, observer?: Observer) {
    super()

    const { datetime, longitude, latitude } = observer || {
      datetime: new Date(),
      longitude: 0,
      latitude: 0
    }

    this.setDatetime(datetime)
    this.setLongitude(longitude)
    this.setLatitude(latitude)

    // Set the target coordinates to the equatorial coordinates:
    this.target = {
      ra,
      dec
    }

    // Update the equatorial coordinates:
    this.setEquatorialCoordinates({
      ra,
      dec
    })

    this.setHourAngle()

    this.setHorizontalCoordinates(
      convertEquatorialToHorizontal(
        datetime,
        {
          longitude: this.longitude,
          latitude: this.latitude
        },
        {
          ra: this.ra,
          dec: this.dec
        }
      )
    )
  }

  public at({ datetime }: { datetime: Date }) {
    if (datetime) {
      this.setDatetime(datetime)
    }

    this.setEquatorialCoordinates(this.target)

    this.setHorizontalCoordinates(
      convertEquatorialToHorizontal(
        this.datetime,
        {
          longitude: this.longitude,
          latitude: this.latitude
        },
        {
          ra: this.ra,
          dec: this.dec
        }
      )
    )
  }

  public setDatetime(datetime: Date) {
    // Ensure datetime is in UTC:
    this.datetime = new Date(
      Date.UTC(
        datetime.getUTCFullYear(),
        datetime.getUTCMonth(),
        datetime.getUTCDate(),
        datetime.getUTCHours(),
        datetime.getUTCMinutes(),
        datetime.getUTCSeconds(),
        datetime.getUTCMilliseconds()
      )
    )
  }

  private setEquatorialCoordinates(target: EquatorialCoordinate) {
    const abberation = getCorrectionToEquatorialForAbberation(this.datetime, target)

    const nutation = getCorrectionToEquatorialForNutation(this.datetime, target)

    const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(this.datetime, target)

    this.ra = target.ra + abberation.ra + nutation.ra + precession.ra
    this.dec = target.dec + abberation.dec + nutation.dec + precession.dec
  }

  private setHourAngle() {
    this.ha = getHourAngle(this.datetime, this.longitude, this.ra)
  }

  private setHorizontalCoordinates(target: HorizontalCoordinate) {
    const { az, alt } = target
    this.az = az
    this.alt = alt
  }

  private setLongitude(longitude: number) {
    this.longitude = longitude
  }

  private setLatitude(latitude: number) {
    this.latitude = latitude
  }
}

/*****************************************************************************************************************/
