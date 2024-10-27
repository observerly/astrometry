/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observation
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getCorrectionToEquatorialForAbberation } from './abberation'

import { getHourAngle } from './astrometry'

import type { EquatorialCoordinate, HorizontalCoordinate, Observer } from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getCorrectionToEquatorialForNutation } from './nutation'

import { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

import { getNormalizedAzimuthalDegree, getNormalizedInclinationDegree } from './utilities'

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
    ra: Number.NEGATIVE_INFINITY,
    dec: Number.NEGATIVE_INFINITY
  }

  // The Right Ascension in the current epoch:
  public ra = Number.NEGATIVE_INFINITY

  // The Declination in the current epoch:
  public dec = Number.NEGATIVE_INFINITY

  public az = Number.NEGATIVE_INFINITY

  public alt = Number.NEGATIVE_INFINITY

  public ha = Number.NEGATIVE_INFINITY

  public datetime: Date = new Date()

  public longitude = Number.NEGATIVE_INFINITY

  public latitude = Number.NEGATIVE_INFINITY

  constructor({ ra = Number.NEGATIVE_INFINITY, dec = Number.NEGATIVE_INFINITY }: EquatorialCoordinate, observer?: Observer) {
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

    const α = target.ra + abberation.ra + nutation.ra + precession.ra

    const δ = target.dec + abberation.dec + nutation.dec + precession.dec

    // Ensure the Right Ascension is normalized to the range [0, 360):
    this.ra = getNormalizedAzimuthalDegree(α)
    // Ensure the declination is normalized to the range [-90, 90]:
    this.dec = getNormalizedInclinationDegree(δ)
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
