export function coerceBoolean(value) {
  return value !== null && value !== undefined && `${value}` !== 'false' && `${value}` !== 'NaN' && `${value}` !== '';
}
