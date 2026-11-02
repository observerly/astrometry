/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getAngularSeparation,
  getCorrectionToEquatorialForFrameBias,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getPrecessionAngles
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing
const polaris: EquatorialCoordinate = { ra: 37.95454961, dec: 89.264113893 }

/*****************************************************************************************************************/

describe('getPrecessionAngles', () => {
  it('should be defined', () => {
    expect(getPrecessionAngles).toBeDefined()
  })

  // The equatorial precession angles of IAU 2006, as eraP06e of the IAU Standards of Fundamental Astronomy (SOFA)
  // resolves them, for the Terrestrial Time of each instant (in degrees):
  it.each([
    {
      datetime: '2000-01-01T12:00:00.000Z',
      ζ: 0.000736275528526131,
      z: -0.0007362494715080268,
      θ: 1.1322950652280641e-8
    },
    {
      datetime: '2021-05-14T00:00:00.000Z',
      ζ: 0.13759858640121758,
      z: 0.13613576917705666,
      θ: 0.11893666567219895
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      ζ: 0.32242391945022586,
      z: 0.3210061653867071,
      θ: 0.27952495446101727
    }
  ])('should return the precession angles of eraP06e at $datetime', reference => {
    const { ζ, z, θ } = getPrecessionAngles(new Date(reference.datetime))

    expect(ζ).toBeCloseTo(reference.ζ, 10)
    expect(z).toBeCloseTo(reference.z, 10)
    expect(θ).toBeCloseTo(reference.θ, 10)
  })

  it('should return the offsets of the precession angles at J2000.0, e.g., ζ and z are equal and opposite', () => {
    const { ζ, z, θ } = getPrecessionAngles(new Date('2000-01-01T11:58:55.816Z'))

    expect(ζ * 3600).toBeCloseTo(2.650545, 6)
    expect(z * 3600).toBeCloseTo(-2.650545, 6)
    expect(θ * 3600).toBeCloseTo(0, 6)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForPrecessionOfEquinoxes', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForPrecessionOfEquinoxes).toBeDefined()
  })

  it('should return the correct precession correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
      new Date('2000-01-01T12:00:00+00:00'),
      polaris
    )
    expect(ra + polaris.ra).toBeCloseTo(37.95454961)
    expect(dec + polaris.dec).toBeCloseTo(89.264113893)
  })

  it('should return the correct precession correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, polaris)
    expect(ra + polaris.ra).toBeCloseTo(44.745273328264, 9)
    expect(dec + polaris.dec).toBeCloseTo(89.35354192194684, 9)
  })

  // The mean place of the date of each target, as the precession matrix of ERFA (bp06) resolves
  // it, e.g., without the frame bias, for the Terrestrial Time of each instant (in degrees):
  it.each([
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      mean: { ra: 279.06939511623375, dec: 38.76624791835364 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      mean: { ra: 312.510232615696, dec: -89.03389036819215 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'the north celestial pole',
      ra: 123.4,
      dec: 90,
      mean: { ra: 359.87311997106474, dec: 89.89035478752609 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'the south celestial pole',
      ra: 123.4,
      dec: -90,
      mean: { ra: 179.87311997106173, dec: -89.89035478752609 }
    },
    {
      datetime: '1980-04-22T06:00:00.000Z',
      name: 'a target near the north celestial pole',
      ra: 0,
      dec: 89.9999,
      mean: { ra: 359.8730056914652, dec: 89.89025478776546 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      mean: { ra: 279.6564154951439, dec: 38.82956557221254 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      mean: { ra: 326.4283441993437, dec: -88.73617657837842 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'the north celestial pole',
      ra: 123.4,
      dec: 90,
      mean: { ra: 180.32100617852447, dec: 89.72047504555813 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'the south celestial pole',
      ra: 123.4,
      dec: -90,
      mean: { ra: 0.32100617852567104, dec: -89.72047504555815 }
    },
    {
      datetime: '2050-03-20T12:00:00.000Z',
      name: 'a target near the north celestial pole',
      ra: 0,
      dec: 89.9999,
      mean: { ra: 180.32089079030519, dec: 89.72057504397422 }
    }
  ])('should agree with the mean place of ERFA for $name at $datetime', reference => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
      new Date(reference.datetime),
      reference
    )

    // N.B. The separation is taken, rather than the difference in right ascension, which is
    // stretched by 1 / cos δ towards the poles, and is degenerate at them:
    const separation = getAngularSeparation(
      { θ: reference.dec + dec, φ: reference.ra + ra },
      { θ: reference.mean.dec, φ: reference.mean.ra }
    )

    // N.B. The precession angles of P03 and the Fukushima-Williams angles of bp06 agree to within
    // ~1e-12 radians, e.g., ~0.2 µas, and so 1e-9° is ~3.6 µas:
    expect(separation).toBeLessThan(1e-9)
  })

  it.each(['1980-04-22T06:00:00.000Z', '2021-05-14T00:00:00.000Z', '2050-03-20T12:00:00.000Z'])(
    'should carry the north celestial pole of J2000.0 to a declination of 90° − |θ| at %s',
    when => {
      const { θ } = getPrecessionAngles(new Date(when))

      const { dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(new Date(when), {
        ra: 0,
        dec: 90
      })

      expect(90 + dec).toBeCloseTo(90 - Math.abs(θ), 10)
    }
  )

  it.each([{ ra: 10 }, { ra: 200 }, { ra: 359.9 }])(
    'should return a small correction free of any ±360° branch-cut jump for a target at ra $ra',
    ({ ra: targetRA }) => {
      const target: EquatorialCoordinate = { ra: targetRA, dec: 45 }

      const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(
        new Date('2026-07-22T00:00:00.000+00:00'),
        target
      )

      // Precession accumulates ~0.36° over the ~26 years since J2000, so the
      // correction magnitude must be well under 1°:
      expect(Math.abs(ra)).toBeLessThan(1)
      expect(Math.abs(dec)).toBeLessThan(1)

      // Applying the correction (wrapped into [0, 360)) should move the target
      // by only that small amount:
      const corrected = (((target.ra + ra) % 360) + 360) % 360

      let delta = corrected - target.ra
      delta -= 360 * Math.round(delta / 360)

      expect(Math.abs(delta)).toBeLessThan(1)
    }
  )
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForFrameBias', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForFrameBias).toBeDefined()
  })

  it.each([
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639, Δra: 0.0000034608, Δdec: -0.000001991 },
    {
      name: 'Polaris',
      ra: 37.95456067,
      dec: 89.26410897,
      Δra: -0.00010068472,
      Δdec: -0.0000048046
    },
    {
      name: 'Canopus',
      ra: 95.98787778,
      dec: -52.69566111,
      Δra: 0.000010340097,
      Δdec: -0.0000014024
    }
  ])('should agree with the frame bias of ERFA for $name', ({ ra, dec, Δra, Δdec }) => {
    // The displacements are those of the frame bias matrix of ERFA (bp06) applied to the catalogue coordinate:
    const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

    expect(correction.ra).toBeCloseTo(Δra, 9)
    expect(correction.dec).toBeCloseTo(Δdec, 9)
  })

  // The displacements of the frame bias matrix of ERFA (bp00) applied to each coordinate, with the
  // displacement in right ascension taken within (−180°, 180°] (in degrees):
  it.each([
    {
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      Δra: 7.960843277032836e-6,
      Δdec: 1.128917666903817e-6
    },
    {
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      Δra: -0.00024444056407446624,
      Δdec: -2.0994190492729103e-6
    },
    {
      name: 'the origin of right ascension',
      ra: 0,
      dec: 0,
      Δra: 4.055555393733812e-6,
      Δdec: -4.615872547704916e-6
    },
    {
      name: 'a target just west of the origin of right ascension',
      ra: 359.99,
      dec: -10,
      Δra: 3.7214109056549205e-6,
      Δdec: -4.615541865149453e-6
    }
  ])(
    'should agree with the frame bias of ERFA to 12 decimal places for $name',
    ({ ra, dec, Δra, Δdec }) => {
      const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

      expect(correction.ra).toBeCloseTo(Δra, 12)
      expect(correction.dec).toBeCloseTo(Δdec, 12)
    }
  )

  it.each([
    { pole: 'north', dec: 90, Δra: -101.08815375555523, Δdec: -4.989424411405707e-6 },
    { pole: 'south', dec: -90, Δra: 78.91184616537294, Δdec: 4.989424411405707e-6 }
  ])(
    'should carry the $pole celestial pole onto the pole of the mean frame of J2000.0',
    ({ dec, Δra, Δdec }) => {
      // N.B. The right ascension of a pole is degenerate, and so the displacement in right
      // ascension is that of the right ascension given, 123.4°, to that of the ICRS pole in the
      // mean frame of J2000.0, e.g., ~22.31° in the north and ~202.31° in the south:
      const correction = getCorrectionToEquatorialForFrameBias({ ra: 123.4, dec })

      expect(correction.ra).toBeCloseTo(Δra, 8)
      expect(correction.dec).toBeCloseTo(Δdec, 12)
    }
  )

  it('should displace no direction by more than the ~23.147 mas of the whole frame bias', () => {
    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-90, -89.9, -52.69566111, -10, 0, 7.4070639, 45, 89.26410897, 90]) {
        const correction = getCorrectionToEquatorialForFrameBias({ ra, dec })

        // N.B. The separation is taken, rather than the displacement in right ascension, which is
        // stretched by 1 / cos δ towards the poles:
        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: dec + correction.dec, φ: ra + correction.ra }
        )

        expect(separation * 3600 * 1000).toBeLessThan(23.148)
      }
    }
  })

  it.each([{ ra: 0 }, { ra: 359.99 }])(
    'should return a small correction free of any ±360° branch-cut jump for a target at ra $ra',
    ({ ra }) => {
      const correction = getCorrectionToEquatorialForFrameBias({ ra, dec: -10 })

      expect(Math.abs(correction.ra)).toBeLessThan(0.0001)
      expect(Math.abs(correction.dec)).toBeLessThan(0.0001)
    }
  )
})

/*****************************************************************************************************************/
