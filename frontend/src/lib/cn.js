// Joins class names, skipping falsy values: cn('a', isOn && 'b') -> 'a b'
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
