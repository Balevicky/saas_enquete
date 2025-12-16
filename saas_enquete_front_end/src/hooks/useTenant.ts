import { useParams } from "react-router-dom";
import { useMemo } from "react";

/**
 * Hook pour récupérer le tenantSlug courant
 * Priorité :
 * 1. React Router useParams()
 * 2. localStorage fallback
 */
export const useTenant = (): { tenantSlug: string } => {
  const params = useParams<{ tenantSlug: string }>();

  const tenantSlug = useMemo(() => {
    return params.tenantSlug || localStorage.getItem("tenantSlug") || "";
  }, [params.tenantSlug]);

  if (!tenantSlug) {
    throw new Error(
      "Tenant slug is missing! Make sure the route has /t/:tenantSlug or tenantSlug is in localStorage"
    );
  }

  return { tenantSlug };
};
