export const ROLES = {
    ADMIN: "admin",
    SELLER: "seller",
    BUYER: "buyer",
    CREATOR: "CREATOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];