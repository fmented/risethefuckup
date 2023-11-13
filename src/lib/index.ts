import type { Ticket as T, Merch as M } from '@prisma/client'




export type Ticket = T & { valid: boolean, name?: string }
export type Merch = M & { valid: boolean }


export type CheckReturn<T> = Promise<T | null>
export type APIResponse<T> = T | { error: string }


