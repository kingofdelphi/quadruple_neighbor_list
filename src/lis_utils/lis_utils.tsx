export const get_left_neighbor = (array: Array<number>, idx: number) => {
  var orig = array[idx];
  var left_neighbour = null;
  while (--idx > 0) {
    if (array[idx] < orig) {
      return idx;
    }
  }
  return left_neighbour;
};

export const get_right_neighbor = (array: Array<number>, idx: number) => {
  var orig = array[idx];
  var left_neighbour = null;
  while (++idx < array.length) {
    if (array[idx] > orig) {
      return idx;
    }
  }
  return left_neighbour;
};



export interface Node {
  value: number
  index: number
  upNeighborIndex?: number
  leftNeighborIndex?: number
  rightNeighborIndex?: number
  downNeighborIndex?: number
}

export type HorizontalList = Array<Node>

export type Graph = Array<HorizontalList>

