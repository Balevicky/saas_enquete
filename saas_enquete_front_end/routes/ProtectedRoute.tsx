// import { Navigate } from "react-router-dom";
// import { usePermission } from "../rbac/usePermission";

// type Props = {
//   permission: string;
//   children: JSX.Element;
// };

// export default function ProtectedRoute({ permission, children }: Props) {
//   const allowed = usePermission(permission);

//   if (!allowed) {
//     return <Navigate to="/403" replace />;
//   }

//   return children;
// }
