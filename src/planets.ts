/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/planets
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

export type Planet = {
  /**
   *
   *
   * Some unique identifier for the planet.
   *
   */
  uid: string
  /**
   *
   *
   * The common, wsternised name of the planet.
   *
   */
  name: 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'
  /**
   *
   *
   * The "astrological" symbol for the planet.
   *
   */
  symbol: '☿' | '♀' | '♁' | '♂' | '♃' | '♄' | '♅' | '♆'
  /**
   *
   *
   * The planet's orbital period in tropical years.
   *
   */
  T: number
  /**
   *
   *
   * The planet's mass relative to Earth.
   *
   */
  m: number
  /**
   *
   *
   * The planet's radius relative to Earth.
   *
   */
  r: number
  /**
   *
   *
   * The planet's eccentricity.
   *
   */
  e: number
  /**
   *
   *
   * The planet's semi-major axis in AU.
   *
   */
  a: number
  /**
   *
   *
   * The planet's inclination in degrees.
   *
   */
  i: number
  /**
   *
   *
   * The planet's ecliptical longitude at epoch in degrees.
   *
   */
  ε: number
  /**
   *
   *
   * The planet's ecliptical longitude at perihelion in degrees.
   *
   */
  ϖ: number
  /**
   *
   *
   * The planet's ecliptical longitude of ascending node at epoch in degrees.
   *
   */
  Ω: number
  /**
   *
   *
   * Whether the planet is inferior.
   *
   */
  isInferior?: boolean
}

/*****************************************************************************************************************/
