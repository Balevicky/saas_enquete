// src/components/respondents/RespondentStatusBadge.tsx
interface Props {
  completedAt?: string | null;
}

const RespondentStatusBadge: React.FC<Props> = ({ completedAt }) => {
  const status = completedAt ? "Completed" : "Pending";
  const color = completedAt ? "green" : "orange";

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        backgroundColor: color,
        color: "white",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
};

export default RespondentStatusBadge;

// src/components/respondents/RespondentStatusBadge.tsx
// import { Respondent } from "../../services/respondentService";
// import { getRespondentStatus } from "../../utils/respondentStatus";

// interface Props {
//   respondent: Respondent;
// }

// const RespondentStatusBadge = ({ respondent }: Props) => {
//   const status = getRespondentStatus(respondent);

//   const isCompleted = status === "completed";

//   return (
//     <span
//       style={{
//         padding: "4px 8px",
//         borderRadius: 6,
//         fontSize: 12,
//         fontWeight: 600,
//         background: isCompleted ? "#d1e7dd" : "#fff3cd",
//         color: isCompleted ? "#0f5132" : "#664d03",
//       }}
//     >
//       {isCompleted ? "Completed" : "Pending"}
//     </span>
//   );
// };

// export default RespondentStatusBadge;

// =================================
// interface Props {
//   completedAt?: string | null;
// }

// const RespondentStatusBadge = ({ completedAt }: Props) => {
//   const isCompleted = !!completedAt;

//   return (
//     <span
//       style={{
//         padding: "4px 8px",
//         borderRadius: 6,
//         fontSize: 12,
//         fontWeight: 600,
//         background: isCompleted ? "#d1e7dd" : "#fff3cd",
//         color: isCompleted ? "#0f5132" : "#664d03",
//       }}
//     >
//       {isCompleted ? "Completed" : "Pending"}
//     </span>
//   );
// };

// export default RespondentStatusBadge;

// =========================
// interface Props {
//   status: "pending" | "completed";
// }

// const RespondentStatusBadge = ({ status }: Props) => {
//   const color = status === "completed" ? "green" : "orange";
//   const label = status === "completed" ? "Complété" : "En attente";

//   return (
//     <span
//       style={{
//         backgroundColor: color,
//         color: "#fff",
//         padding: "2px 6px",
//         borderRadius: 4,
//         fontSize: 12,
//         fontWeight: 600,
//       }}
//     >
//       {label}
//     </span>
//   );
// };

// export default RespondentStatusBadge;

// ==================================
// import React from "react";

// interface Props {
//   status: "pending" | "completed";
// }

// const RespondentStatusBadge = ({ status }: Props) => {
//   const styles: Record<string, React.CSSProperties> = {
//     pending: {
//       background: "#ffc107",
//       color: "#fff",
//       padding: "2px 6px",
//       borderRadius: 4,
//       fontSize: 12,
//     },
//     completed: {
//       background: "#28a745",
//       color: "#fff",
//       padding: "2px 6px",
//       borderRadius: 4,
//       fontSize: 12,
//     },
//   };

//   return <span style={styles[status]}>{status}</span>;
// };

// export default RespondentStatusBadge;
// interface Props {
//   status: "PENDING" | "COMPLETED" | "CANCELLED";
// }

// const RespondentStatusBadge = ({ status }: Props) => {
//   const colorMap: Record<Props["status"], string> = {
//     PENDING: "#ffc107",
//     COMPLETED: "#28a745",
//     CANCELLED: "#dc3545",
//   };

//   return (
//     <span
//       style={{
//         background: colorMap[status],
//         color: "#fff",
//         padding: "2px 8px",
//         borderRadius: 4,
//       }}
//     >
//       {status}
//     </span>
//   );
// };

// export default RespondentStatusBadge;
