"use client";

import { useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "var(--font-geist-sans), system-ui",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--fg)",
    padding: "8px 12px",
  },
};

const categoryStyle = {
  ...nodeDefaults.style,
  fontWeight: 600,
  background: "var(--fg)",
  color: "var(--bg)",
  border: "1px solid var(--fg)",
};

const rootStyle = {
  ...nodeDefaults.style,
  fontWeight: 700,
  fontSize: "14px",
  padding: "10px 16px",
};

const initialNodes: Node[] = [
  // Root
  {
    id: "observations",
    data: { label: "Observations" },
    position: { x: 0, y: 150 },
    ...nodeDefaults,
    style: rootStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Categories
  {
    id: "behavioral",
    data: { label: "Behavioral" },
    position: { x: 200, y: 0 },
    ...nodeDefaults,
    style: categoryStyle,
  },
  {
    id: "attitudinal",
    data: { label: "Attitudinal" },
    position: { x: 200, y: 150 },
    ...nodeDefaults,
    style: categoryStyle,
  },
  {
    id: "context",
    data: { label: "Context" },
    position: { x: 200, y: 300 },
    ...nodeDefaults,
    style: categoryStyle,
  },
  // Behavioral children
  {
    id: "b1",
    data: { label: "Product instrumentation" },
    position: { x: 400, y: -60 },
    ...nodeDefaults,
  },
  {
    id: "b2",
    data: { label: "Transactions" },
    position: { x: 400, y: -20 },
    ...nodeDefaults,
  },
  {
    id: "b3",
    data: { label: "CRM & lifecycle" },
    position: { x: 400, y: 20 },
    ...nodeDefaults,
  },
  {
    id: "b4",
    data: { label: "Support operations" },
    position: { x: 400, y: 60 },
    ...nodeDefaults,
  },
  // Attitudinal children
  {
    id: "a1",
    data: { label: "Surveys" },
    position: { x: 400, y: 110 },
    ...nodeDefaults,
  },
  {
    id: "a2",
    data: { label: "Interviews" },
    position: { x: 400, y: 150 },
    ...nodeDefaults,
  },
  {
    id: "a3",
    data: { label: "Call transcripts" },
    position: { x: 400, y: 190 },
    ...nodeDefaults,
  },
  // Context children
  {
    id: "c1",
    data: { label: "Firmographics" },
    position: { x: 400, y: 250 },
    ...nodeDefaults,
  },
  {
    id: "c2",
    data: { label: "Contract terms" },
    position: { x: 400, y: 290 },
    ...nodeDefaults,
  },
  {
    id: "c3",
    data: { label: "Compliance" },
    position: { x: 400, y: 330 },
    ...nodeDefaults,
  },
  {
    id: "c4",
    data: { label: "Market research" },
    position: { x: 400, y: 370 },
    ...nodeDefaults,
  },
];

const initialEdges: Edge[] = [
  // Root to categories
  { id: "e-obs-beh", source: "observations", target: "behavioral", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1.5 } },
  { id: "e-obs-att", source: "observations", target: "attitudinal", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1.5 } },
  { id: "e-obs-ctx", source: "observations", target: "context", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1.5 } },
  // Behavioral to children
  { id: "e-b1", source: "behavioral", target: "b1", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-b2", source: "behavioral", target: "b2", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-b3", source: "behavioral", target: "b3", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-b4", source: "behavioral", target: "b4", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  // Attitudinal to children
  { id: "e-a1", source: "attitudinal", target: "a1", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-a2", source: "attitudinal", target: "a2", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-a3", source: "attitudinal", target: "a3", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  // Context to children
  { id: "e-c1", source: "context", target: "c1", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-c2", source: "context", target: "c2", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-c3", source: "context", target: "c3", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
  { id: "e-c4", source: "context", target: "c4", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1 } },
];

export function ObservationsMindMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: "100%", height: "450px", border: "1px solid var(--border)", borderRadius: "8px", marginTop: "var(--space-4)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        panOnScroll
        zoomOnScroll={false}
        panOnDrag
        selectionOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
      </ReactFlow>
    </div>
  );
}

