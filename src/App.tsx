import React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as d3 from "d3";

import { Graph, Node, HorizontalList, addValueToQNList } from './lis_utils'

import './App.css';

interface PathInfo {
  nodeA: [number, number]
  nodeB: [number, number]
}

const render = (root: HTMLElement, graph: Graph) => {
  var u = d3
    .select(root)
    .select('svg')
    .selectAll<SVGGElement, HorizontalList>('g.horizontal-list')
    .data(graph);

  u.exit().remove()

  const node_radius = 20;
  const node_gap = 50;

  const get_coords = ([row, col]: [number, number]) => 
                                  ({ x: col * (2 * node_radius + node_gap), y: row * (2 * node_radius + node_gap) });

  var links: PathInfo[] = [];
  graph.forEach((horizontal_list, i) => {
    horizontal_list.forEach((node, j) => {
      if (j) {
        links.push(
          { nodeA: [i, j - 1], nodeB: [i, j] }
        );
      }
    });
  });

  var link_group = d3.select(root).select('svg').select('g.link-group')
  if (link_group.empty()) {
    d3.select(root)
      .select('svg')
      .append('g')
      .attr('class', 'link-group')
    link_group = d3.select(root).select('svg').select('g.link-group')
  }

  var linksel = link_group
    .selectAll<SVGGElement, PathInfo>('line')
    .data(links);

  linksel.exit().remove();

  linksel
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('z-index', -1)
    .attr('transform', 'translate(100, 100)')
    .each(function (d) {
      const source = get_coords(d.nodeA);
      const target = get_coords(d.nodeB);

      var nd = d3.select(this);

      nd.attr("x1", function(d) { return source.x; })
      .attr("y1", function(d) { return source.y; })
      .attr("x2", function(d) { return target.x; })
      .attr("y2", function(d) { return target.y; });
    });

  var horizontal_lists_enter = u.enter()
    .append('g')
    .attr('class', 'horizontal-list')

  horizontal_lists_enter.exit().remove();

  var horizontal_lists = horizontal_lists_enter
    .merge(u)
    .attr('transform', 'translate(100, 100)')
    .attr('cx', function(d) {
      return 0
    })
    .attr('cy', function(d) {
      return 0
    });

  // create nodes
  horizontal_lists.each(function(horizontal_list, i) {
    var group = d3.select(this);
    var upd = group
      .selectAll<SVGGElement, Node>('g.node')
      .data(horizontal_list, d => "" + d.index)

    upd.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d, idx) => {
        var coords = get_coords([i, idx]);
        return `translate(${coords.x}, ${coords.y})`
      })
      .merge(upd)
      .each(function (datum, j) {
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
          circle.attr('r', node_radius)
          .attr('cx', function(d) {
            return 0
          })
          .attr('cy', function(d) {
            return 0
          })
      })

  });

};

const App: React.FC = () => {
  const ref = useRef(null);
  const [usedCount, setUsedCount] = useState(0)
  const [graph] = useState([])

  const array = [1, 5, 3, 2, 8, 10, 7];
  const [rising_length] = useState(array.map(d => 0))

  useEffect(() => {
    render(ref.current, graph);
  });

  const addLis = () => {
    if (usedCount === array.length) return
    addValueToQNList(usedCount, array, graph, rising_length)
    setUsedCount(usedCount + 1)
  };

  return (
    <div ref={ref} className="App">
      <div>
      {array.map((d, i) => {
          const className = ["lis-item", i < usedCount ? "used" : undefined].join(" ")
          return <>{i > 0 ? ", " : ""}<span className={className}>{d}</span></>
      })
      }
      <button onClick={addLis}>Add</button>
      </div>
      <svg width="100%" height="400"></svg>
    </div>
  );
}

export default App;
