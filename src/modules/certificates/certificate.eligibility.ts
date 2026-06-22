export const ATTENDANCE_THRESHOLD = 0.75

/**
 * Regra de elegibilidade para emissão de certificado (Sprint 2, CLAUDE.md §21):
 * o aluno precisa ter frequentado ao menos 75% das aulas da oficina.
 */
export function isEligibleForCertificate(presentCount: number, totalClasses: number): boolean {
  if (totalClasses <= 0) return false
  return presentCount / totalClasses >= ATTENDANCE_THRESHOLD
}
