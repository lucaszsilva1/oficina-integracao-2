import { describe, it, expect } from 'vitest'
import { getApiErrorMessage } from '@/lib/api-error'

describe('getApiErrorMessage', () => {
  it('retorna a própria string quando o erro já é texto', () => {
    expect(getApiErrorMessage('Não autorizado', 'fallback')).toBe('Não autorizado')
  })

  it('extrai a primeira mensagem de fieldErrors de um erro Zod flatten', () => {
    const flattened = {
      formErrors: [],
      fieldErrors: { email: ['Email inválido'], password: ['Senha muito curta'] },
    }
    expect(getApiErrorMessage(flattened, 'fallback')).toBe('Email inválido')
  })

  it('prioriza formErrors quando presentes', () => {
    const flattened = {
      formErrors: ['Erro geral'],
      fieldErrors: { email: ['Email inválido'] },
    }
    expect(getApiErrorMessage(flattened, 'fallback')).toBe('Erro geral')
  })

  it('usa o fallback quando o erro é um objeto Zod sem mensagens', () => {
    expect(getApiErrorMessage({ formErrors: [], fieldErrors: {} }, 'fallback')).toBe('fallback')
  })

  it('usa o fallback quando o erro é undefined', () => {
    expect(getApiErrorMessage(undefined, 'fallback')).toBe('fallback')
  })

  it('usa o fallback quando o erro é um objeto desconhecido', () => {
    expect(getApiErrorMessage({ foo: 'bar' }, 'fallback')).toBe('fallback')
  })
})
