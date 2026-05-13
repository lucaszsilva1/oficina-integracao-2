import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { signToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-unit-tests'
})

describe('signToken', () => {
  it('retorna string quando recebe payload válido', async () => {
    const token = await signToken({ id: '1', email: 'a@b.com', role: 'ADMIN' })
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })
})

describe('verifyToken', () => {
  afterEach(() => { vi.useRealTimers() })

  it('retorna payload quando token é válido', async () => {
    const payload = { id: '1', email: 'a@b.com', role: 'ADMIN' as const }
    const token = await signToken(payload)
    const result = await verifyToken(token)
    expect(result.id).toBe(payload.id)
    expect(result.email).toBe(payload.email)
    expect(result.role).toBe(payload.role)
  })

  it('lança erro quando token é inválido', async () => {
    await expect(verifyToken('token-invalido')).rejects.toThrow()
  })

  it('lança erro quando token está expirado', async () => {
    vi.useFakeTimers()
    const token = await signToken({ id: '1', email: 'a@b.com', role: 'ADMIN' })
    vi.setSystemTime(Date.now() + 9 * 60 * 60 * 1000)
    await expect(verifyToken(token)).rejects.toThrow()
  })
})

describe('hashPassword', () => {
  it('retorna string diferente da senha original', async () => {
    const hash = await hashPassword('minhasenha')
    expect(hash).not.toBe('minhasenha')
    expect(typeof hash).toBe('string')
  })

  it('retorna hash diferente a cada chamada (salt)', async () => {
    const hash1 = await hashPassword('minhasenha')
    const hash2 = await hashPassword('minhasenha')
    expect(hash1).not.toBe(hash2)
  })
})

describe('comparePassword', () => {
  it('retorna true para senha correta', async () => {
    const hash = await hashPassword('senhaCorreta')
    const result = await comparePassword('senhaCorreta', hash)
    expect(result).toBe(true)
  })

  it('retorna false para senha incorreta', async () => {
    const hash = await hashPassword('senhaCorreta')
    const result = await comparePassword('senhaErrada', hash)
    expect(result).toBe(false)
  })
})
