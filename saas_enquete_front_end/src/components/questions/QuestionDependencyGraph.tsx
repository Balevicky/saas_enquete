// src/components/questions/QuestionDependencyGraph.tsx
import React, { useEffect, useRef } from "react";
import Cytoscape from "cytoscape";

export interface Node {
  id: string;
  label: string;
}

export interface Edge {
  source: string;
  target: string;
  label?: string;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
}

const QuestionDependencyGraph: React.FC<Props> = ({ nodes, edges }) => {
  const cyRef = useRef<Cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateEdgeId = (source: string, target: string) =>
    `${source}-${target}`;

  useEffect(() => {
    if (!containerRef.current) return;

    const nodeIds = nodes.map((n) => n.id);

    // Séparer edges valides et invalides
    const validEdges = edges.filter(
      (e) =>
        e.source &&
        e.target &&
        nodeIds.includes(e.source) &&
        nodeIds.includes(e.target)
    );

    const invalidEdges = edges.filter(
      (e) =>
        !e.target || !nodeIds.includes(e.target) || !nodeIds.includes(e.source)
    );

    const elements = [
      ...nodes.map((n) => ({ data: { id: n.id, label: n.label } })),
      ...validEdges.map((e) => ({
        data: {
          id: generateEdgeId(e.source, e.target),
          source: e.source,
          target: e.target,
          label: e.label,
        },
        classes: "valid-edge",
      })),
      ...invalidEdges.map((e) => ({
        data: {
          id: generateEdgeId(e.source, e.target),
          source: e.source,
          target: e.target || "",
          label: e.label,
        },
        classes: "invalid-edge",
      })),
    ];

    if (!cyRef.current) {
      cyRef.current = Cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#0074D9",
              label: "data(label)",
              color: "#fff",
              "text-valign": "center",
              "text-halign": "center",
              "font-size": "12px",
            },
          },
          {
            selector: "edge.valid-edge",
            style: {
              width: 2,
              "line-color": "#aaa",
              "target-arrow-color": "#aaa",
              "target-arrow-shape": "triangle",
              label: "data(label)",
              "curve-style": "bezier",
              "font-size": "10px",
            },
          },
          {
            selector: "edge.invalid-edge",
            style: {
              width: 3,
              "line-color": "red",
              "target-arrow-color": "red",
              "target-arrow-shape": "triangle",
              "line-style": "dashed",
              label: "data(label)",
              "curve-style": "bezier",
              "font-size": "10px",
            },
          },
        ],
        layout: { name: "cose", animate: true },
      });
    } else {
      cyRef.current.elements().remove();
      cyRef.current.add(elements);
      cyRef.current.layout({ name: "cose", animate: true }).run();
    }
  }, [nodes, edges]);

  return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />;
};

export default QuestionDependencyGraph;

// ======================================
// import React, { useEffect, useRef } from "react";
// import Cytoscape from "cytoscape";
// // src/components/questions/QuestionDependencyGraph.tsx
// // src/components/questions/QuestionDependencyGraph.tsx

// export interface Node {
//   id: string;
//   label: string;
// }

// export interface Edge {
//   source: string;
//   target: string;
//   label?: string;
// }

// interface Props {
//   nodes: Node[];
//   edges: Edge[];
// }

// const QuestionDependencyGraph: React.FC<Props> = ({ nodes, edges }) => {
//   const cyRef = useRef<Cytoscape.Core | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const generateEdgeId = (source: string, target: string) =>
//     `${source}-${target}`;

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const nodeIds = nodes.map((n) => n.id);

//     // Séparer les edges valides et invalides
//     const validEdges = edges.filter(
//       (e) => nodeIds.includes(e.source) && nodeIds.includes(e.target)
//     );

//     const invalidEdges = edges.filter(
//       (e) => !nodeIds.includes(e.source) || !nodeIds.includes(e.target)
//     );

//     const elements = [
//       ...nodes.map((n) => ({ data: { id: n.id, label: n.label } })),
//       ...validEdges.map((e) => ({
//         data: {
//           id: generateEdgeId(e.source, e.target),
//           source: e.source,
//           target: e.target,
//           label: e.label,
//         },
//         classes: "valid-edge",
//       })),
//       ...invalidEdges.map((e) => ({
//         data: {
//           id: generateEdgeId(e.source, e.target),
//           source: e.source,
//           target: e.target,
//           label: e.label,
//         },
//         classes: "invalid-edge",
//       })),
//     ];

//     if (!cyRef.current) {
//       cyRef.current = Cytoscape({
//         container: containerRef.current,
//         elements,
//         style: [
//           {
//             selector: "node",
//             style: {
//               "background-color": "#0074D9",
//               label: "data(label)",
//               color: "#fff",
//               "text-valign": "center",
//               "text-halign": "center",
//             },
//           },
//           {
//             selector: "edge.valid-edge",
//             style: {
//               width: 2,
//               "line-color": "#aaa",
//               "target-arrow-color": "#aaa",
//               "target-arrow-shape": "triangle",
//               label: "data(label)",
//               "curve-style": "bezier",
//             },
//           },
//           {
//             selector: "edge.invalid-edge",
//             style: {
//               width: 3,
//               "line-color": "red",
//               "target-arrow-color": "red",
//               "target-arrow-shape": "triangle",
//               label: "data(label)",
//               "curve-style": "bezier",
//               "line-style": "dashed",
//             },
//           },
//         ],
//         layout: { name: "cose" },
//       });
//     } else {
//       cyRef.current.elements().remove();
//       cyRef.current.add(elements);
//       cyRef.current.layout({ name: "cose" }).run();
//     }
//   }, [nodes, edges]);

//   return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />;
// };

// export default QuestionDependencyGraph;

// ============================ Bon mais graphe pas Button
// src/components/questions/QuestionDependencyGraph.tsx
// import React, { useEffect, useRef } from "react";
// import Cytoscape from "cytoscape";

// export interface Node {
//   id: string;
//   label: string;
// }

// export interface Edge {
//   source: string;
//   target: string;
//   label?: string;
// }

// interface Props {
//   nodes: Node[];
//   edges: Edge[];
// }

// const QuestionDependencyGraph: React.FC<Props> = ({ nodes, edges }) => {
//   const cyRef = useRef<Cytoscape.Core | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const generateEdgeId = (source: string, target: string) =>
//     `${source}-${target}`;

//   useEffect(() => {
//     if (!containerRef.current) return;

//     // Filtrer edges invalides
//     const validEdges = edges.filter(
//       (e) =>
//         nodes.some((n) => n.id === e.source) &&
//         nodes.some((n) => n.id === e.target)
//     );

//     const elements = [
//       ...nodes.map((n) => ({ data: { id: n.id, label: n.label } })),
//       ...validEdges.map((e) => ({
//         data: {
//           id: generateEdgeId(e.source, e.target),
//           source: e.source,
//           target: e.target,
//           label: e.label,
//         },
//       })),
//     ];

//     if (!cyRef.current) {
//       cyRef.current = Cytoscape({
//         container: containerRef.current,
//         elements,
//         style: [
//           {
//             selector: "node",
//             style: {
//               "background-color": "#0074D9",
//               label: "data(label)",
//               color: "#fff",
//               "text-valign": "center",
//               "text-halign": "center",
//             },
//           },
//           {
//             selector: "edge",
//             style: {
//               width: 2,
//               "line-color": "#aaa",
//               "target-arrow-color": "#aaa",
//               "target-arrow-shape": "triangle",
//               label: "data(label)",
//               "curve-style": "bezier",
//             },
//           },
//         ],
//         layout: { name: "cose" },
//       });
//     } else {
//       cyRef.current.elements().remove();
//       cyRef.current.add(elements);
//       cyRef.current.layout({ name: "cose" }).run();
//     }
//   }, [nodes, edges]);

//   return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />;
// };

// export default QuestionDependencyGraph;

// ====================================
// import React, { useMemo } from "react";
// import CytoscapeComponent from "react-cytoscapejs";
// import { Question } from "../../services/questionService";
// import { Button } from "react-bootstrap";

// interface Props {
//   questions: Question[];
// }

// const QuestionDependencyGraph = ({ questions }: Props) => {
//   // Création des nodes et edges pour Cytoscape
//   const elements = useMemo(() => {
//     const nodes = questions.map((q, index) => ({
//       data: { id: q.id, label: `Q${q.position} - ${q.label}` },
//     }));

//     const edges: any[] = [];
//     questions.forEach((q) => {
//       if (!q.nextMap) return;

//       Object.entries(q.nextMap).forEach(([option, targetId]) => {
//         if (!targetId) return;

//         edges.push({
//           data: {
//             id: `${q.id}-${targetId}-${option}`,
//             source: q.id,
//             target: targetId,
//             label: option,
//           },
//         });
//       });
//     });

//     return [...nodes, ...edges];
//   }, [questions]);

//   if (elements.length === 0) {
//     return <p className="text-muted">Aucune dépendance à afficher</p>;
//   }

//   return (
//     <div style={{ height: 400, border: "1px solid #ddd", borderRadius: 8 }}>
//       <CytoscapeComponent
//         elements={elements}
//         style={{ width: "100%", height: "100%" }}
//         layout={{ name: "breadthfirst", directed: true, padding: 10 }}
//         stylesheet={[
//           {
//             selector: "node",
//             style: {
//               content: "data(label)",
//               textValign: "center",
//               textHalign: "center",
//               backgroundColor: "#007bff",
//               color: "#fff",
//               width: 80,
//               height: 40,
//               borderRadius: 4,
//             },
//           },
//           {
//             selector: "edge",
//             style: {
//               curveStyle: "bezier",
//               targetArrowShape: "triangle",
//               lineColor: "#555",
//               targetArrowColor: "#555",
//               label: "data(label)",
//               fontSize: 10,
//               textRotation: "autorotate",
//             },
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default QuestionDependencyGraph;

// ==================================
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
