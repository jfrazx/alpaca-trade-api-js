export function is(type: string, value: any): boolean {
  return typeof value === type;
}

export function isString(value: any): value is string {
  return is('string', value);
}

export function isNumber(value: any): value is number {
  return is('number', value);
}
