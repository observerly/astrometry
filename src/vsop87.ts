/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/vsop87
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { convertRadiansToDegrees as degrees } from './utilities'

/*****************************************************************************************************************/

function calculateTerms(τ: number, terms: { A: number; B: number; C: number }[]): number {
  return terms.reduce((sum, term) => sum + term.A * Math.cos(term.B + term.C * τ), 0)
}

/*****************************************************************************************************************/

export function calculateL(τ: number, terms: { A: number; B: number; C: number }[][]): number {
  let L = 0

  for (let i = 0; i < terms.length; i++) {
    const l = calculateTerms(τ, terms[i])
    L += l * τ ** i
  }

  // The result must be converted from 1e-8 radians to radians and then to degrees:
  return degrees(L / 1e8)
}

/*****************************************************************************************************************/
