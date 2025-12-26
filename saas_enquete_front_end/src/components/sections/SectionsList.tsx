// src/components/sections/SectionsList.tsx
// src/components/sections/SectionsList.tsx
// src/components/sections/SectionsList.tsx
import React, { useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import sectionService, { Section } from "../../services/sectionService";
import SortableSectionItem from "./SortableSectionItem";
import { useConfirm } from "../ConfirmProvider";

interface Props {
  tenantSlug: string;
  surveyId: string;
  sections: Section[]; // contrôlé par Redux
  onSectionsChange: (sections: Section[]) => void;
}

const SectionsList: React.FC<Props> = ({
  tenantSlug,
  surveyId,
  sections,
  onSectionsChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const confirm = useConfirm();

  /**
   * ➕ Ajouter une section
   */
  const handleAddSection = async () => {
    const newSection = await sectionService.create(tenantSlug, surveyId, {
      title: "Nouvelle section",
    });

    // ✅ éviter les doublons si section existe déjà
    const exists = sections.some((s) => s.id === newSection.id);
    const updated = exists ? sections : [...sections, newSection];

    onSectionsChange(updated);
    setEditingId(newSection.id);
  };

  /**
   * ✏️ Renommer une section
   */
  const handleRename = async (id: string, newTitle: string) => {
    await sectionService.update(tenantSlug, id, { title: newTitle });

    const updated = sections.map((s) =>
      s.id === id ? { ...s, title: newTitle } : s
    );

    onSectionsChange(updated);
    setEditingId(null);
  };

  /**
   * 🗑 Supprimer une section
   */
  const handleDelete = async (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    const confirmed = await confirm(
      <>
        <p>
          Êtes-vous sûr de vouloir supprimer la section{" "}
          <strong>{section.title}</strong> ?
        </p>
        <p className="text-muted mb-0">
          Les questions associées seront déplacées hors section.
        </p>
      </>,
      {
        title: "Supprimer la section",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (!confirmed) return;

    await sectionService.remove(tenantSlug, id);
    const updated = sections.filter((s) => s.id !== id);
    onSectionsChange(updated);
  };

  /**
   * 🔀 Drag & Drop
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(sections, oldIndex, newIndex).map(
      (section, index) => ({ ...section, position: index })
    );

    onSectionsChange(reordered);

    await sectionService.reorder(
      tenantSlug,
      surveyId,
      String(active.id),
      newIndex
    );
  };

  return (
    <div>
      <button
        className="mb-3 px-3 py-1 bg-blue-500 text-white rounded"
        onClick={handleAddSection}
      >
        ➕ Ajouter une section
      </button>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              isEditing={editingId === section.id}
              onRename={handleRename}
              onDelete={handleDelete}
              onStartEdit={() => setEditingId(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionsList;

// ========================================== Pas bon
// import React, { useState } from "react";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import sectionService, { Section } from "../../services/sectionService";
// import SortableSectionItem from "./SortableSectionItem";
// import { useConfirm } from "../ConfirmProvider";

// interface Props {
//   tenantSlug: string;
//   surveyId: string;
//   sections: Section[]; // ✅ contrôlé par Redux
//   onSectionsChange: (sections: Section[]) => void;
// }

// const SectionsList: React.FC<Props> = ({
//   tenantSlug,
//   surveyId,
//   sections,
//   onSectionsChange,
// }) => {
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const confirm = useConfirm();

//   /**
//    * ➕ Ajouter une section
//    */
//   const handleAddSection = async () => {
//     const newSection = await sectionService.create(tenantSlug, surveyId, {
//       title: "Nouvelle section",
//     });

//     // S'assurer qu'on n'ajoute pas une section déjà existante
//     const exists = sections.some((s) => s.id === newSection.id);
//     const updated = exists ? sections : [...sections, newSection];

//     onSectionsChange(updated);
//     setEditingId(newSection.id);
//   };

//   // const handleAddSection = async () => {
//   //   const newSection = await sectionService.create(tenantSlug, surveyId, {
//   //     title: "Nouvelle section",
//   //   });

//   //   const updated = [...sections, newSection];
//   //   onSectionsChange(updated);
//   //   setEditingId(newSection.id);
//   // };

//   /**
//    * ✏️ Renommer une section
//    */
//   const handleRename = async (id: string, newTitle: string) => {
//     await sectionService.update(tenantSlug, id, { title: newTitle });

//     const updated = sections.map((s) =>
//       s.id === id ? { ...s, title: newTitle } : s
//     );

//     onSectionsChange(updated);
//     setEditingId(null);
//   };

//   /**
//    * 🗑 Supprimer une section
//    */
//   const handleDelete = async (id: string) => {
//     const section = sections.find((s) => s.id === id);

//     const confirmed = await confirm(
//       <>
//         <p>
//           Êtes-vous sûr de vouloir supprimer la section{" "}
//           <strong>{section?.title}</strong> ?
//         </p>
//         <p className="text-muted mb-0">
//           Les questions associées seront déplacées hors section.
//         </p>
//       </>,
//       {
//         title: "Supprimer la section",
//         confirmText: "Supprimer",
//         cancelText: "Annuler",
//       }
//     );

//     if (!confirmed) return;

//     await sectionService.remove(tenantSlug, id);

//     const updated = sections.filter((s) => s.id !== id);
//     onSectionsChange(updated);
//   };

//   /**
//    * 🔀 Drag & Drop des sections
//    */
//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = sections.findIndex((s) => s.id === active.id);
//     const newIndex = sections.findIndex((s) => s.id === over.id);

//     const reordered = arrayMove(sections, oldIndex, newIndex).map(
//       (section, index) => ({
//         ...section,
//         position: index,
//       })
//     );

//     onSectionsChange(reordered);

//     await sectionService.reorder(
//       tenantSlug,
//       surveyId,
//       String(active.id),
//       newIndex
//     );
//   };

//   return (
//     <div>
//       <button
//         className="mb-3 px-3 py-1 bg-blue-500 text-white rounded"
//         onClick={handleAddSection}
//       >
//         ➕ Ajouter une section
//       </button>

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={sections.map((s) => s.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           {sections.map((section) => (
//             <SortableSectionItem
//               key={section.id}
//               section={section}
//               isEditing={editingId === section.id}
//               onRename={handleRename}
//               onDelete={handleDelete}
//               onStartEdit={() => setEditingId(section.id)}
//             />
//           ))}
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// };

// export default SectionsList;

// ============================== PAS BON
// import React, { useState } from "react";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";

// import sectionService, { Section } from "../../services/sectionService";
// import SortableSectionItem from "./SortableSectionItem";
// import { useConfirm } from "../ConfirmProvider";

// interface Props {
//   tenantSlug: string;
//   surveyId: string;
//   initialSections: Section[];
//   onSectionsChange?: (sections: Section[]) => void;
// }

// const SectionsList: React.FC<Props> = ({
//   tenantSlug,
//   surveyId,
//   initialSections,
//   onSectionsChange,
// }) => {
//   const [sections, setSections] = useState<Section[]>(initialSections);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const confirm = useConfirm();

//   /**
//    * ➕ Ajouter une section
//    */
//   const handleAddSection = async () => {
//     const newSection = await sectionService.create(tenantSlug, surveyId, {
//       title: "Nouvelle section",
//     });

//     const updated = [...sections, newSection];
//     setSections(updated);
//     setEditingId(newSection.id);
//     onSectionsChange?.(updated);
//   };

//   /**
//    * ✏️ Renommer une section
//    */
//   const handleRename = async (id: string, newTitle: string) => {
//     await sectionService.update(tenantSlug, id, {
//       title: newTitle,
//     });

//     const updated = sections.map((s) =>
//       s.id === id ? { ...s, title: newTitle } : s
//     );

//     setSections(updated);
//     setEditingId(null);
//     onSectionsChange?.(updated);
//   };

//   /**
//    * 🗑 Supprimer une section (ConfirmProvider)
//    */
//   const handleDelete = async (id: string) => {
//     const section = sections.find((s) => s.id === id);

//     const confirmed = await confirm(
//       <>
//         <p>
//           Êtes-vous sûr de vouloir supprimer la section{" "}
//           <strong>{section?.title}</strong> ?
//         </p>
//         <p className="text-muted mb-0">
//           Les questions associées seront déplacées hors section.
//         </p>
//       </>,
//       {
//         title: "Supprimer la section",
//         confirmText: "Supprimer",
//         cancelText: "Annuler",
//       }
//     );

//     if (!confirmed) return;

//     await sectionService.remove(tenantSlug, id);

//     const updated = sections.filter((s) => s.id !== id);
//     setSections(updated);
//     onSectionsChange?.(updated);
//   };

//   /**
//    * 🔀 Drag & Drop des sections
//    */
//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;

//     if (!over || active.id === over.id) return;

//     const oldIndex = sections.findIndex((s) => s.id === active.id);
//     const newIndex = sections.findIndex((s) => s.id === over.id);

//     const reordered = arrayMove(sections, oldIndex, newIndex);

//     const updated = reordered.map((section, index) => ({
//       ...section,
//       position: index,
//     }));

//     setSections(updated);
//     onSectionsChange?.(updated);

//     await sectionService.reorder(
//       tenantSlug,
//       surveyId,
//       String(active.id),
//       newIndex
//     );
//   };

//   return (
//     <div>
//       <button
//         className="mb-3 px-3 py-1 bg-blue-500 text-white rounded"
//         onClick={handleAddSection}
//       >
//         ➕ Ajouter une section
//       </button>

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={sections.map((s) => s.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           {sections.map((section) => (
//             <SortableSectionItem
//               key={section.id}
//               section={section}
//               isEditing={editingId === section.id}
//               onRename={handleRename}
//               onDelete={handleDelete}
//               onStartEdit={() => setEditingId(section.id)}
//             />
//           ))}
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// };

// export default SectionsList;
