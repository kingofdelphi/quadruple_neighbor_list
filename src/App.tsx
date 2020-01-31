import React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as d3 from "d3";

import { Graph, Node, addValueToQNList, enumerate_LIS, slide_lis } from './lis_utils'

import './App.scss';

interface PathInfo {
  key: string
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
  const GAP = 20

  var container = svg.select('g.container')
  if (container.empty()) {
    svg.append('g')
      .attr('class', 'container')
      .attr('transform', `translate(${node_radius + GAP}, ${node_radius + GAP})`)
    container = svg.select('g.container')
  }


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
  const getKey = (a: number, b: number) => a + " " + b
  graph.forEach((horizontal_list, i) => {
    horizontal_list.forEach((node, j) => {
      nodes.push(node)
      if (j) {
        links.push(
          { key: getKey(horizontal_list[j - 1].index, node.index), nodeA: [i, j - 1], nodeB: [i, j] }
        );
      }
      if (node.upNeighborIndex != null) {
        links.push(
          { key: getKey(node.index, node.upNeighborIndex), nodeA: [i, j], nodeB: node_idx_to_i_j[node.upNeighborIndex] }
        );
      }
      if (node.downNeighborIndex != null) {
        links.push(
          { key: getKey(node.index, node.downNeighborIndex), nodeA: [i, j], nodeB: node_idx_to_i_j[node.downNeighborIndex] }
        );
      }
    });
  });

  var link_group = container.select('g.link-group')
  if (link_group.empty()) {
    container.append('g')
      .attr('class', 'link-group')
    link_group = container.select('g.link-group')
  }

  var linksel = link_group
    .selectAll<SVGLineElement, PathInfo>('line')
    .data(links, link => link.key)

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
    .merge(linksel)
    .each(function (d) {
      var nd = d3.select(this)
      const source = get_coords(d.nodeA);
      const target = get_coords(d.nodeB);

      var vec = [target.x - source.x, target.y - source.y]
      var dist = Math.hypot(vec[0], vec[1])
      vec[0] /= dist
      vec[1] /= dist

      var len = dist - 2 * node_radius - 3.5

      nd
      .transition()
      .duration(1000)
      .attr('opacity', 1)
      .attr("x1", source.x + node_radius * vec[0])
      .attr("y1", source.y + node_radius * vec[1])
      .attr("x2", source.x + (node_radius + len) * vec[0])
      .attr("y2", source.y + (node_radius + len) * vec[1])
      .attr('marker-end', 'url(#marker_arrow)')
    })

  var nodes_group = container.select('g.nodes-group')
  if (nodes_group.empty()) {
      container.append('g')
        .attr('class', 'nodes-group')
      nodes_group = container.select('g.nodes-group')
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
    .each(function(datum, i) {
      console.log(datum)
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
    .merge(node_objs)
    .transition()
    .duration(1000)
    .attr('opacity', 1)
    .attr('transform', (d) => {
        var coords = get_coords(node_idx_to_i_j[d.index]);
        return `translate(${coords.x}, ${coords.y})`
    })
    .tween('height-updater', function () {
      const nd = container.node() as SVGGElement
      return function(t) {
        svg
          .attr('width', nd.getBoundingClientRect().width + 2 * GAP)
          .attr('height', nd.getBoundingClientRect().height + 2 * GAP)
      };
    })


};

const App: React.FC = () => {
  const ref = useRef(null);
  const [usedCount, setUsedCount] = useState(0)
  const [graph, setGraph] = useState([])
  const [consoleValue, setConsoleValue] = useState("")
  const [slidingStart, setSlidingStart] = useState(0)

  const array = [3, 9, 6, 2, 8, 5, 7, 15, 20, 8, 3, 2, 51, 32, 1, -1, 51, 5];
  const [rising_length] = useState(array.map(d => 0))

  useEffect(() => {
    render(ref.current, graph);
  });

  const addLis = () => {
    if (usedCount === array.length) return
    addValueToQNList(usedCount, array, graph, rising_length, { start: slidingStart, end: usedCount })
    setUsedCount(usedCount + 1)
  };

  const clearLis = () => {
    setGraph([])
    setConsoleValue("")
    setUsedCount(0)
  }

  const enumerate = () => {
    const lises = enumerate_LIS(graph);
    setConsoleValue(lises.map(lis => lis.join(", ")).join("\n"))
  }

  const popHead = () => {
    if (slidingStart === array.length) return;
    setSlidingStart(slidingStart + 1)
    const ret = slide_lis(array, graph, rising_length, { start: slidingStart + 1, end: usedCount })
    setGraph(ret)
  }

  return (
    <div ref={ref} className="App">
      <div className="header">
      {array.map((d, i) => {
          const className = ["lis-item", i >= slidingStart && i < usedCount ? "used" : undefined].join(" ")
          return <>{i > 0 ? ", " : ""}<span className={className}>{d}</span></>
      })
      }
      <button onClick={addLis}>Add</button>
      <button onClick={popHead}>Pop</button>
      <button onClick={clearLis}>Clear</button>
      <button onClick={enumerate}>Enumerate</button>
      </div>
      <div className="graph">
      <svg width="100%" height="100%"></svg>
      </div>
      <div className="console">
        <textarea value={consoleValue}></textarea>
      </div>
    </div>
  );
}

export default App;
