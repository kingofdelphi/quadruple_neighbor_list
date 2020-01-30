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

export type HorizontalList = Array<Node>

export type Graph = Array<HorizontalList>

