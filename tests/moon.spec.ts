/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

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
  getNextFullMoon,
  getNextNewMoon,
  isFullMoon,
  isNewMoon
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getLunarAnnualEquationCorrection', () => {
  it('should be defined', () => {
    expect(getLunarAnnualEquationCorrection).toBeDefined()
  })

  it('should return the correct Lunar annual equation correction for the given date', () => {
    const Ae = getLunarAnnualEquationCorrection(datetime)
    expect(Ae).toBe(0.14508321025194074)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getLunarMeanAnomaly).toBeDefined()
  })

  it('should return the correct Lunar mean anomaly for the given date', () => {
    const M = getLunarMeanAnomaly(datetime)
    expect(M).toBe(207.63633585681964)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getLunarMeanGeometricLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean geometric longitude for the given date', () => {
    const l = getLunarMeanGeometricLongitude(datetime)
    expect(l).toBe(80.32626508452813)
  })
})

/*****************************************************************************************************************/

describe('getLunarArgumentOfLatitude', () => {
  it('should be defined', () => {
    expect(getLunarArgumentOfLatitude).toBeDefined()
  })

  it('should return the correct Lunar argument of latitude for the given date', () => {
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBe(337.7234761663276)
  })

  it('should return the correct Lunar argument of latitude for the given date in 1977 from Meeus', () => {
    const datetime = new Date('1977-02-13T00:00:00Z')
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBe(120.95841191863292)
  })

  it('should return the correct Lunar argument of latitude for the given date in 2009 from Meeus', () => {
    const datetime = new Date('2009-07-22T02:37:00Z')
    const F = getLunarArgumentOfLatitude(datetime)
    expect(F).toBe(179.83012040559697)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarMeanEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude for the given date', () => {
    const λ = getLunarMeanEclipticLongitude(datetime)
    expect(λ).toBe(79.88317358099448)
  })
})

/*****************************************************************************************************************/

describe('getLunarEvectionCorrection', () => {
  it('should be defined', () => {
    expect(getLunarEvectionCorrection).toBeDefined()
  })

  it('should return the correct Lunar evection correction for the given date', () => {
    const Ev = getLunarEvectionCorrection(datetime)
    expect(Ev).toBe(-0.5580522629166652)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanEclipticLongitudeOfTheAscendingNode', () => {
  it('should be defined', () => {
    expect(getLunarMeanEclipticLongitudeOfTheAscendingNode).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude of the ascending node for the given date', () => {
    const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(datetime)
    expect(Ω).toBe(71.6938262475226)
  })
})

/*****************************************************************************************************************/

describe('getLunarMeanAnomalyCorrection', () => {
  it('should be defined', () => {
    expect(getLunarMeanAnomalyCorrection).toBeDefined()
  })

  it('should return the correct Lunar mean anomaly correction for the given date', () => {
    const Ac = getLunarMeanAnomalyCorrection(datetime)
    expect(Ac).toBe(206.64428333417192)
  })
})

/*****************************************************************************************************************/

describe('getLunarTrueAnomaly', () => {
  it('should be defined', () => {
    expect(getLunarTrueAnomaly).toBeDefined()
  })

  it('should return the correct Lunar true anomaly for the given date', () => {
    const ν = getLunarTrueAnomaly(datetime)
    expect(ν).toBe(357.3514315617634)
  })
})

/*****************************************************************************************************************/

describe('getLunarTrueEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarTrueEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar true ecliptic longitude for the given date', () => {
    const λ = getLunarTrueEclipticLongitude(datetime)
    expect(λ).toBe(77.01224128076132)
  })
})

/*****************************************************************************************************************/

describe('getLunarCorrectedEclipticLongitudeOfTheAscendingNode', () => {
  it('should be defined', () => {
    expect(getLunarCorrectedEclipticLongitudeOfTheAscendingNode).toBeDefined()
  })

  it('should return the correct Lunar corrected ecliptic longitude of the ascending node for the given date', () => {
    const Ω = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)
    expect(Ω).toBe(71.56888914504515)
  })
})

/*****************************************************************************************************************/

describe('getLunarEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getLunarEclipticLongitude).toBeDefined()
  })

  it('should return the correct Lunar ecliptic longitude for the given date', () => {
    const λ = getLunarEclipticLongitude(datetime)
    expect(λ).toBe(76.99043727540315)
  })
})

/*****************************************************************************************************************/

describe('getLunarEclipticLatitude', () => {
  it('should be defined', () => {
    expect(getLunarEclipticLatitude).toBeDefined()
  })

  it('should return the correct Lunar ecliptic latitude for the given date', () => {
    const β = getLunarEclipticLatitude(datetime)
    expect(β).toBe(0.48745043387361126)
  })
})

/*****************************************************************************************************************/

describe('getLunarEclipticCoordinate', () => {
  it('should be defined', () => {
    expect(getLunarEclipticCoordinate).toBeDefined()
  })

  it('should return the correct Lunar ecliptic coordinate for the given date', () => {
    const { λ, β } = getLunarEclipticCoordinate(datetime)
    expect(λ).toBe(76.99043727540315)
    expect(β).toBe(0.48745043387361126)
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
    expect(ra).toBe(63.85408978307256)
    expect(dec).toBe(17.246094608898055)
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
    expect(E).toBe(143.73394864456367)
  })
})

/*****************************************************************************************************************/

describe('getLunarAngularDiameter', () => {
  it('should be defined', () => {
    expect(getLunarAngularDiameter).toBeDefined()
  })

  it('should return the correct Lunar angular diameter for the given date', () => {
    const datetime = new Date('2015-01-02T03:00:00.000+00:00')
    const δ = getLunarAngularDiameter(datetime)
    expect(δ).toBe(0.5480234986129843)
  })

  it('should return the correct Lunar angular diameter for the given date in 1977 from Meeus', () => {
    const palomer = {
      latitude: 33.3561111,
      longitude: -117.1611,
      elevation: 1706
    }

    const datetime = new Date('1977-02-13T00:00:00Z')
    const δ = getLunarAngularDiameter(datetime, palomer)
    expect(δ).toBe(0.5417666941070021)
  })
})

/*****************************************************************************************************************/

describe('getLunarDistance', () => {
  it('should be defined', () => {
    expect(getLunarDistance).toBeDefined()
  })

  it('should return the correct Lunar distance for the given date', () => {
    const datetime = new Date('2015-01-02T03:00:00.000+00:00')
    const Δ = getLunarDistance(datetime)
    expect(Δ).toBe(363410767.06392413)
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
    expect(A).toBe(130.40251122256336)
    expect(age).toBe(10.696845549747305)
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
    expect(PA).toBe(49.66441438659977)
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
    expect(K).toBe(82.36316687224799)
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
    const nextNewMoon = getNextNewMoon(datetime)
    expect(nextNewMoon.toISOString()).toBe('2021-06-10T10:54:20.000Z')
  })
})

/*****************************************************************************************************************/

describe('getNextFullMoon', () => {
  it('should be defined', () => {
    expect(getNextFullMoon).toBeDefined()
  })

  it('should return the correct date of the next Full Moon', () => {
    const nextFullMoon = getNextFullMoon(datetime)
    expect(nextFullMoon.toISOString()).toBe('2021-05-26T11:31:20.000Z')
  })
})

/*****************************************************************************************************************/
