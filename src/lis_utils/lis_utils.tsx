export const get_left_neighbor = (array: Array<number>, idx: number) => {
  var orig = array[idx];
  while (--idx >= 0) {
    if (array[idx] < orig) {
      return idx;
    }
  }
  return null;
};

export const get_right_neighbor = (array: Array<number>, idx: number) => {
  var orig = array[idx];
  while (++idx < array.length) {
    if (array[idx] > orig) {
      return idx;
    }
  }
  return null;
};

enum Neighbour {
    Up = 1,
    Down,
}

export const get_updown_neighbor = (idx: number, neighbour: Neighbour, rising_length: Array<number>) => {
  var orig = rising_length[idx];
  while (--idx >= 0) {
    if (neighbour === Neighbour.Up && rising_length[idx] + 1 === orig) {
      return idx;
    }
    if (neighbour === Neighbour.Down && rising_length[idx] - 1 === orig) {
      return idx;
    }
  }
  return null;
};


export interface Node {
  value: number
  index: number
  upNeighborIndex?: number
  leftNeighborIndex?: number
  rightNeighborIndex?: number
  downNeighborIndex?: number
}

export const addValueToQNList = (index: number, data: Array<number>, graph: Graph, rising_length: Array<number>) => {
    var value = data[index]
    var i = 0;
    while (i < graph.length) {
      var horz_list = graph[i]
      if (horz_list[horz_list.length - 1].value >= value) {
        break;
      }
      i++
    }
    if (i >= graph.length) {
      graph.push([])
    }
    var node: Node = { value, index }
    graph[i].push(node)
    rising_length[index] = i + 1

    node.upNeighborIndex = get_updown_neighbor(index, Neighbour.Up, rising_length)
    node.downNeighborIndex = get_updown_neighbor(index, Neighbour.Down, rising_length)
}

const enumerate_LIS_ending_at = (graph: Graph, elemIdx: [number, number]): Array<Array<number>> => {
  var horz_list = graph[elemIdx[0]]
  var element = horz_list[elemIdx[1]]
  if (element.upNeighborIndex === null) {
    return [[element.value]]
  }

  let col = -1;
  const horz_list_above = graph[elemIdx[0] - 1]
  horz_list_above.forEach((node, j) => {
    if (node.index === element.upNeighborIndex) {
      col = j;
    }
  })
  const result: Array<Array<number>> = []
  while (col >= 0) {
    if (horz_list_above[col].value >= element.value) break
    const lises = enumerate_LIS_ending_at(graph, [elemIdx[0] - 1, col])
    lises.forEach(lis => {
      lis.push(element.value)
      result.push(lis)
    })
    col--
  }

  return result
}

export const enumerate_LIS = (graph: Graph) => {
  const result: Array<Array<number>> = [];
  graph.forEach((horz_list, i) => {
      horz_list.forEach((node, j) => {
          const lises = enumerate_LIS_ending_at(graph, [i, j])
          lises.forEach(d => result.push(d))
      })
  })
  return result;
}

export type HorizontalList = Array<Node>

export type Graph = Array<HorizontalList>

