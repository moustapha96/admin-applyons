import { useAuth } from "@/hooks/useAuth";

export function useAuthz() {
    const { user } = useAuth();
    console.log(user)

    const role = user && user.role;
    const permKeys = (user && user.permissions || []).map((p) => p.key || p);
    console.log(permKeys)

    const hasRole = (...roles) => roles.length === 0 || roles.includes(role);
    const hasAny = (...keys) =>
        keys.length === 0 || keys.some((k) => permKeys.includes(k));
    const hasAll = (...keys) => keys.every((k) => permKeys.includes(k));

    console.log(hasRole("ADMIN"))
    return { user, role, permKeys, hasRole, hasAny, hasAll };
}