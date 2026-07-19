"use strict";
/**
 * Algorithm/Data Structure Name: Binary Tree (Hierarchical Tree Structure)
 *
 * Purpose:
 * A tree data structure in which each node has at most two children, referred to as the left child and the right child.
 *
 * CineBook Use Case:
 * Educational visualization of hierarchical relationships (e.g. movie category breakdowns, corporate theatre chains).
 * Exposes fundamental tree properties like height and traversal paths.
 *
 * Real-world Applications:
 * - DOM structure in browsers
 * - Abstract Syntax Trees (AST) in compilers
 * - Huffman coding compression trees
 *
 * Time Complexity:
 * - Insertion (Level order): O(N) to find the first empty child slot.
 * - Deletion (Level order): O(N) to locate the target and the deepest rightmost node.
 * - Traversals (Pre, In, Post, Level-order): O(N) where N is the number of nodes.
 * - Height: O(N)
 *
 * Space Complexity:
 * - O(N) to store tree nodes.
 * - O(W) recursion stack or queue, where W is the maximum width of the tree.
 *
 * Advantages:
 * - Reflects hierarchical relationships naturally.
 * - Serves as the baseline model for search trees.
 *
 * Limitations:
 * - Unbalanced trees can lead to degenerate linear lists, making search O(N).
 *
 * Pseudocode:
 * function insertLevelOrder(root, val):
 *   newNode = Node(val)
 *   if root is null: return newNode
 *   queue.enqueue(root)
 *   while queue is not empty:
 *     curr = queue.dequeue()
 *     if curr.left is null: curr.left = newNode; break
 *     else queue.enqueue(curr.left)
 *     if curr.right is null: curr.right = newNode; break
 *     else queue.enqueue(curr.right)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryTree = exports.TreeNode = void 0;
class TreeNode {
    val;
    left = null;
    right = null;
    constructor(val) {
        this.val = val;
    }
}
exports.TreeNode = TreeNode;
class BinaryTree {
    root = null;
    constructor() { }
    /**
     * Insert values level by level (breadth-first) to keep the tree compact.
     */
    insert(val) {
        const newNode = new TreeNode(val);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        const queue = [this.root];
        while (queue.length > 0) {
            const curr = queue.shift();
            if (!curr.left) {
                curr.left = newNode;
                break;
            }
            else {
                queue.push(curr.left);
            }
            if (!curr.right) {
                curr.right = newNode;
                break;
            }
            else {
                queue.push(curr.right);
            }
        }
    }
    /**
     * Delete node with target value.
     * Replaces it with the deepest rightmost node in the tree to keep it shape-balanced.
     */
    delete(val) {
        if (!this.root)
            return;
        if (!this.root.left && !this.root.right) {
            if (this.root.val === val) {
                this.root = null;
            }
            return;
        }
        // Find the target node and the deepest rightmost node.
        let targetNode = null;
        let deepestNode = null;
        let deepestParent = null;
        const queue = [{ node: this.root, parent: null }];
        while (queue.length > 0) {
            const { node, parent } = queue.shift();
            if (node.val === val) {
                targetNode = node;
            }
            deepestNode = node;
            deepestParent = parent;
            if (node.left)
                queue.push({ node: node.left, parent: node });
            if (node.right)
                queue.push({ node: node.right, parent: node });
        }
        if (targetNode && deepestNode) {
            const replacementVal = deepestNode.val;
            // Delete the deepest node reference from its parent
            if (deepestParent) {
                if (deepestParent.left === deepestNode)
                    deepestParent.left = null;
                else if (deepestParent.right === deepestNode)
                    deepestParent.right = null;
            }
            // Replace target node's value with the deepest node's value
            targetNode.val = replacementVal;
        }
    }
    /**
     * Helper to calculate the tree height.
     */
    getHeight(node = this.root) {
        if (!node)
            return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
    /**
     * Helper to convert the tree to a visual format.
     */
    serializeTree(node = this.root) {
        if (!node)
            return null;
        return {
            val: node.val,
            left: this.serializeTree(node.left),
            right: this.serializeTree(node.right)
        };
    }
    /**
     * Traversal generators for visualizer
     */
    *inorderGenerator() {
        const visited = [];
        const treeState = this.serializeTree();
        yield { currentNodeId: null, visitedNodes: [], treeState, explanation: "Starting Inorder Traversal (Left -> Root -> Right)." };
        function* traverse(node) {
            if (!node)
                return;
            yield* traverse(node.left);
            visited.push(node.val);
            yield {
                currentNodeId: node.val,
                visitedNodes: [...visited],
                treeState,
                explanation: `Visited node ${node.val}.`
            };
            yield* traverse(node.right);
        }
        yield* traverse(this.root);
        yield { currentNodeId: null, visitedNodes: [...visited], treeState, explanation: "Inorder Traversal complete." };
    }
    *preorderGenerator() {
        const visited = [];
        const treeState = this.serializeTree();
        yield { currentNodeId: null, visitedNodes: [], treeState, explanation: "Starting Preorder Traversal (Root -> Left -> Right)." };
        function* traverse(node) {
            if (!node)
                return;
            visited.push(node.val);
            yield {
                currentNodeId: node.val,
                visitedNodes: [...visited],
                treeState,
                explanation: `Visited node ${node.val}.`
            };
            yield* traverse(node.left);
            yield* traverse(node.right);
        }
        yield* traverse(this.root);
        yield { currentNodeId: null, visitedNodes: [...visited], treeState, explanation: "Preorder Traversal complete." };
    }
    *postorderGenerator() {
        const visited = [];
        const treeState = this.serializeTree();
        yield { currentNodeId: null, visitedNodes: [], treeState, explanation: "Starting Postorder Traversal (Left -> Right -> Root)." };
        function* traverse(node) {
            if (!node)
                return;
            yield* traverse(node.left);
            yield* traverse(node.right);
            visited.push(node.val);
            yield {
                currentNodeId: node.val,
                visitedNodes: [...visited],
                treeState,
                explanation: `Visited node ${node.val}.`
            };
        }
        yield* traverse(this.root);
        yield { currentNodeId: null, visitedNodes: [...visited], treeState, explanation: "Postorder Traversal complete." };
    }
    *levelOrderGenerator() {
        if (!this.root)
            return;
        const visited = [];
        const treeState = this.serializeTree();
        yield { currentNodeId: null, visitedNodes: [], treeState, explanation: "Starting Level Order Traversal (Breadth-First)." };
        const queue = [this.root];
        while (queue.length > 0) {
            const curr = queue.shift();
            visited.push(curr.val);
            yield {
                currentNodeId: curr.val,
                visitedNodes: [...visited],
                treeState,
                explanation: `Visited node ${curr.val}. Enqueueing children.`
            };
            if (curr.left)
                queue.push(curr.left);
            if (curr.right)
                queue.push(curr.right);
        }
        yield { currentNodeId: null, visitedNodes: [...visited], treeState, explanation: "Level Order Traversal complete." };
    }
}
exports.BinaryTree = BinaryTree;
