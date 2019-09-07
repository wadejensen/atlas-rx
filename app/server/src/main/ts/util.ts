export function isNonEmptyString(val: any): boolean {
  return val !== undefined &&
    val !== null &&
    typeof(val) === "string" &&
    val.length > 0
}
