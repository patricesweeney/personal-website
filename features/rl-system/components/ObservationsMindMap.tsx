"use client";

import { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
  ConnectionLineType,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

// Descriptions for tooltips
const descriptions: Record<string, string> = {
  behavioral: "Records what actually happened in the system",
  attitudinal: "Captures what customers report or imply",
  context: "Describes what the customer is and what binds them",
  b1: "Events, sessions, usage persistence",
  b2: "Billing, payments, renewals, expansions",
  b3: "Touches, stages, campaigns",
  b4: "Tickets, SLA breaches, incident exposure",
  a1: "NPS, CSAT, custom questionnaires",
  a2: "Customer discovery, win/loss analysis",
  a3: "Sales calls, support calls, CS check-ins",
  c1: "Industry, size, tech stack, growth stage",
  c2: "Terms, procurement process, budget cycles",
  c3: "Security, privacy, regulatory requirements",
  c4: "Competitor intel, market trends",
};

// Which nodes are children of which category
const categoryChildren: Record<string, string[]> = {
  behavioral: ["b1", "b2", "b3", "b4"],
  attitudinal: ["a1", "a2", "a3"],
  context: ["c1", "c2", "c3", "c4"],
};

const baseNodeStyle = {
  borderRadius: "8px",
  fontSize: "13px",
  fontFamily: "var(--font-geist-sans), system-ui",
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--fg)",
  padding: "8px 12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const createNodes = (collapsed: Record<string, boolean>, hoveredNode: string | null): Node[] => {
  const nodes: Node[] = [
    // Root
    {
      id: "observations",
      data: { label: "Observations" },
      position: { x: 0, y: 150 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        ...baseNodeStyle,
        fontWeight: 700,
        fontSize: "14px",
        padding: "10px 16px",
        transform: hoveredNode === "observations" ? "scale(1.05)" : "scale(1)",
        boxShadow: hoveredNode === "observations" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
      },
    },
    // Categories
    {
      id: "behavioral",
      data: { label: collapsed.behavioral ? "Behavioral +" : "Behavioral −" },
      position: { x: 200, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        ...baseNodeStyle,
        fontWeight: 600,
        background: "var(--fg)",
        color: "var(--bg)",
        border: "1px solid var(--fg)",
        transform: hoveredNode === "behavioral" ? "scale(1.05)" : "scale(1)",
        boxShadow: hoveredNode === "behavioral" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
      },
    },
    {
      id: "attitudinal",
      data: { label: collapsed.attitudinal ? "Attitudinal +" : "Attitudinal −" },
      position: { x: 200, y: 150 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        ...baseNodeStyle,
        fontWeight: 600,
        background: "var(--fg)",
        color: "var(--bg)",
        border: "1px solid var(--fg)",
        transform: hoveredNode === "attitudinal" ? "scale(1.05)" : "scale(1)",
        boxShadow: hoveredNode === "attitudinal" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
      },
    },
    {
      id: "context",
      data: { label: collapsed.context ? "Context +" : "Context −" },
      position: { x: 200, y: 300 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        ...baseNodeStyle,
        fontWeight: 600,
        background: "var(--fg)",
        color: "var(--bg)",
        border: "1px solid var(--fg)",
        transform: hoveredNode === "context" ? "scale(1.05)" : "scale(1)",
        boxShadow: hoveredNode === "context" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
      },
    },
  ];

  // Behavioral children
  if (!collapsed.behavioral) {
    nodes.push(
      { id: "b1", data: { label: "Product instrumentation" }, position: { x: 400, y: -60 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "b1" ? "scale(1.05)" : "scale(1)" } },
      { id: "b2", data: { label: "Transactions" }, position: { x: 400, y: -20 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "b2" ? "scale(1.05)" : "scale(1)" } },
      { id: "b3", data: { label: "CRM & lifecycle" }, position: { x: 400, y: 20 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "b3" ? "scale(1.05)" : "scale(1)" } },
      { id: "b4", data: { label: "Support operations" }, position: { x: 400, y: 60 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "b4" ? "scale(1.05)" : "scale(1)" } },
    );
  }

  // Attitudinal children
  if (!collapsed.attitudinal) {
    nodes.push(
      { id: "a1", data: { label: "Surveys" }, position: { x: 400, y: 110 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "a1" ? "scale(1.05)" : "scale(1)" } },
      { id: "a2", data: { label: "Interviews" }, position: { x: 400, y: 150 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "a2" ? "scale(1.05)" : "scale(1)" } },
      { id: "a3", data: { label: "Call transcripts" }, position: { x: 400, y: 190 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "a3" ? "scale(1.05)" : "scale(1)" } },
    );
  }

  // Context children
  if (!collapsed.context) {
    nodes.push(
      { id: "c1", data: { label: "Firmographics" }, position: { x: 400, y: 250 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "c1" ? "scale(1.05)" : "scale(1)" } },
      { id: "c2", data: { label: "Contract terms" }, position: { x: 400, y: 290 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "c2" ? "scale(1.05)" : "scale(1)" } },
      { id: "c3", data: { label: "Compliance" }, position: { x: 400, y: 330 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "c3" ? "scale(1.05)" : "scale(1)" } },
      { id: "c4", data: { label: "Market research" }, position: { x: 400, y: 370 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { ...baseNodeStyle, transform: hoveredNode === "c4" ? "scale(1.05)" : "scale(1)" } },
    );
  }

  return nodes;
};

const createEdges = (collapsed: Record<string, boolean>, hoveredNode: string | null): Edge[] => {
  const edges: Edge[] = [
    // Root to categories
    { id: "e-obs-beh", source: "observations", target: "behavioral", type: "smoothstep", style: { stroke: hoveredNode === "behavioral" || hoveredNode === "observations" ? "var(--fg)" : "var(--border)", strokeWidth: 1.5, transition: "stroke 0.2s" } },
    { id: "e-obs-att", source: "observations", target: "attitudinal", type: "smoothstep", style: { stroke: hoveredNode === "attitudinal" || hoveredNode === "observations" ? "var(--fg)" : "var(--border)", strokeWidth: 1.5, transition: "stroke 0.2s" } },
    { id: "e-obs-ctx", source: "observations", target: "context", type: "smoothstep", style: { stroke: hoveredNode === "context" || hoveredNode === "observations" ? "var(--fg)" : "var(--border)", strokeWidth: 1.5, transition: "stroke 0.2s" } },
  ];

  // Behavioral edges
  if (!collapsed.behavioral) {
    const isHighlighted = hoveredNode === "behavioral" || categoryChildren.behavioral.includes(hoveredNode || "");
    edges.push(
      { id: "e-b1", source: "behavioral", target: "b1", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "b1" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-b2", source: "behavioral", target: "b2", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "b2" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-b3", source: "behavioral", target: "b3", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "b3" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-b4", source: "behavioral", target: "b4", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "b4" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
    );
  }

  // Attitudinal edges
  if (!collapsed.attitudinal) {
    const isHighlighted = hoveredNode === "attitudinal" || categoryChildren.attitudinal.includes(hoveredNode || "");
    edges.push(
      { id: "e-a1", source: "attitudinal", target: "a1", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "a1" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-a2", source: "attitudinal", target: "a2", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "a2" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-a3", source: "attitudinal", target: "a3", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "a3" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
    );
  }

  // Context edges
  if (!collapsed.context) {
    const isHighlighted = hoveredNode === "context" || categoryChildren.context.includes(hoveredNode || "");
    edges.push(
      { id: "e-c1", source: "context", target: "c1", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "c1" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-c2", source: "context", target: "c2", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "c2" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-c3", source: "context", target: "c3", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "c3" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
      { id: "e-c4", source: "context", target: "c4", type: "smoothstep", style: { stroke: isHighlighted || hoveredNode === "c4" ? "var(--fg)" : "var(--border)", strokeWidth: 1, transition: "stroke 0.2s" } },
    );
  }

  return edges;
};

function MindMapInner() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    behavioral: false,
    attitudinal: false,
    context: false,
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  const nodes = useMemo(() => createNodes(collapsed, hoveredNode), [collapsed, hoveredNode]);
  const edges = useMemo(() => createEdges(collapsed, hoveredNode), [collapsed, hoveredNode]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (["behavioral", "attitudinal", "context"].includes(node.id)) {
      setCollapsed(prev => {
        const newCollapsed = { ...prev, [node.id]: !prev[node.id] };
        // Fit view after state update
        setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50);
        return newCollapsed;
      });
    }
  }, [fitView]);

  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const tooltip = hoveredNode && descriptions[hoveredNode] ? descriptions[hoveredNode] : null;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ width: "100%", height: "450px", border: "1px solid var(--border)", borderRadius: "8px", marginTop: "var(--space-4)", overflow: "hidden" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          panOnScroll
          zoomOnScroll
          panOnDrag
          selectionOnDrag={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} style={{ borderRadius: "8px", border: "1px solid var(--border)" }} />
          <MiniMap 
            nodeColor={(node) => {
              if (node.id === "observations") return "var(--fg)";
              if (["behavioral", "attitudinal", "context"].includes(node.id)) return "var(--fg)";
              return "var(--border)";
            }}
            maskColor="rgba(255,255,255,0.8)"
            style={{ borderRadius: "8px", border: "1px solid var(--border)" }}
          />
        </ReactFlow>
      </div>
      {tooltip && (
        <div style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--fg)",
          color: "var(--bg)",
          padding: "8px 16px",
          borderRadius: "6px",
          fontSize: "13px",
          fontFamily: "var(--font-geist-sans), system-ui",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

export function ObservationsMindMap() {
  return (
    <ReactFlowProvider>
      <MindMapInner />
    </ReactFlowProvider>
  );
}
