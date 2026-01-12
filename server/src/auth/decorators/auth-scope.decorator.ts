import { SetMetadata } from "@nestjs/common";

export type AuthScope = "local" | "azure" | "both";
export const AUTH_SCOPE_KEY = "authScope";
export const AuthScope = (scope: AuthScope) => SetMetadata(AUTH_SCOPE_KEY, scope);
