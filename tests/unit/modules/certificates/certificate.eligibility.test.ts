import { describe, it, expect } from 'vitest'
import {
  isEligibleForCertificate,
  ATTENDANCE_THRESHOLD,
} from '@/modules/certificates/certificate.eligibility'

describe('isEligibleForCertificate', () => {
  it('expõe o limiar de 75%', () => {
    expect(ATTENDANCE_THRESHOLD).toBe(0.75)
  })

  it('retorna false para 0% de presença', () => {
    expect(isEligibleForCertificate(0, 10)).toBe(false)
  })

  it('retorna true para exatamente 75% (3 de 4)', () => {
    expect(isEligibleForCertificate(3, 4)).toBe(true)
  })

  it('retorna false logo abaixo de 75% (7 de 10 = 70%)', () => {
    expect(isEligibleForCertificate(7, 10)).toBe(false)
  })

  it('retorna true acima de 75% (8 de 10 = 80%)', () => {
    expect(isEligibleForCertificate(8, 10)).toBe(true)
  })

  it('retorna true para 100% de presença', () => {
    expect(isEligibleForCertificate(10, 10)).toBe(true)
  })

  it('retorna false quando totalClasses é 0 (guarda de divisão)', () => {
    expect(isEligibleForCertificate(0, 0)).toBe(false)
  })
})
