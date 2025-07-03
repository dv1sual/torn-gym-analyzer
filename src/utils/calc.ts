const A = 3.480061091e-7;
const B = 250;
const C = 3.091619094e-6;
const D = 6.82775184551527e-5;
const E = -0.0301431777;

/**
 * Vladar's gain formula
 */
export function computeGain(
  stat: number,
  happy: number,
  dots: number,
  energyUsed: number
): number {
  return (
    dots * energyUsed * (
      (A * Math.log(happy + B) + C) * stat + D * (happy + B) + E
    )
  );
}