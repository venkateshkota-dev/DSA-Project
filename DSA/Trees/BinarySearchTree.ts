/**
 * Algorithm/Data Structure Name: Binary Search Tree (BST)
 * 
 * Purpose:
 * A node-based binary tree data structure where the left subtree of a node contains only nodes with keys 
 * lesser than the node's key, and the right subtree contains only nodes with keys greater.
 * 
 * CineBook Use Case:
 * Stores and indexes booking records or movie IDs in sorted order for fast logarithmic retrieval O(log N).
 * 
 * Real-world Applications:
 * - Database indexing (B-trees variation)
 * - Map and Set implementations in language standard libraries (e.g. std::map)
 * - Router routing tables
 * 
 * Time Complexity:
 * - Search: O(log N) average, O(N) worst case (unbalanced)
 * - Insert: O(log N) average, O(N) worst case
 * - Delete: O(log N) average, O(N) worst case
 * 
 * Space Complexity:
 * - O(N) to store tree nodes.
 * - O(H) recursion stack where H is the height of the tree.
 * 
 * Advantages:
 * - Dynamic size and sorted ordering.
 * - Faster lookup, addition, and removal compared to standard arrays.
 * 
 * Limitations:
 * - Can become skewed (degenerate tree), losing its log N benefits. Needs self-balancing (like AVL) in production.
 * 
 * Pseudocode:
 * function insert(root, val):
 *   if root is null: return Node(val)
 *   if val < root.val: root.left = insert(root.left, val)
 *   else: root.right = insert(root.right, val)
 *   return root
 */

export class BSTNode<T> {
  val: T;
  left: BSTNode<T> | null = null;
  right: BSTNode<T> | null = null;

  constructor(val: T) {
    this.val = val;
  }
}

export interface BSTStep<T> {
  currentNodeId: T | null;
  compareNodeId: T | null;
  treeState: any;
  explanation: string;
}

export class BinarySearchTree<T> {
  root: BSTNode<T> | null = null;
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn;
  }

  /**
   * Serializes tree structure for UI rendering.
   */
  serializeTree(node: BSTNode<T> | null = this.root): any {
    if (!node) return null;
    return {
      val: node.val,
      left: this.serializeTree(node.left),
      right: this.serializeTree(node.right)
    };
  }

  /**
   * Standard insertion.
   */
  insert(val: T): void {
    const newNode = new BSTNode(val);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let current = this.root;
    while (true) {
      if (this.compare(val, current.val) < 0) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  /**
   * Generator insertion for visualization.
   */
  *insertGenerator(val: T): Generator<BSTStep<T>, void, unknown> {
    const treeState = this.serializeTree();
    if (!this.root) {
      this.root = new BSTNode(val);
      yield {
        currentNodeId: val,
        compareNodeId: null,
        treeState: this.serializeTree(),
        explanation: `Root was empty. Set ${JSON.stringify(val)} as the root node.`
      };
      return;
    }

    let current = this.root;
    while (true) {
      yield {
        currentNodeId: val,
        compareNodeId: current.val,
        treeState: this.serializeTree(),
        explanation: `Comparing insert value ${JSON.stringify(val)} with node ${JSON.stringify(current.val)}.`
      };

      if (this.compare(val, current.val) < 0) {
        if (!current.left) {
          current.left = new BSTNode(val);
          yield {
            currentNodeId: val,
            compareNodeId: current.val,
            treeState: this.serializeTree(),
            explanation: `Value is smaller. Inserted ${JSON.stringify(val)} as left child of ${JSON.stringify(current.val)}.`
          };
          break;
        }
        current = current.left;
        yield {
          currentNodeId: val,
          compareNodeId: current.val,
          treeState: this.serializeTree(),
          explanation: `Value is smaller. Moving to left child: ${JSON.stringify(current.val)}.`
        };
      } else {
        if (!current.right) {
          current.right = new BSTNode(val);
          yield {
            currentNodeId: val,
            compareNodeId: current.val,
            treeState: this.serializeTree(),
            explanation: `Value is greater or equal. Inserted ${JSON.stringify(val)} as right child of ${JSON.stringify(current.val)}.`
          };
          break;
        }
        current = current.right;
        yield {
          currentNodeId: val,
          compareNodeId: current.val,
          treeState: this.serializeTree(),
          explanation: `Value is greater or equal. Moving to right child: ${JSON.stringify(current.val)}.`
        };
      }
    }
  }

  /**
   * Search for a value.
   */
  search(val: T): boolean {
    let current = this.root;
    while (current) {
      const cmp = this.compare(val, current.val);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  /**
   * Generator search for visualization.
   */
  *searchGenerator(val: T): Generator<BSTStep<T>, boolean, unknown> {
    let current = this.root;
    const treeState = this.serializeTree();

    if (!current) {
      yield {
        currentNodeId: null,
        compareNodeId: null,
        treeState,
        explanation: `Tree is empty. Value ${JSON.stringify(val)} not found.`
      };
      return false;
    }

    while (current) {
      yield {
        currentNodeId: val,
        compareNodeId: current.val,
        treeState,
        explanation: `Comparing query value ${JSON.stringify(val)} with node ${JSON.stringify(current.val)}.`
      };

      const cmp = this.compare(val, current.val);
      if (cmp === 0) {
        yield {
          currentNodeId: val,
          compareNodeId: current.val,
          treeState,
          explanation: `Match found! Value ${JSON.stringify(val)} exists in the BST.`
        };
        return true;
      } else if (cmp < 0) {
        current = current.left;
        yield {
          currentNodeId: val,
          compareNodeId: current ? current.val : null,
          treeState,
          explanation: `Value is smaller. Traversing left subtree.`
        };
      } else {
        current = current.right;
        yield {
          currentNodeId: val,
          compareNodeId: current ? current.val : null,
          treeState,
          explanation: `Value is greater. Traversing right subtree.`
        };
      }
    }

    yield {
      currentNodeId: val,
      compareNodeId: null,
      treeState,
      explanation: `Reached leaf boundary. Value ${JSON.stringify(val)} does not exist in the BST.`
    };
    return false;
  }

  /**
   * Standard deletion.
   */
  delete(val: T): void {
    this.root = this.deleteNode(this.root, val);
  }

  private deleteNode(node: BSTNode<T> | null, val: T): BSTNode<T> | null {
    if (!node) return null;

    const cmp = this.compare(val, node.val);
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, val);
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, val);
    } else {
      // Node found
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Two children: get inorder successor (minimum in right subtree)
      node.val = this.minValue(node.right);
      node.right = this.deleteNode(node.right, node.val);
    }
    return node;
  }

  private minValue(node: BSTNode<T>): T {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current.val;
  }

  /**
   * Generator deletion for visualization.
   */
  *deleteGenerator(val: T): Generator<BSTStep<T>, void, unknown> {
    const treeState = this.serializeTree();
    yield {
      currentNodeId: val,
      compareNodeId: null,
      treeState,
      explanation: `Initiating deletion of ${JSON.stringify(val)}.`
    };

    // Run custom deletion generator
    const self = this;
    function* deleteRec(node: BSTNode<T> | null, value: T): Generator<BSTStep<T>, BSTNode<T> | null, unknown> {
      if (!node) {
        yield {
          currentNodeId: value,
          compareNodeId: null,
          treeState: self.serializeTree(),
          explanation: `Node ${JSON.stringify(value)} not found. Nothing to delete.`
        };
        return null;
      }

      yield {
        currentNodeId: value,
        compareNodeId: node.val,
        treeState: self.serializeTree(),
        explanation: `Comparing deletion target ${JSON.stringify(value)} with current node ${JSON.stringify(node.val)}.`
      };

      const cmp = self.compare(value, node.val);
      if (cmp < 0) {
        const result: BSTNode<T> | null = yield* deleteRec(node.left, value);
        node.left = result;
      } else if (cmp > 0) {
        const result: BSTNode<T> | null = yield* deleteRec(node.right, value);
        node.right = result;
      } else {
        // Node found
        yield {
          currentNodeId: value,
          compareNodeId: node.val,
          treeState: self.serializeTree(),
          explanation: `Found target node ${JSON.stringify(node.val)} to delete. Evaluating children count.`
        };

        if (!node.left) {
          yield {
            currentNodeId: value,
            compareNodeId: node.right ? node.right.val : null,
            treeState: self.serializeTree(),
            explanation: `Node has no left child. Replacing with right child: ${node.right ? JSON.stringify(node.right.val) : 'null'}.`
          };
          return node.right;
        }
        if (!node.right) {
          yield {
            currentNodeId: value,
            compareNodeId: node.left.val,
            treeState: self.serializeTree(),
            explanation: `Node has no right child. Replacing with left child: ${JSON.stringify(node.left.val)}.`
          };
          return node.left;
        }

        // Two children
        const minRight = self.minValue(node.right);
        yield {
          currentNodeId: value,
          compareNodeId: minRight,
          treeState: self.serializeTree(),
          explanation: `Node has two children. Finding inorder successor: minimum of right subtree which is ${JSON.stringify(minRight)}.`
        };

        node.val = minRight;
        yield {
          currentNodeId: value,
          compareNodeId: node.val,
          treeState: self.serializeTree(),
          explanation: `Replacing value of node with successor value: ${JSON.stringify(minRight)}. Now deleting successor from right subtree.`
        };

        const result: BSTNode<T> | null = yield* deleteRec(node.right, minRight);
        node.right = result;
      }
      return node;
    }

    this.root = yield* deleteRec(this.root, val);
    yield {
      currentNodeId: null,
      compareNodeId: null,
      treeState: this.serializeTree(),
      explanation: `Deletion process completed successfully.`
    };
  }
}
