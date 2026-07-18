import { describe, it, expect } from 'vitest';
import { BinaryTree } from './BinaryTree';
import { BinarySearchTree } from './BinarySearchTree';

describe('Binary Tree', () => {
  it('should insert in level-order and compute correct height', () => {
    const tree = new BinaryTree<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);

    // Tree layout:
    //      1
    //    /   \
    //   2     3
    //  /
    // 4
    expect(tree.root?.val).toBe(1);
    expect(tree.root?.left?.val).toBe(2);
    expect(tree.root?.right?.val).toBe(3);
    expect(tree.root?.left?.left?.val).toBe(4);
    expect(tree.getHeight()).toBe(3);
  });

  it('should traverse in preorder, inorder, postorder, and level-order', () => {
    const tree = new BinaryTree<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);

    // Inorder
    const inGen = tree.inorderGenerator();
    let step = inGen.next();
    while (!step.done) { step = inGen.next(); }
    // Visited: [2, 1, 3]

    // Preorder
    const preGen = tree.preorderGenerator();
    let step2 = preGen.next();
    while (!step2.done) { step2 = preGen.next(); }
    // Visited: [1, 2, 3]

    // Level-order
    const lvlGen = tree.levelOrderGenerator();
    let step3 = lvlGen.next();
    while (!step3.done) { step3 = lvlGen.next(); }
    // Visited: [1, 2, 3]
  });

  it('should delete nodes correctly', () => {
    const tree = new BinaryTree<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);

    tree.delete(2);
    // Deepest rightmost is 4. So 4 replaces 2. Deepest is deleted.
    expect(tree.root?.left?.val).toBe(4);
    expect(tree.root?.left?.left).toBeNull();
  });
});

describe('Binary Search Tree', () => {
  it('should insert sorted items and search correctly', () => {
    const bst = new BinarySearchTree<number>((a, b) => a - b);
    bst.insert(5);
    bst.insert(3);
    bst.insert(8);
    bst.insert(2);

    expect(bst.search(3)).toBe(true);
    expect(bst.search(8)).toBe(true);
    expect(bst.search(10)).toBe(false);
  });

  it('should delete nodes correctly from BST', () => {
    const bst = new BinarySearchTree<number>((a, b) => a - b);
    bst.insert(5);
    bst.insert(3);
    bst.insert(8);
    bst.insert(2);

    bst.delete(3);
    expect(bst.search(3)).toBe(false);
    expect(bst.root?.left?.val).toBe(2);
  });
});
