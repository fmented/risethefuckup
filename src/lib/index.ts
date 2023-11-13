import type { Ticket as T, Merch as M } from '@prisma/client'




export type Ticket = T & { valid: boolean, name?: string, id: string }
export type Merch = M & { valid: boolean, id: string }


export type CheckReturn<T> = Promise<T | null>
export type APIResponse<T> = T | { error: string }


