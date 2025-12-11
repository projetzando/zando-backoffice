import { describe, it, expect } from 'vitest'
import {
  UserRole,
  canAccessBackoffice,
  isAdmin,
  isSuperAdmin,
  BACKOFFICE_ROLES,
  ADMIN_ROLES,
} from '~/utils/constants/roles'

describe('UserRole enum', () => {
  it('devrait contenir tous les rôles', () => {
    expect(UserRole.BUYER).toBe('buyer')
    expect(UserRole.SELLER).toBe('seller')
    expect(UserRole.ADMIN).toBe('admin')
    expect(UserRole.SUPERADMIN).toBe('superadmin')
  })
})

describe('canAccessBackoffice', () => {
  it('devrait autoriser seller', () => {
    expect(canAccessBackoffice(UserRole.SELLER)).toBe(true)
  })

  it('devrait autoriser admin', () => {
    expect(canAccessBackoffice(UserRole.ADMIN)).toBe(true)
  })

  it('devrait autoriser superadmin', () => {
    expect(canAccessBackoffice(UserRole.SUPERADMIN)).toBe(true)
  })

  it('ne devrait pas autoriser buyer', () => {
    expect(canAccessBackoffice(UserRole.BUYER)).toBe(false)
  })

  it('ne devrait pas autoriser null', () => {
    expect(canAccessBackoffice(null)).toBe(false)
  })

  it('ne devrait pas autoriser undefined', () => {
    expect(canAccessBackoffice(undefined)).toBe(false)
  })

  it('ne devrait pas autoriser une chaîne vide', () => {
    expect(canAccessBackoffice('')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('devrait retourner true pour admin', () => {
    expect(isAdmin(UserRole.ADMIN)).toBe(true)
  })

  it('devrait retourner true pour superadmin', () => {
    expect(isAdmin(UserRole.SUPERADMIN)).toBe(true)
  })

  it('ne devrait pas retourner true pour seller', () => {
    expect(isAdmin(UserRole.SELLER)).toBe(false)
  })

  it('ne devrait pas retourner true pour buyer', () => {
    expect(isAdmin(UserRole.BUYER)).toBe(false)
  })

  it('ne devrait pas retourner true pour null', () => {
    expect(isAdmin(null)).toBe(false)
  })
})

describe('isSuperAdmin', () => {
  it('devrait retourner true uniquement pour superadmin', () => {
    expect(isSuperAdmin(UserRole.SUPERADMIN)).toBe(true)
  })

  it('ne devrait pas retourner true pour admin', () => {
    expect(isSuperAdmin(UserRole.ADMIN)).toBe(false)
  })

  it('ne devrait pas retourner true pour seller', () => {
    expect(isSuperAdmin(UserRole.SELLER)).toBe(false)
  })

  it('ne devrait pas retourner true pour buyer', () => {
    expect(isSuperAdmin(UserRole.BUYER)).toBe(false)
  })
})

describe('constantes de rôles', () => {
  it('BACKOFFICE_ROLES devrait contenir les bons rôles', () => {
    expect(BACKOFFICE_ROLES).toEqual([UserRole.SELLER, UserRole.ADMIN, UserRole.SUPERADMIN])
  })

  it('ADMIN_ROLES devrait contenir les bons rôles', () => {
    expect(ADMIN_ROLES).toEqual([UserRole.ADMIN, UserRole.SUPERADMIN])
  })
})
