import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to fix accessibility issues and enhance styling on Mermaid-generated SVGs:
 * 1. Replaces non-standard/abstract ARIA role 'graphics-document document' with 'img'
 *    and ensures valid aria-roledescription and accessible label.
 * 2. Adds rounded corner attributes (rx / ry) to flowchart node and cluster rectangles,
 *    and ensures cluster containers have comfortable horizontal/vertical breathing room
 *    around wide cluster titles.
 */
export function rehypeMermaidA11y() {
  return (tree) => {
    visit(tree, 'element', (node, _index, parent) => {
      if (node.tagName === 'svg' && node.properties) {
        const role = node.properties.role;
        const roleStr = Array.isArray(role) ? role.join(' ') : String(role || '');
        if (roleStr.includes('graphics-document') || roleStr.includes('document')) {
          node.properties.role = 'img';
          if (!node.properties.ariaLabel) {
            node.properties.ariaLabel = 'Mermaid diagram';
          }
          if (node.properties.ariaRoleDescription) {
            const desc = Array.isArray(node.properties.ariaRoleDescription)
              ? node.properties.ariaRoleDescription.join(' ')
              : String(node.properties.ariaRoleDescription);
            if (desc.includes('flowchart')) {
              node.properties.ariaRoleDescription = 'flowchart';
            } else {
              node.properties.ariaRoleDescription = 'diagram';
            }
          }
        }

        // Pad SVG viewBox slightly so widened cluster borders are never clipped at the edges
        if (typeof node.properties.viewBox === 'string') {
          const parts = node.properties.viewBox.trim().split(/\s+/).map(Number);
          if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
            const [minX, minY, vbW, vbH] = parts;
            node.properties.viewBox = `${minX - 16} ${minY - 8} ${vbW + 32} ${vbH + 16}`;
          }
        }
      }

      if (node.tagName === 'rect' && parent && parent.tagName === 'g' && parent.properties) {
        const parentClass = Array.isArray(parent.properties.className)
          ? parent.properties.className.join(' ')
          : String(parent.properties.className || '');
        if (parentClass.includes('cluster')) {
          node.properties = node.properties || {};
          node.properties.rx = '12';
          node.properties.ry = '12';

          // Ensure cluster rect has at least 18px horizontal padding on each side of its cluster-label
          const labelGroup = (parent.children || []).find(
            (child) =>
              child.type === 'element' &&
              child.tagName === 'g' &&
              (Array.isArray(child.properties?.className)
                ? child.properties.className.join(' ')
                : String(child.properties?.className || '')
              ).includes('cluster-label')
          );
          const foreignObj = labelGroup?.children?.find(
            (c) => c.type === 'element' && c.tagName === 'foreignObject'
          );
          const labelW = Number(foreignObj?.properties?.width);
          const rectX = Number(node.properties.x);
          const rectW = Number(node.properties.width);
          if (!Number.isNaN(labelW) && !Number.isNaN(rectX) && !Number.isNaN(rectW)) {
            const minClusterWidth = labelW + 36;
            if (rectW < minClusterWidth) {
              const delta = minClusterWidth - rectW;
              node.properties.x = String(rectX - delta / 2);
              node.properties.width = String(rectW + delta);
            }
          }
        } else if (parentClass.includes('node')) {
          node.properties = node.properties || {};
          node.properties.rx = '8';
          node.properties.ry = '8';
        }
      }
    });
  };
}



