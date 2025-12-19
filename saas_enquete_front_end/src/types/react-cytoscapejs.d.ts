declare module "react-cytoscapejs" {
  import { Component } from "react";
  import Cytoscape from "cytoscape";

  interface CytoscapeComponentProps {
    elements?: any[];
    style?: React.CSSProperties;
    layout?: any;
    stylesheet?: any[];
    cy?: (cy: Cytoscape.Core) => void;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}
