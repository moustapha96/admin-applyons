// src/hooks/useOrgScope.js
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useOrgScope() {
    const { user } = useAuth();
    const role = user.role;
    const organizationId = user.organization.id || null;

    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
    const scope = useMemo(() => ({
        isAdmin,
        organizationId,
    }), [isAdmin, organizationId]);

    return scope;
}