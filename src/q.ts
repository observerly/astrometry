/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/Q
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/


/*****************************************************************************************************************/

// The Q index is a measure of the quality of the an observation, which takes into account the
// illumination of the Moon, the altitude of the target, and the altitude of the Sun as well as
// the angular separation between the Moon and the target.
export const q = (K: number, φ: number, A: number, alt: number): number => {
  // The Moon's illumination factor, which has a range of 0 to 100 percent:
  const k = 1 - 2 * (K / 100)

  // Angular separation between the Moon and the target, which has a range of 0 to 180 degrees:
  // e.g., the maximum antipodal angular separation is 180 degrees:
  const a = 2 * (φ / 180) - 1

  // Moon Q, which takes into account the Moon's illumination and the distance from
  // the Moon to the target (e.g., we can discount the Lunar illumination factor if
  // the distance is greater than 60 degrees):
  const MQ = φ >= 60 ? a : K < 25 ? a : -(a * k)

  // Target Q, which takes into account the altitude of the target:
  // We accept that a value greater than 6 degrees is a good altitude for the target:
  const TQ = A <= 6 ? A / 96 - 1 / 16 : A / 84 - 1 / 14

  // Sun Q, which takes into account the altitude of the Sun:
  // We accept that a value of less than -18 degrees is a good altitude for the Sun:
  const SQ = alt <= -18 ? -alt / 72 - 1 / 4 : -alt / 108 - 1 / 6

  // The Q index is the average of the Moon Q, Target Q, and Sun Q, which has a range of -1 to 1:
  return (MQ + TQ + SQ) / 3
}

/*****************************************************************************************************************/
