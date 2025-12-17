import React from "react";

export type SurveyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface SurveyFiltersProps {
  search: string;
  status?: SurveyStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: SurveyStatus) => void;
}

const SurveyFilters: React.FC<SurveyFiltersProps> = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 16,
        alignItems: "center",
      }}
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un survey..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          padding: "6px 10px",
          border: "1px solid #ccc",
          borderRadius: 4,
          minWidth: 220,
        }}
      />

      {/* Status */}
      <select
        value={status ?? ""}
        onChange={(e) =>
          onStatusChange(
            e.target.value ? (e.target.value as SurveyStatus) : undefined
          )
        }
        style={{
          padding: "6px 10px",
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      >
        <option value="">Tous les statuts</option>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>
    </div>
  );
};

export default SurveyFilters;
