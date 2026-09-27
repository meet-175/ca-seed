import { visit } from 'unist-util-visit';

export default function remarkReplaceRupee() {
  return (tree) => {
    visit(tree, ['math', 'inlineMath'], (node) => {
      if (node.value) {
        node.value = node.value.replace(/₹/g, '\\text{Rs. }');
      }
    });
  };
}
