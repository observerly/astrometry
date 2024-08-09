/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/vsop87
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

function calculateTerms(τ: number, terms: { A: number; B: number; C: number }[]): number {
  return terms.reduce((sum, term) => sum + term.A * Math.cos(term.B + term.C * τ), 0)
}

/*****************************************************************************************************************/
