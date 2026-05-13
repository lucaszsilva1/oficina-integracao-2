import { Role } from '@prisma/client'

export type TokenPayload = {
  id: string
  email: string
  role: Role
}
