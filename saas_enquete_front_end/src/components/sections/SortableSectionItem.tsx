// src/components/sections/SortableSectionItem.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Section } from "../../services/sectionService";

interface Props {
  section: Section;
  isEditing: boolean;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: () => void;
}

const SortableSectionItem: React.FC<Props> = ({
  section,
  isEditing,
  onRename,
  onDelete,
  onStartEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#fafafa",
    // backgroundColor: isDragging ? "#e0f7fa" : "white",
    backgroundColor: isDragging ? "#e0f7fa" : "#fafafa",
  };

  const [title, setTitle] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔄 Synchronisation si la section change depuis le parent
  useEffect(() => {
    setTitle(section.title);
  }, [section.title]);

  // 🎯 Focus auto en édition inline
  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  // ✅ Commit du renommage
  const commitRename = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(section.title);
      return;
    }
    if (trimmed !== section.title) {
      onRename(section.id, trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setTitle(section.title);
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* ===== Drag Handle ===== */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab mr-2 select-none"
        title="Déplacer la section"
      >
        {/* ≡ */}☰
      </span>

      {/* ===== Titre / édition inline ===== */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          className="border px-2 py-1 rounded flex-1"
        />
      ) : (
        <span
          onClick={onStartEdit}
          className="cursor-pointer flex-1 select-none"
        >
          {/* {section.title} */}
          {section.position + 1}. {section.title}
        </span>
      )}

      {/* ===== Bouton supprimer ===== */}
      <button
        onClick={() => onDelete(section.id)}
        className="ml-2 text-red-500 hover:text-red-700 btn btn-outline-danger"
        // className="btn btn-outline-danger"
        title="Supprimer la section"
      >
        {/* 🗑 */}
        🗑️
      </button>
    </div>
  );
};

export default SortableSectionItem;

// ============================ Pas bon
// src/components/sections/SortableSectionItem.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Section } from "../../services/sectionService";

// interface Props {
//   section: Section;
//   isEditing: boolean;
//   onRename: (id: string, newTitle: string) => void;
//   onDelete: (id: string) => void;
//   onStartEdit: () => void;
// }

// const SortableSectionItem: React.FC<Props> = ({
//   section,
//   isEditing,
//   onRename,
//   onDelete,
//   onStartEdit,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: section.id,
//     });

//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: "8px",
//     border: "1px solid #ddd",
//     borderRadius: "4px",
//     marginBottom: "4px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fafafa",
//     cursor: "grab",
//   };

//   const [title, setTitle] = useState(section.title);
//   const inputRef = useRef<HTMLInputElement>(null);

//   /**
//    * 🔄 Synchronisation si la section change depuis le parent
//    */
//   useEffect(() => {
//     setTitle(section.title);
//   }, [section.title]);

//   /**
//    * 🎯 Focus auto en édition inline
//    */
//   useEffect(() => {
//     if (isEditing) inputRef.current?.focus();
//   }, [isEditing]);

//   /**
//    * ✅ Commit du renommage
//    */
//   const commitRename = () => {
//     const trimmed = title.trim();

//     if (!trimmed) {
//       setTitle(section.title);
//       return;
//     }

//     if (trimmed !== section.title) {
//       onRename(section.id, trimmed);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") commitRename();
//     if (e.key === "Escape") setTitle(section.title);
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {isEditing ? (
//         <input
//           ref={inputRef}
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           onBlur={commitRename}
//           onKeyDown={handleKeyDown}
//           className="border px-2 py-1 rounded w-full"
//         />
//       ) : (
//         <span
//           onClick={onStartEdit}
//           className="cursor-pointer flex-1 select-none"
//         >
//           {section.title}
//         </span>
//       )}

//       <button
//         onClick={() => onDelete(section.id)}
//         className="ml-2 text-red-500 hover:text-red-700"
//         title="Supprimer la section"
//       >
//         🗑
//       </button>
//     </div>
//   );
// };

// export default SortableSectionItem;
