import React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as d3 from "d3";

import { Graph, Node, addValueToQNList } from './lis_utils'

import './App.css';

interface PathInfo {
  nodeA: [number, number]
  nodeB: [number, number]
}

const render = (root: HTMLElement, graph: Graph) => {

  var svg = d3
    .select(root)
    .select('svg')

  var defs = svg.select('defs')
  if (defs.empty()) {
    svg.append('defs').attr('class', 'defs')
    defs = svg.select('defs')
  }

  defs.selectAll('marker')
    .data([0])
    .enter()
    .append('marker')
    .attr('id', 'marker_arrow')
    .attr('markerHeight', 5)
    .attr('markerWidth', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('refX', 0)
    .attr('refY', 0)
    .attr('viewBox', '-5 -5 10 10')
    .append('svg:path')
    .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
    .attr('fill', 'black');


  const node_radius = 20;
  const node_gap = 50;

  const get_coords = ([row, col]: [number, number]) => 
                                  ({ x: col * (2 * node_radius + node_gap), y: row * (2 * node_radius + node_gap) });

  var links: PathInfo[] = [];
  var node_idx_to_i_j: { [name: number]: [number, number] } = {

  }
  graph.forEach((horizontal_list, i) => {
    horizontal_list.forEach((node, j) => {
      node_idx_to_i_j[node.index] = [i, j]
    })
  })
  const nodes: Array<Node> = []
  graph.forEach((horizontal_list, i) => {
    horizontal_list.forEach((node, j) => {
      nodes.push(node)
      if (j) {
        links.push(
          { nodeA: [i, j - 1], nodeB: [i, j] }
        );
      }
      if (node.upNeighborIndex != null) {
        links.push(
          { nodeA: [i, j], nodeB: node_idx_to_i_j[node.upNeighborIndex] }
        );
      }
      if (node.downNeighborIndex != null) {
        links.push(
          { nodeA: [i, j], nodeB: node_idx_to_i_j[node.downNeighborIndex] }
        );
      }
    });
  });

  var link_group = svg.select('g.link-group')
  if (link_group.empty()) {
      svg.append('g')
      .attr('class', 'link-group')
    link_group = svg.select('g.link-group')
  }

  var linksel = link_group
    .selectAll<SVGGElement, PathInfo>('line')
    .data(links, ({ nodeA, nodeB}) => {
      var ids = [nodeA[0], nodeA[1], nodeB[0], nodeB[1]].join(" ")
      return ids
    });

  linksel
    .exit()
    .transition()
    .duration(200)
    .attr('opacity', 0)
    .remove();

  linksel
    .enter()
    .append('line')
    .attr('opacity', 0)
    .attr('class', 'link')
    .attr('transform', 'translate(100, 100)')
    .each(function (d) {
      const source = get_coords(d.nodeA);
      const target = get_coords(d.nodeB);

      var nd = d3.select(this);
      var vec = [target.x - source.x, target.y - source.y]
      var dist = Math.hypot(vec[0], vec[1])
      vec[0] /= dist
      vec[1] /= dist

      var len = dist - 2 * node_radius - 3.5

      nd.attr("x1", source.x + node_radius * vec[0])
      .attr("y1", source.y + node_radius * vec[1])
      .attr("x2", source.x + (node_radius + len) * vec[0])
      .attr("y2", source.y + (node_radius + len) * vec[1])
      .attr('marker-end', 'url(#marker_arrow)')
    })
    .transition()
    .duration(200)
    .attr('opacity', 1)

  var nodes_group = svg.select('g.nodes-group')
  if (nodes_group.empty()) {
      svg.append('g')
      .attr('class', 'nodes-group')
      .attr('transform', 'translate(100, 100)')
      nodes_group = svg.select('g.nodes-group')
  }

  var node_objs = nodes_group
    .selectAll<SVGGElement, Node>('g')
    .data(nodes, d => "" + d.index)

  node_objs
  .exit()
  .transition()
  .duration(200)
  .attr('opacity', 0)
  .remove();

  // create nodes
  node_objs
    .enter()
    .append('g')
    .attr('opacity', 0)
    .attr('class', 'node')
    .attr('transform', (d) => {
        var coords = get_coords(node_idx_to_i_j[d.index]);
        return `translate(${coords.x}, ${coords.y})`
    })
    .merge(node_objs)
    .each(function(datum, i) {
        var node = d3.select(this);
        var circle = node.select('circle')
        if (circle.empty()) {
          node.append('circle');
          circle = node.select('circle')
        }
        var text = node.select('text');
        if (text.empty()) {
          node
            .append('text')
            .attr('class', 'elem-value')
            .attr('alignment-baseline', 'central')
            .attr("text-anchor", "middle")
            .text(datum.value)
        }
        circle
          .attr('r', node_radius)
          .attr('cx', function(d) {
              return 0
          })
          .attr('cy', function(d) {
              return 0
          })
    })
    .transition()
    .duration(200)
    .attr('opacity', 1)

};

const App: React.FC = () => {
  const ref = useRef(null);
  const [usedCount, setUsedCount] = useState(0)
  const [graph, setGraph] = useState([])

  const array = [3, 9, 6, 2, 8, 5, 7];
  const [rising_length] = useState(array.map(d => 0))

  useEffect(() => {
    render(ref.current, graph);
  });

  const addLis = () => {
    if (usedCount === array.length) return
    addValueToQNList(usedCount, array, graph, rising_length)
    setUsedCount(usedCount + 1)
  };

  const clearLis = () => {
    setGraph([])
    setUsedCount(0)
  }

  return (
    <div ref={ref} className="App">
      <div>
      {array.map((d, i) => {
          const className = ["lis-item", i < usedCount ? "used" : undefined].join(" ")
          return <>{i > 0 ? ", " : ""}<span className={className}>{d}</span></>
      })
      }
      <button onClick={addLis}>Add</button>
      <button onClick={clearLis}>Clear</button>
      </div>
      <svg width="100%" height="400"></svg>
    </div>
  );
}

export default App;
