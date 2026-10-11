/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/gravity
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

/**
 *
 * A gravity model is the set of constants that describe the gravitational field of the Earth to the
 * degree that an analytic orbit propagator, e.g., SGP4, resolves it: the gravitational parameter of
 * the Earth, its equatorial radius, and the zonal harmonics J2, J3 and J4 of its field, which carry
 * its oblateness and its asymmetry between the northern and the southern hemispheres.
 *
 * The constants of each model are those of a World Geodetic System (WGS), e.g., a standard of the
 * United States Department of Defense, which defines a reference frame for the Earth, an ellipsoid
 * of its figure, and a model of its gravitational field, e.g., WGS 72 of 1972 and WGS 84 of 1984.
 *
 * N.B. The constants of a model are read-only, as a model is shared by every propagation that is
 * resolved with it, and a constant reassigned by one caller would displace the propagations of
 * every other caller without notice.
 *
 * N.B. The constants are given in the units the SGP4 theory is defined in, e.g., kilometres and
 * seconds, and not in SI metres, so that they are the constants of the theory exactly, and not a
 * conversion of them, which would displace the propagation from that of the reference
 * implementation by the rounding of the conversion.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export type GravityModel = {
  /**
   *
   * The gravitational parameter of the Earth, μ = GM, e.g., the product of the gravitational
   * constant and the mass of the Earth (in km³/s²).
   *
   */
  readonly μ: number
  /**
   *
   * The equatorial radius of the Earth, e.g., the semi-major axis of the ellipsoid of the model (in
   * kilometres), which is the unit of distance of the SGP4 theory, e.g., the Earth radius.
   *
   */
  readonly radius: number
  /**
   *
   * The square root of the gravitational parameter of the Earth, in the canonical units of the SGP4
   * theory, e.g., of Earth radii and minutes (in Earth radii^(3/2) per minute), such that the
   * mean motion of an orbit of a semi-major axis of a, in Earth radii, is xke / a^(3/2).
   *
   * N.B. It is resolved from the gravitational parameter and the equatorial radius of the model,
   * e.g., 60 / √(radius³ / μ), other than for a model that defines it directly, e.g., WGS 72 of the
   * original Spacetrack Report #3, whose value it was given as.
   *
   */
  readonly xke: number
  /**
   *
   * The second zonal harmonic of the gravitational field of the Earth (dimensionless), e.g., the
   * oblateness of the Earth, which precesses the plane and the perigee of an orbit.
   *
   */
  readonly J2: number
  /**
   *
   * The third zonal harmonic of the gravitational field of the Earth (dimensionless), e.g., the
   * asymmetry of the Earth between its northern and southern hemispheres, its "pear shape".
   *
   */
  readonly J3: number
  /**
   *
   * The fourth zonal harmonic of the gravitational field of the Earth (dimensionless).
   *
   */
  readonly J4: number
}

/*****************************************************************************************************************/
