/**
 * Devuelve un saludo apropiado según la hora actual del sistema.
 * - "Buenos días" → 5:00 a.m. a 11:59 a.m.
 * - "Buenas tardes" → 12:00 p.m. a 6:59 p.m.
 * - "Buenas noches" → 7:00 p.m. a 4:59 a.m.
 *
 * @param date - Opcional. Permite inyectar una fecha para testing o personalización.
 * @returns Saludo en español según la franja horaria.
 */
export function obtenerSaludo(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  } else if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
}
