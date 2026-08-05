/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/refraction
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { HorizontalCoordinate } from './common'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

// The altitude (in degrees) below which the approximation of the refraction is no longer
// resolved. Sæmundsson's formula is monotonic to ~-1°, below which it is no longer physical, and
// an object below it is below the apparent horizon whatever the refraction, e.g., the refraction
// at a true altitude of -0.57° is the ~34 arcminutes that places the object at the horizon.
const REFRACTION_ALTITUDE_FLOOR = -1

/*****************************************************************************************************************/

/**
 *
 * getRefraction()
 *
 * The refraction correction to the observed object is an adjustment to the observed object
 * based on pressure and temperature effects.
 *
 * N.B. There is no correction for the azimuthal angle.
 *
 * N.B. The refraction is resolved below the horizon, down to a true altitude of -1°: an object at
 * a true altitude of -0.57° is refracted to the horizon, which is why the Sun rises before it
 * crosses the horizon geometrically. Below -1° the approximation is no longer physical, and the
 * correction is taken to be zero, as getCorrectionToHorizontalForRefraction() likewise leaves such
 * an object uncorrected.
 *
 * @param target - The horizontal coordinate of the observed object.
 * @param temperature - The temperature in Kelvin.
 * @param pressure - The pressure in Pascals.
 * @returns The refraction correction to the observed object (in degrees).
 *
 */
export const getRefraction = (
  target: HorizontalCoordinate,
  temperature = 283.15,
  pressure = 101325
): number => {
  const { alt } = target

  // Below the floor of the approximation the refraction is not defined, and so the object is left
  // uncorrected:
  if (alt < REFRACTION_ALTITUDE_FLOOR) {
    return 0
  }

  // The pressure, in Pascals:
  const P = pressure

  // The temperature, in Kelvin:
  const T = temperature

  // Get the atmospheric refraction in degrees, corrected for temperature and pressure:
  const R = (1.02 / Math.tan(radians(alt + 10.3 / (alt + 5.11))) / 60) * (P / 101325) * (283.15 / T)

  return R
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToHorizontalForRefraction()
 *
 * The correction to the HorizontalCoordinate for refraction is an adjustment to the observed
 * HorizontalCoordinate based on pressure and temperature effects.
 *
 * @param target - The horizontal coordinate of the observed object.
 * @param temperature - The temperature in Kelvin.
 * @param pressure - The pressure in Pascals.
 * @returns The horizontal coordinate of the observed object corrected for atmospheric refraction.
 *
 */
export const getCorrectionToHorizontalForRefraction = (
  target: HorizontalCoordinate,
  temperature = 283.15,
  pressure = 101325
): HorizontalCoordinate => {
  const { alt, az } = target

  // Below the floor of the approximation the refraction is not defined, and so the object is left
  // uncorrected:
  if (alt < REFRACTION_ALTITUDE_FLOOR) {
    return target
  }

  // Get the atmospheric refraction in degrees, corrected for temperature and pressure:
  const R = getRefraction(target, temperature, pressure)

  return {
    alt: alt + R,
    az: az
  }
}

/*****************************************************************************************************************/

/**
 *
 * getAirmass()
 *
 * The airmass is the path length of light through the Earth's atmosphere. The airmass is a measure
 * of the amount of atmosphere that light must pass through to reach the observer. The airmass
 * is inversely proportional to the altitude of the observed object, and is at a minimum of ~1 at
 * the zenith, rising to ~38 at the horizon.
 *
 * @see Kasten, F., & Young, A. T. (1989). “Revised Optical Air Mass Tables and Approximation Formula.” Applied Optics, 28(22), 4735–4738.
 *
 * @param target - The horizontal coordinate of the observed object.
 * @returns the airmass of the observed object.
 *
 */
export const getAirmass = (target: HorizontalCoordinate): number => {
  const { alt } = target

  // Below the horizon the light path is not defined, so the airmass is infinite:
  if (alt < 0) {
    return Number.POSITIVE_INFINITY
  }

  // Get the airmass using the Kasten & Young (1989) approximation formula, where the
  // second term corrects for the curvature of the atmosphere at low altitudes:
  return 1 / (Math.sin(radians(alt)) + 0.50572 * (alt + 6.07995) ** -1.6364)
}

/*****************************************************************************************************************/

/**
 *
 * getAirRefractiveIndex()
 *
 * The refractive index of air is the ratio of the speed of light in a vacuum to the speed of
 * light in air. It is the quantity that gives rise to atmospheric refraction, and is dependent
 * on the wavelength of the observed light, as well as on the temperature, pressure and humidity
 * of the air the light is propagating through.
 *
 * N.B. The modified Edlén equation is valid for wavelengths between 300nm and 1700nm, for air
 * at a carbon dioxide concentration of 450 parts per million.
 *
 * @see Birch, K. P., & Downs, M. J. (1994). “Correction to the Updated Edlén Equation for the Refractive Index of Air.” Metrologia, 31(4), 315–316.
 *
 * @param wavelength - The wavelength of the observed light (in nanometres).
 * @param temperature - The temperature in Kelvin.
 * @param pressure - The pressure in Pascals.
 * @param humidity - The partial pressure of water vapour in the air (in Pascals).
 * @throws An error if any of the parameters are outside of the bounds of the equation.
 * @returns The refractive index of the air for the observed wavelength.
 *
 */
export const getAirRefractiveIndex = (
  wavelength = 550,
  temperature = 283.15,
  pressure = 101325,
  humidity = 0
): number => {
  // Outside of the bounds of the equation the dispersion terms are singular, and the
  // refractive index is no longer physical:
  if (!Number.isFinite(wavelength) || wavelength < 300 || wavelength > 1700) {
    throw new Error(
      'Invalid wavelength: wavelength must be finite and within [300, 1700] nanometres'
    )
  }

  // At zero Kelvin the temperature correction is singular, and below it is unphysical:
  if (!Number.isFinite(temperature) || temperature <= 0) {
    throw new Error('Invalid temperature: temperature must be finite and greater than zero Kelvin')
  }

  if (!Number.isFinite(pressure) || pressure < 0) {
    throw new Error('Invalid pressure: pressure must be finite and at least zero Pascals')
  }

  // The partial pressure of water vapour is a component of the total pressure of the air:
  if (!Number.isFinite(humidity) || humidity < 0 || humidity > pressure) {
    throw new Error(
      'Invalid humidity: humidity must be finite, at least zero Pascals and no greater than the pressure'
    )
  }

  // The temperature, in degrees Celsius:
  const t = temperature - 273.15

  // The vacuum wavenumber of the observed light, in inverse micrometres:
  const σ = 1000 / wavelength

  // Get the refractivity of standard air, e.g., dry air at 15°C and 101325 Pascals, as the
  // dispersion of the air is dependent on the wavelength of the observed light:
  const N = (8342.54 + 2406147 / (130 - σ ** 2) + 15998 / (38.9 - σ ** 2)) * 1e-8

  // Correct the refractivity of standard air for the temperature and pressure of the air:
  const n =
    (N * (pressure * (1 + pressure * (60.1 - 0.972 * t) * 1e-10))) / (96095.43 * (1 + 0.003661 * t))

  // Correct the refractivity for the partial pressure of water vapour in the air, which
  // reduces the refractive index of the air:
  return 1 + n - humidity * (3.7345 - 0.0401 * σ ** 2) * 1e-10
}

/*****************************************************************************************************************/
