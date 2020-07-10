/* eslint-disable */
export function asserts<T>(move: any): asserts move is T {

}
/* eslint-enable */

export function inRange(x: number, min: number, max: number) {
  return x >= min && x <= max && Math.floor(x) === x;
}
