/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  getLunarAge,
  getLunarAngularDiameter,
  getLunarAnnualEquationCorrection,
  getLunarArgumentOfLatitude,
  getLunarBrownLunationNumber,
  getLunarCorrectedEclipticLongitudeOfTheAscendingNode,
  getLunarDistance,
  getLunarEclipticCoordinate,
  getLunarEclipticLatitude,
  getLunarEclipticLongitude,
  getLunarElongation,
  getLunarEquatorialCoordinate,
  getLunarEvectionCorrection,
  getLunarEvectionCorrectionToDistance,
  getLunarIllumination,
  getLunarMeanAnomaly,
  getLunarMeanAnomalyCorrection,
  getLunarMeanEclipticLongitude,
  getLunarMeanEclipticLongitudeOfTheAscendingNode,
  getLunarMeanGeometricLongitude,
  getLunarPhase,
  getLunarPhaseAngle,
  getLunarTrueAnomaly,
  getLunarTrueEclipticLongitude,
  getLunarVariationCorrectionToDistance,
  getNextFullMoon,
  getNextNewMoon,
  isBlueMoon,
  isFullMoon,
  isNewMoon
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getLunarAnnualEquationCorrection', () => {
  it('should be defined', () => {
    expect(getLunarAnnualEquationCorrection).toBeDefined()
  })

  it('should return the correct Lunar annual equation correction for the given date', () => {
    const Ae = getLunarAnnualEquationCorrection(datetime)
    expect(Ae).toBe(0.14508161143747456)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getLunarMeanAnomaly).toBeDefined()
  })

  it('should return the correct Lunar mean anomaly for the given date', () => {
    const M = getLunarMeanAnomaly(datetime)
    expect(M).toBe(207.64679753119708)
  })

  it('should return the Lunar mean anomaly of Meeus Example 47.a for 1992 April 12.0 TD', () => {
    // 1992 April 12.0 TD is 1992 April 11 23:59:01.816 UTC, e.g., TT − UTC = 26 s + 32.184 s:
    const M = getLunarMeanAnomaly(new Date('1992-04-11T23:59:01.816Z'))
    expect(M).toBeCloseTo(5.150833, 4)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getLunarMeanGeometricLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean geometric longitude for the given date', () => {
    const l = getLunarMeanGeometricLongitude(datetime)
    expect(l).toBe(80.33681596415408)
  })

  it('should return the Lunar mean geometric longitude of Meeus Example 47.a for 1992 April 12.0 TD', () => {
    // 1992 April 12.0 TD is 1992 April 11 23:59:01.816 UTC, e.g., TT − UTC = 26 s + 32.184 s:
    const l = getLunarMeanGeometricLongitude(new Date('1992-04-11T23:59:01.816Z'))
    expect(l).toBeCloseTo(134.290182, 5)
  })
})

/*****************************************************************************************************************/

describe('getLunarArgumentOfLatitude', () => {
  it('should be defined', () => {
    expect(getLunarArgumentOfLatitude).toBeDefined()
  })

  it('should return the correct Lunar argument of latitude for the given date', () => {
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBe(337.72347616631305)
  })

  it('should return the correct Lunar argument of latitude for the given date in 1977 from Meeus', () => {
    const datetime = new Date('1977-02-13T00:00:00Z')
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBe(120.95841191863292)
  })

  it('should return the correct Lunar argument of latitude for the given date in 2009 from Meeus', () => {
    const datetime = new Date('2009-07-22T02:37:00Z')
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBe(179.8301204055897)
  })

  it('should resolve the lunation k at the Terrestrial Time of the given date', () => {
    // k = T · 1236.85 reaches 264.5 at 2021 May 21 08:38:45.585 TT, e.g., 30 seconds after this date in UTC but
    // ~39 seconds before it in Terrestrial Time, and so k rounds to 265 rather than 264:
    const datetime = new Date('2021-05-21T08:38:15Z')
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBeCloseTo(8.393978867403348, 6)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarMeanEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude for the given date', () => {
    const λ = getLunarMeanEclipticLongitude(datetime)
    expect(λ).toBe(80.33687430074497)
  })

  it('should resolve the Lunar mean ecliptic longitude at the Terrestrial Time of the given date', () => {
    // 2021 May 14 0h UTC is JD 2459348.500800741 TT, e.g., TT − UTC = 37 s + 32.184 s, and so the number of days
    // since J2000.0 is 7803.500800741, e.g., λ = 13.1763964746 · 7803.500800741 + 218.31643388 (mod 360):
    const λ = getLunarMeanEclipticLongitude(datetime)
    expect(λ).toBeCloseTo(80.33687430074497, 9)
  })

  it.each([
    '1900-01-01T00:00:00Z',
    '1950-01-01T00:00:00Z',
    '2050-01-01T00:00:00Z',
    '2099-12-31T00:00:00Z'
  ])('should not drift from the Lunar mean longitude of Meeus for %s', iso => {
    // The mean longitude advances by 481267.88123421° per Julian century (Meeus, Equation 47.1), and so it
    // agrees with the mean geometric longitude of Meeus to within a few arcseconds over the centuries:
    const λ = getLunarMeanEclipticLongitude(new Date(iso))

    const L = getLunarMeanGeometricLongitude(new Date(iso))

    expect(Math.abs(((λ - L + 540) % 360) - 180)).toBeLessThan(0.002)
  })
})

/*****************************************************************************************************************/

describe('getLunarEvectionCorrection', () => {
  it('should be defined', () => {
    expect(getLunarEvectionCorrection).toBeDefined()
  })

  it('should return the correct Lunar evection correction for the given date', () => {
    const Ev = getLunarEvectionCorrection(datetime)
    expect(Ev).toBe(-0.5613244733858357)
  })
})

/*****************************************************************************************************************/

describe('getLunarEvectionCorrectionToDistance', () => {
  it('should be defined', () => {
    expect(getLunarEvectionCorrectionToDistance).toBeDefined()
  })

  it('should return the correct Lunar evection correction to the distance for the given date', () => {
    const Ev = getLunarEvectionCorrectionToDistance(datetime)
    expect(Ev).toBe(3320642.126103393)
  })

  it('should share the argument of the Lunar evection correction to the longitude', () => {
    // The evection displaces the Moon by 1.2739° · sin(A) in longitude and by −3,699,111 m · cos(A) in distance,
    // for the one argument A = 2(λ − l) − M, and so the two lie on the unit circle once scaled by their amplitudes:
    for (let day = 0; day < 60; day += 3) {
      const datetime = new Date(Date.UTC(2026, 0, 1) + day * 86400000)

      const longitude = getLunarEvectionCorrection(datetime) / 1.2739

      const distance = getLunarEvectionCorrectionToDistance(datetime) / -3699111

      expect(longitude ** 2 + distance ** 2).toBeCloseTo(1, 12)
    }
  })

  it('should never exceed the amplitude of the evection in distance', () => {
    for (let day = 0; day < 365; day += 1) {
      const datetime = new Date(Date.UTC(2026, 0, 1) + day * 86400000)

      expect(Math.abs(getLunarEvectionCorrectionToDistance(datetime))).toBeLessThanOrEqual(3699111)
    }
  })
})

/*****************************************************************************************************************/

describe('getLunarVariationCorrectionToDistance', () => {
  it('should be defined', () => {
    expect(getLunarVariationCorrectionToDistance).toBeDefined()
  })

  it('should return the correct Lunar variation correction to the distance for the given date', () => {
    const V = getLunarVariationCorrectionToDistance(datetime)
    expect(V).toBe(-1746178.6925718188)
  })

  it('should bring the Moon nearer at the new and full Moon and further at the quarters', () => {
    // The full Moon is on the 26th of May 2021 at ~11:14 UTC (ERFA moon98 and epv00):
    expect(getLunarVariationCorrectionToDistance(new Date('2021-05-26T11:14:00Z'))).toBeLessThan(
      -2900000
    )

    // The last quarter is on the 2nd of June 2021 at ~07:24 UTC (ERFA moon98 and epv00):
    expect(getLunarVariationCorrectionToDistance(new Date('2021-06-02T07:24:00Z'))).toBeGreaterThan(
      2800000
    )

    // The new Moon is on the 10th of June 2021 at ~10:53 UTC (ERFA moon98 and epv00):
    expect(getLunarVariationCorrectionToDistance(new Date('2021-06-10T10:53:00Z'))).toBeLessThan(
      -2900000
    )
  })

  it('should never exceed the amplitude of the variation in distance', () => {
    for (let day = 0; day < 365; day += 1) {
      const datetime = new Date(Date.UTC(2026, 0, 1) + day * 86400000)

      expect(Math.abs(getLunarVariationCorrectionToDistance(datetime))).toBeLessThanOrEqual(2955968)
    }
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanEclipticLongitudeOfTheAscendingNode', () => {
  it('should be defined', () => {
    expect(getLunarMeanEclipticLongitudeOfTheAscendingNode).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude of the ascending node for the given date', () => {
    const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(datetime)
    expect(Ω).toBe(71.81872094764617)
  })

  it('should resolve the Lunar mean ecliptic longitude of the ascending node at the Terrestrial Time of the given date', () => {
    // 2021 May 14 0h UTC is JD 2459348.500800741 TT, e.g., TT − UTC = 37 s + 32.184 s, and so the number of days
    // since J2000.0 is 7803.500800741, e.g., Ω = 125.044522 − 0.0529539 · 7803.500800741 (mod 360):
    const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(datetime)
    expect(Ω).toBeCloseTo(71.81872094764617, 9)
  })

  it('should return the mean (uncorrected) ascending node for the Meeus example epoch', () => {
    // Meeus, Astronomical Algorithms, Example 22.a (1987 April 10.0 TD), Ω = 11.2531 degrees:
    const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(
      new Date('1987-04-10T00:00:00.000+00:00')
    )
    expect(Ω).toBeCloseTo(11.2531, 1)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanAnomalyCorrection', () => {
  it('should be defined', () => {
    expect(getLunarMeanAnomalyCorrection).toBeDefined()
  })

  it('should return the correct Lunar mean anomaly correction for the given date', () => {
    const Ac = getLunarMeanAnomalyCorrection(datetime)
    expect(Ac).toBe(206.65147758075557)
  })
})

/*****************************************************************************************************************/

describe('getLunarTrueAnomaly', () => {
  it('should be defined', () => {
    expect(getLunarTrueAnomaly).toBeDefined()
  })

  it('should return the correct Lunar true anomaly for the given date', () => {
    // The corrected mean anomaly of 206.65147758075557° displaced by the equation of the centre of ~−2.6492°:
    const ν = getLunarTrueAnomaly(datetime)
    expect(ν).toBe(204.00223551877838)
  })
})

/*****************************************************************************************************************/

describe('getLunarTrueEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarTrueEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar true ecliptic longitude for the given date', () => {
    const λ = getLunarTrueEclipticLongitude(datetime)
    expect(λ).toBe(77.46330177018255)
  })
})

/*****************************************************************************************************************/

describe('getLunarCorrectedEclipticLongitudeOfTheAscendingNode', () => {
  it('should be defined', () => {
    expect(getLunarCorrectedEclipticLongitudeOfTheAscendingNode).toBeDefined()
  })

  it('should return the correct Lunar corrected ecliptic longitude of the ascending node for the given date', () => {
    const Ω = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)
    expect(Ω).toBe(71.69378522197343)
  })
})

/*****************************************************************************************************************/

describe('getLunarEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar ecliptic longitude for the given date', () => {
    const λ = getLunarEclipticLongitude(datetime)
    expect(λ).toBe(77.44020837285663)
  })
})

/*****************************************************************************************************************/

describe('getLunarEclipticLatitude', () => {
  it('should be defined', () => {
    expect(getLunarEclipticLatitude).toBeDefined()
  })

  it('should return the correct Lunar ecliptic latitude for the given date', () => {
    const β = getLunarEclipticLatitude(datetime)
    expect(β).toBe(0.5165631350205399)
  })
})

/*****************************************************************************************************************/

describe('getLunarEclipticCoordinate', () => {
  it('should be defined', () => {
    expect(getLunarEclipticCoordinate).toBeDefined()
  })

  it('should return the correct Lunar ecliptic coordinate for the given date', () => {
    const { λ, β } = getLunarEclipticCoordinate(datetime)
    expect(λ).toBe(77.44020837285663)
    expect(β).toBe(0.5165631350205399)
  })
})

/*****************************************************************************************************************/

describe('getLunarEquatorialCoordinate', () => {
  it('should be defined', () => {
    expect(getLunarEquatorialCoordinate).toBeDefined()
  })

  it('should return the correct Lunar equatorial coordinate for the given date', () => {
    const datetime = new Date('2015-01-02T03:00:00.000+00:00')
    const { ra, dec } = getLunarEquatorialCoordinate(datetime)
    expect(ra).toBe(64.18621356617048)
    expect(dec).toBe(17.28348391119229)
  })
})

/*****************************************************************************************************************/

describe('getLunarElongation', () => {
  it('should be defined', () => {
    expect(getLunarElongation).toBeDefined()
  })

  it('should return the correct Lunar elongation for the given date', () => {
    const datetime = new Date('2015-01-02T03:00:00.000+00:00')
    const E = getLunarElongation(datetime)
    expect(E).toBe(143.7935539263054)
  })
})

/*****************************************************************************************************************/

describe('getLunarAngularDiameter', () => {
  it('should be defined', () => {
    expect(getLunarAngularDiameter).toBeDefined()
  })

  it('should return the correct Lunar angular diameter for the given date', () => {
    // The geocentric angular diameter is ~0.5141° (ERFA moon98), e.g., at a distance of ~387,394 km:
    const datetime = new Date('2015-01-02T03:00:00.000+00:00')
    const δ = getLunarAngularDiameter(datetime)
    expect(δ).toBe(0.5185157426350441)
  })

  it('should return a smaller Lunar angular diameter at apogee than at perigee', () => {
    // The Moon is at perigee on the 1st of January 2026 at ~22:00 UTC, at a distance of ~360,363 km and with
    // an angular diameter of ~0.5526° (ERFA moon98):
    const perigee = getLunarAngularDiameter(new Date('2026-01-01T22:00:00Z'))

    // The Moon is at apogee on the 13th of January 2026 at ~21:00 UTC, at a distance of ~405,403 km and with
    // an angular diameter of ~0.4912° (ERFA moon98):
    const apogee = getLunarAngularDiameter(new Date('2026-01-13T21:00:00Z'))

    expect(perigee).toBeCloseTo(0.5465473178001063, 10)
    expect(apogee).toBeCloseTo(0.49119224021604435, 10)
  })

  it('should return the correct Lunar angular diameter for the given date in 1977 from Meeus', () => {
    const palomer = {
      latitude: 33.3561111,
      longitude: -117.1611,
      elevation: 1706
    }

    // The topocentric angular diameter is ~0.5306° (ERFA moon98), e.g., at a topocentric distance of ~375,327 km:
    const datetime = new Date('1977-02-13T00:00:00Z')
    const δ = getLunarAngularDiameter(datetime, palomer)
    expect(δ).toBeCloseTo(0.5388887916772126, 10)
  })
})

/*****************************************************************************************************************/

describe('getLunarDistance', () => {
  it('should be defined', () => {
    expect(getLunarDistance).toBeDefined()
  })

  it('should return the correct Lunar distance for the given date', () => {
    // The geocentric distance is ~387,394 km (ERFA moon98):
    const datetime = new Date('2015-01-02T03:00:00.000+00:00')
    const Δ = getLunarDistance(datetime)
    expect(Δ).toBe(384091790.5171041)
  })

  it('should return the correct Lunar distance at perigee and apogee', () => {
    // The Moon is at perigee on the 1st of January 2026 at ~22:00 UTC, at a distance of ~360,363 km (ERFA moon98):
    const perigee = getLunarDistance(new Date('2026-01-01T22:00:00Z'))

    // The Moon is at apogee on the 13th of January 2026 at ~21:00 UTC, at a distance of ~405,403 km (ERFA moon98):
    const apogee = getLunarDistance(new Date('2026-01-13T21:00:00Z'))

    expect(perigee).toBeCloseTo(364392310.6266889, 4)
    expect(apogee).toBeCloseTo(405457626.7581165, 4)

    // The distance at apogee exceeds the semi-major axis of the Moon's orbit, e.g., ~384,400 km:
    expect(apogee).toBeGreaterThan(3.844e8)
    expect(perigee).toBeLessThan(3.844e8)
  })
})

/*****************************************************************************************************************/

describe('getLunarAge', () => {
  it('should be defined', () => {
    expect(getLunarAge).toBeDefined()
  })

  it('should return the correct Lunar age for the given date', () => {
    const datetime = new Date('2015-01-01T00:00:00.000+00:00')
    const { A, age } = getLunarAge(datetime)
    expect(A).toBe(130.46354013829688)
    expect(age).toBe(10.701851717799972)
  })
})

/*****************************************************************************************************************/

describe('getLunarPhaseAngle', () => {
  it('should be defined', () => {
    expect(getLunarPhaseAngle).toBeDefined()
  })

  it('should return the correct Lunar phase angle for the given date', () => {
    const datetime = new Date('2015-01-01T00:00:00.000+00:00')
    const PA = getLunarPhaseAngle(datetime)
    expect(PA).toBe(49.60510633039294)
  })
})

/*****************************************************************************************************************/

describe('getLunarIllumination', () => {
  it('should be defined', () => {
    expect(getLunarIllumination).toBeDefined()
  })

  it('should return the correct Lunar illumination for the given date', () => {
    const datetime = new Date('2015-01-01T00:00:00.000+00:00')
    const K = getLunarIllumination(datetime)
    expect(K).toBe(82.40260142302462)
  })
})

/*****************************************************************************************************************/

describe('getLunarPhase', () => {
  it('should be defined', () => {
    expect(getLunarPhase).toBeDefined()
  })

  it('should return the correct Lunar phase for the given date as Waxing Gibbous', () => {
    const datetime = new Date('2015-01-02T02:00:00.000+00:00')
    const phase = getLunarPhase(datetime)
    expect(phase).toBe('Waxing Gibbous')
  })

  it('should return the correct Lunar phase for the given date as Full Moon', () => {
    const datetime = new Date('2015-01-05T07:00:00.000+00:00')
    const phase = getLunarPhase(datetime)
    expect(phase).toBe('Full')
  })

  it('should return the correct Lunar phase for the given date as Waning Gibbous', () => {
    const datetime = new Date('2015-01-07T23:00:00.000+00:00')
    const phase = getLunarPhase(datetime)
    expect(phase).toBe('Waning Gibbous')
  })

  it('should return the correct Lunar phase for the given date as Last Quarter', () => {
    const datetime = new Date('2015-02-12T17:00:00.000+00:00')
    const phase = getLunarPhase(datetime)
    expect(phase).toBe('Last Quarter')
  })

  it('should return New at the exact New Moon instant', () => {
    // New Moon of 2021-01-13 occurred at ~05:00 UTC. Previously this instant
    // (and the hours after it) was misclassified as Waxing Crescent:
    const datetime = new Date('2021-01-13T05:00:00.000+00:00')
    expect(getLunarPhase(datetime)).toBe('New')
  })

  it('should return New symmetrically on both sides of the New Moon instant', () => {
    // Hours before and after the New Moon should both read as New; previously
    // only the time before the instant did, the time after read as Crescent:
    expect(getLunarPhase(new Date('2021-01-12T20:00:00.000+00:00'))).toBe('New')
    expect(getLunarPhase(new Date('2021-01-13T13:00:00.000+00:00'))).toBe('New')
  })

  it('should return Full symmetrically on both sides of the Full Moon instant', () => {
    // Full Moon of 2021-01-28 occurred at ~19:16 UTC; the window either side
    // should read as Full, not skewed to one side as Waxing/Waning Gibbous:
    expect(getLunarPhase(new Date('2021-01-28T13:00:00.000+00:00'))).toBe('Full')
    expect(getLunarPhase(new Date('2021-01-29T01:00:00.000+00:00'))).toBe('Full')
  })
})

/*****************************************************************************************************************/

describe('getLunarBrownLunationNumber', () => {
  it('should return the correct Brown Lunation number for the given datetime', () => {
    const LBN = getLunarBrownLunationNumber(datetime)
    expect(LBN).toBe(1217)
  })
})

/*****************************************************************************************************************/

describe.each([
  ...Array.from({ length: 31 }, (_, i) => i + 1).map(day => ({
    date: new Date(2021, 0, day, 0, 0, 0, 0)
  }))
])('isNewMoon', ({ date }) => {
  it('should return only when the Moon is a New Moon', () => {
    if ([13].includes(date.getDate()) && date.getMonth() === 0 && date.getFullYear() === 2021) {
      expect(isNewMoon(date)).toBe(true)
    } else {
      expect(isNewMoon(date)).toBe(false)
    }
  })

  it('should never return an invalid phase', () => {
    expect(getLunarPhase(date) === 'Invalid').toBe(false)
  })
})

/*****************************************************************************************************************/

describe.each([
  ...Array.from({ length: 31 }, (_, i) => i + 1).map(day => ({
    date: new Date(2021, 0, day, 0, 0, 0, 0)
  }))
])('isFullMoon', ({ date }) => {
  it('should return only when the Moon is a Full Moon', () => {
    if ([29].includes(date.getDate()) && date.getMonth() === 0 && date.getFullYear() === 2021) {
      expect(isFullMoon(date)).toBe(true)
    } else {
      expect(isFullMoon(date)).toBe(false)
    }
  })

  it('should never return an invalid phase', () => {
    expect(getLunarPhase(date) === 'Invalid').toBe(false)
  })
})

/*****************************************************************************************************************/

describe('getNextNewMoon', () => {
  it('should be defined', () => {
    expect(getNextNewMoon).toBeDefined()
  })

  it('should return the correct date of the next New Moon', () => {
    // The new Moon is on the 10th of June 2021 at ~10:53 UTC (ERFA moon98 and epv00):
    const nextNewMoon = getNextNewMoon(datetime)
    expect(nextNewMoon.toISOString()).toBe('2021-06-10T10:43:00.000Z')
  })

  it('should return a new Moon that is still to come for a datetime just after one', () => {
    // The Moon reads as new for ~22 hours about the syzygy, and so a datetime within that window
    // but beyond the syzygy resolved the new Moon that had already passed:
    const passed = new Date('2024-09-03T02:22:50.000Z')

    for (const hours of [1, 6, 12, 18]) {
      const datetime = new Date(passed.getTime() + hours * 60 * 60 * 1000)

      expect(getNextNewMoon(datetime).getTime()).toBeGreaterThan(datetime.getTime())
    }
  })

  it('should return the imminent new Moon for a datetime just before one', () => {
    // The new Moon is on the 3rd of September 2024 at ~01:55 UTC (ERFA moon98 and epv00):
    const datetime = new Date('2024-09-02T23:00:00.000Z')

    expect(getNextNewMoon(datetime).toISOString()).toBe('2024-09-03T02:22:50.000Z')
  })
})

/*****************************************************************************************************************/

describe('getNextFullMoon', () => {
  it('should be defined', () => {
    expect(getNextFullMoon).toBeDefined()
  })

  it('should return the correct date of the next Full Moon', () => {
    // The full Moon is on the 26th of May 2021 at ~11:14 UTC (ERFA moon98 and epv00):
    const nextFullMoon = getNextFullMoon(datetime)
    expect(nextFullMoon.toISOString()).toBe('2021-05-26T11:21:50.000Z')
  })

  it('should return a full Moon that is still to come for a datetime just after one', () => {
    // The Moon reads as full for ~20 hours about the syzygy, and so a datetime within that window
    // but beyond the syzygy resolved the full Moon that had already passed:
    const passed = new Date('2024-08-19T18:26:00.000Z')

    for (const hours of [1, 6, 12, 18]) {
      const datetime = new Date(passed.getTime() + hours * 60 * 60 * 1000)

      expect(getNextFullMoon(datetime).getTime()).toBeGreaterThan(datetime.getTime())
    }
  })
})

/*****************************************************************************************************************/

describe('isBlueMoon', () => {
  it('should be defined', () => {
    expect(isBlueMoon).toBeDefined()
  })

  it('should return true for January 31st 1999', () => {
    // We know there is a second full moon in January 1999:
    const datetime = new Date('1999-01-31T16:08:00Z')
    expect(isBlueMoon(datetime)).toBe(true)
  })

  it('should return true for March 31st 1999', () => {
    // We know there is a second full moon in March 1999:
    const datetime = new Date('1999-03-31T23:49:00Z')
    expect(isBlueMoon(datetime)).toBe(true)
  })

  it('should return false for May 29th 2021', () => {
    const datetime = new Date('2021-05-29T12:00:00Z')
    expect(isBlueMoon(datetime)).toBe(false)
  })

  it('should not depend on the timezone of the host system', () => {
    // The calendar month is the month of UTC, and so the same instant is a Blue Moon wherever the
    // host is. The instants below fall on the last day of the month of UTC, but on the first day
    // of the next month for a host to the east of it, and, for the one late in the day, on the
    // penultimate day of the month for a host to the west of it:
    const timezone = process.env.TZ

    try {
      // N.B. The instant on the 29th is compared against the fraction of a day by which the
      // synodic month exceeds 29 days, e.g., ~12.7 hours, and so it exercises the time of day as
      // well as the day of the month:
      for (const iso of ['1999-03-31T23:49:00Z', '2023-08-31T01:35:00Z', '2004-08-29T18:00:00Z']) {
        for (const TZ of ['UTC', 'Pacific/Auckland', 'Asia/Tokyo', 'America/Los_Angeles']) {
          process.env.TZ = TZ

          expect(isBlueMoon(new Date(iso))).toBe(true)
        }
      }
    } finally {
      process.env.TZ = timezone
    }
  })

  it('should return true for August 31st 2023', () => {
    // We know there is a second full moon in August 2023:
    const datetime = new Date('2023-08-31T01:35:00Z')
    expect(isBlueMoon(datetime)).toBe(true)
  })
})

/*****************************************************************************************************************/
