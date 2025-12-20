import { ButtonGroup } from "react-bootstrap";
import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Question } from "../../services/questionService";
import { QuestionType } from "../../types/question";

interface Props {
  questions: Question[];
}

/* 🎨 Couleurs par type */
const TYPE_COLORS: Record<QuestionType, string> = {
  TEXT: "#e3f2fd",
  TEXTAREA: "#e3f2fd",
  NUMBER: "#fff3e0",
  SCALE: "#ede7f6",
  SINGLE_CHOICE: "#e8f5e9",
  MULTIPLE_CHOICE: "#e8f5e9",
  DATE: "#fce4ec",
  EMAIL: "#fce4ec",
  PHONE: "#fce4ec",
};

/* 📐 Layout DAG */
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 240;
const nodeHeight = 70;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  dagreGraph.setGraph({
    rankdir: "TB", // Top → Bottom
    ranksep: 80,
    nodesep: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

const QuestionDependencyGraph = ({ questions }: Props) => {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = questions.map((q) => ({
      id: q.id,
      data: {
        label: (
          <div>
            <strong>
              {q.position}. {q.label}
            </strong>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{q.type}</div>
          </div>
        ),
      },
      position: { x: 0, y: 0 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: {
        background: TYPE_COLORS[q.type],
        border: "1px solid #555",
        borderRadius: 8,
        padding: 8,
        width: nodeWidth,
      },
    }));

    const edges: Edge[] = [];

    questions.forEach((q) => {
      if (!q.nextMap) return;

      Object.entries(q.nextMap).forEach(([answer, targetId]) => {
        if (questions.find((x) => x.id === targetId)) {
          edges.push({
            id: `${q.id}-${targetId}-${answer}`,
            source: q.id,
            target: targetId,
            label: answer,
            animated: true,
            style: { stroke: "#444" },
            labelStyle: {
              fontSize: 11,
              fill: "#000",
              fontWeight: 500,
            },
          });
        }
      });
    });

    return getLayoutedElements(nodes, edges);
  }, [questions]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      panOnScroll
      zoomOnScroll
      zoomOnPinch
      nodesDraggable={false}
      nodesConnectable={false}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default QuestionDependencyGraph;

// ========================================== TRES ButtonGroup
// import React, { useMemo } from "react";
// import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
// import "reactflow/dist/style.css";
// import { Question } from "../../services/questionService";

// /* ===========================
//    TYPES STABLES (GLOBAL)
//    =========================== */
// const nodeTypes = {};
// const edgeTypes = {};

// interface Props {
//   questions: Question[];
// }

// const QuestionDependencyGraph = ({ questions }: Props) => {
//   /* ===========================
//      NODES + EDGES
//      =========================== */
//   const { nodes, edges } = useMemo(() => {
//     const nodes: Node[] = questions.map((q, index) => ({
//       id: q.id,
//       data: {
//         label: `Q${q.position} - ${q.label}`,
//       },
//       position: {
//         x: index * 220,
//         y: 100,
//       },
//     }));

//     const edges: Edge[] = [];

//     questions.forEach((q) => {
//       if (!q.nextMap) return;

//       Object.entries(q.nextMap).forEach(([option, targetId]) => {
//         if (!targetId) return;

//         edges.push({
//           id: `${q.id}-${targetId}-${option}`,
//           source: q.id,
//           target: targetId,
//           label: option,
//           animated: true,
//         });
//       });
//     });

//     return { nodes, edges };
//   }, [questions]);

//   if (!nodes.length) {
//     return <p className="text-muted">Aucune dépendance à afficher</p>;
//   }

//   return (
//     <div style={{ height: 420 }} className="border rounded">
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         nodeTypes={nodeTypes}
//         edgeTypes={edgeTypes}
//         fitView
//       >
//         <Background />
//         <Controls />
//       </ReactFlow>
//     </div>
//   );
// };

// export default QuestionDependencyGraph;

// ================================== Bon
// import React, { useMemo } from "react";
// import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
// import "reactflow/dist/style.css";
// import { Question } from "../../services/questionService";

// // 🔹 Définition des types en dehors du composant (stables)
// const nodeTypes = {};
// const edgeTypes = {};

// interface Props {
//   questions: Question[];
// }

// const QuestionDependencyGraph = ({ questions }: Props) => {
//   // Mémoïsation des nodes et edges
//   const { nodes, edges } = useMemo(() => {
//     const nodes: Node[] = questions.map((q, index) => ({
//       id: q.id,
//       data: { label: `Q${q.position} - ${q.label}` },
//       position: { x: 100 * index, y: 100 },
//       type: "default",
//     }));

//     const edges: Edge[] = [];

//     questions.forEach((q) => {
//       if (!q.nextMap) return;

//       Object.entries(q.nextMap).forEach(([option, targetId]) => {
//         if (!targetId) return;

//         edges.push({
//           id: `${q.id}-${targetId}-${option}`,
//           source: q.id,
//           target: targetId,
//           label: option,
//           animated: true,
//         });
//       });
//     });

//     return { nodes, edges };
//   }, [questions]);

//   if (nodes.length === 0) {
//     return <p className="text-muted">Aucune dépendance à afficher</p>;
//   }

//   return (
//     <div style={{ height: 400 }} className="border rounded">
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         nodeTypes={nodeTypes} // stable
//         edgeTypes={edgeTypes} // stable
//         fitView
//       >
//         <Background />
//         <Controls />
//       </ReactFlow>
//     </div>
//   );
// };

// export default QuestionDependencyGraph;

// ====================================
// // src/components/questions/QuestionDependencyGraph.tsx
// import React, { useMemo } from "react";
// import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
// import "reactflow/dist/style.css";
// import { Question } from "../../services/questionService";

// interface Props {
//   questions: Question[];
// }

// const QuestionDependencyGraph = ({ questions }: Props) => {
//   const { nodes, edges } = useMemo(() => {
//     const nodes: Node[] = questions.map((q, index) => ({
//       id: q.id,
//       data: { label: `Q${q.position} - ${q.label}` },
//       position: { x: 100 * index, y: 100 },
//       type: "default",
//     }));

//     const edges: Edge[] = [];

//     questions.forEach((q) => {
//       if (!q.nextMap) return;

//       Object.entries(q.nextMap).forEach(([option, targetId]) => {
//         if (!targetId) return;

//         edges.push({
//           id: `${q.id}-${targetId}-${option}`,
//           source: q.id,
//           target: targetId,
//           label: option,
//           animated: true,
//         });
//       });
//     });

//     return { nodes, edges };
//   }, [questions]);

//   if (nodes.length === 0) {
//     return <p className="text-muted">Aucune dépendance à afficher</p>;
//   }

//   return (
//     <div style={{ height: 400 }} className="border rounded">
//       <ReactFlow nodes={nodes} edges={edges} fitView>
//         <Background />
//         <Controls />
//       </ReactFlow>
//     </div>
//   );
// };

// export default QuestionDependencyGraph;
