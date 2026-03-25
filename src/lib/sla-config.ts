// SLA formal days per product type (business days)

export const SLA_DAYS_CODE: Record<string, number> = {
  'Extracción de datos (PDF / Excel / Web)':       3,
  'Generación de documentos (PDF / Word / Excel)': 3,
  'Consolidación y transformación de datos':       5,
  'Comparación y validación':                      4,
  'Reporte / Informe':                             5,
  'Dashboard / Visualización (Streamlit)':         5,
  'Automatización con IA':                         7,
  'Organización y gestión de archivos':            2,
  'Bug / Corrección':                              2,
  'Utilidad interna / Herramienta propia':         6,
  'Otro':                                          5,
}

export const SLA_DAYS_ADMIN: Record<string, number> = {
  'Acceso / Permiso':   1,
  'Automatización':     4,
  'Capacitación':       5,
  'Mejora de proceso':  5,
  'Reporte':            2,
  'Otro':               3,
}

// Priority factors for Target interno
export const PRIORITY_FACTORS: Record<string, number | null> = {
  urgent: 0.50,
  high:   0.70,
  medium: 1.00,
  low:    null, // no SLA assigned
}

/**
 * Returns the SLA formal days for a request.
 * For code requests with multiple types (comma-separated):
 *   max(sla per type) + (count - 1) * 2  (same formula as PublicRequestForm)
 * For admin requests: single type lookup.
 */
export function calcSlaFormalDays(requestType: string, needsCode: boolean): number {
  if (needsCode) {
    const types = requestType.split(',').map(t => t.trim()).filter(Boolean)
    if (types.length === 0) return 5
    const slas = types.map(t => SLA_DAYS_CODE[t] ?? 5)
    return Math.max(...slas) + (types.length - 1) * 2
  } else {
    return SLA_DAYS_ADMIN[requestType.trim()] ?? 3
  }
}

/**
 * Adds N business days to a given date (modifies a copy, not in place).
 * Starts counting from the next business day after startDate.
 */
export function addBusinessDays(startDate: Date, days: number): Date {
  const d = new Date(startDate)
  // Move to next business day first (day of approval doesn't count)
  do { d.setDate(d.getDate() + 1) } while (d.getDay() === 0 || d.getDay() === 6)
  let added = 1
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) added++
  }
  return d
}

/**
 * Calculates the Target interno date given SLA formal days and priority.
 * Returns null for 'low' priority (no SLA assigned).
 */
export function calcTargetDate(
  slaFormalDays: number,
  priority: string,
  from: Date = new Date(),
): string | null {
  const factor = PRIORITY_FACTORS[priority]
  if (factor === null || factor === undefined) return null
  const targetDays = Math.max(1, Math.ceil(slaFormalDays * factor))
  return addBusinessDays(from, targetDays).toISOString().slice(0, 10)
}
