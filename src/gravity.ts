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

/**
 *
 * WGS72OLD
 *
 * The gravity model of the World Geodetic System 1972 (WGS 72), as the original implementation of
 * Spacetrack Report #3 of 1980 carried it, e.g., with the constant xke given directly, to ten
 * decimal places, rather than resolved from the gravitational parameter and the equatorial radius
 * of the model, and with the gravitational parameter that is consistent with it.
 *
 * It is retained so that a propagation may reproduce that of an older implementation of SGP4 that
 * carries these constants, e.g., for a comparison against its published results, and it is not to
 * be preferred over { WGS72 } otherwise.
 *
 * N.B. The two differ in xke by ~4.5 parts in 10¹⁰, which scales the semi-major axis of an orbit,
 * but not the mean motion it is propagated with, and so it displaces a propagation by a constant
 * that does not grow with time, e.g., ~2 millimetres in a low Earth orbit and ~1 centimetre in a
 * geostationary orbit, as measured against the reference implementation.
 *
 * N.B. The model is frozen, as it is shared by every propagation that is resolved with it.
 *
 * @see Hoots, F. R., & Roehrich, R. L. (1980), "Spacetrack Report No. 3: Models for Propagation of NORAD Element Sets".
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export const WGS72OLD: GravityModel = Object.freeze({
  μ: 398600.79964,
  radius: 6378.135,
  xke: 0.0743669161,
  J2: 0.001082616,
  J3: -0.00000253881,
  J4: -0.00000165597
})

/*****************************************************************************************************************/

/**
 *
 * WGS72
 *
 * The gravity model of the World Geodetic System 1972 (WGS 72), e.g., the third of the World
 * Geodetic Systems of the United States Department of Defense, which succeeded WGS 66, and which
 * was itself succeeded by WGS 84.
 *
 * It is the gravity model that the two-line element sets of the United States Space Force are
 * fitted with, and so it is the model that an element set is to be propagated with, e.g., the mean
 * elements of an element set are fitted to the SGP4 theory evaluated with these constants, and an
 * element set propagated with the constants of any other model is displaced from the orbit it was
 * fitted to, however much more modern that model is.
 *
 * N.B. The constant xke is resolved from the gravitational parameter and the equatorial radius of
 * the model, in the same order of operations as the reference implementation resolves it, so that
 * it is the constant of the reference implementation to the last bit.
 *
 * N.B. The model is frozen, as it is shared by every propagation that is resolved with it.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export const WGS72: GravityModel = Object.freeze({
  μ: 398600.8,
  radius: 6378.135,
  xke: 60 / Math.sqrt((6378.135 * 6378.135 * 6378.135) / 398600.8),
  J2: 0.001082616,
  J3: -0.00000253881,
  J4: -0.00000165597
})

/*****************************************************************************************************************/

/**
 *
 * WGS84
 *
 * The gravity model of the World Geodetic System 1984 (WGS 84), e.g., the fourth of the World
 * Geodetic Systems of the United States Department of Defense, which succeeded WGS 72, and which is
 * the reference frame of the Global Positioning System (GPS). It is maintained by the National
 * Geospatial-Intelligence Agency (NGA), and has been realised anew several times since 1984.
 *
 * N.B. It is not the gravity model a two-line element set is fitted with, which is { WGS72 }, and
 * so it does not propagate an element set more accurately for being the more modern model, e.g.,
 * an element set of a low Earth orbit propagated with it is displaced from the orbit it was fitted
 * to by ~14 metres at its epoch, ~70 metres after a day, and ~250 metres after a week, as measured
 * against the reference implementation. It is provided for a comparison against an implementation
 * that propagates with it, as the reference implementation provides it.
 *
 * N.B. The constants are those the reference implementation adopts, e.g., the equatorial radius and
 * the second zonal harmonic of WGS 84 itself, the latter resolved from its fully normalised
 * coefficient C̄20 of -0.484166850 × 10⁻³, and its gravitational parameter of 398600.4418 km³/s²
 * rounded to 398600.5 km³/s².
 *
 * N.B. The constant xke is resolved from the gravitational parameter and the equatorial radius of
 * the model, in the same order of operations as the reference implementation resolves it, so that
 * it is the constant of the reference implementation to the last bit.
 *
 * N.B. The model is frozen, as it is shared by every propagation that is resolved with it.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export const WGS84: GravityModel = Object.freeze({
  μ: 398600.5,
  radius: 6378.137,
  xke: 60 / Math.sqrt((6378.137 * 6378.137 * 6378.137) / 398600.5),
  J2: 0.00108262998905,
  J3: -0.00000253215306,
  J4: -0.00000161098761
})

/*****************************************************************************************************************/
