/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  getLunarAnnualEquationCorrection,
  getLunarMeanAnomaly,
  getLunarMeanGeometricLongitude,
  getLunarMeanEclipticLongitude,
  getLunarEvectionCorrection,
  getLunarMeanEclipticLongitudeOfTheAscendingNode,
  getLunarMeanAnomalyCorrection,
  getLunarTrueAnomaly,
  getLunarTrueEclipticLongitude,
  getLunarCorrectedEclipticLongitudeOfTheAscendingNode,
  getLunarEclipticLongitude,
  getLunarEclipticLatitude,
  getLunarEclipticCoordinate,
  getLunarEquatorialCoordinate,
  getLunarElongation,
  getLunarAngularDiameter
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
})

/*****************************************************************************************************************/
