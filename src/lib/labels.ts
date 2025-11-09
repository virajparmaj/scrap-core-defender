export function getColumnLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, ...
}

export function getRowLabel(index: number): string {
  return (index + 1).toString(); // 1, 2, 3, ...
}
