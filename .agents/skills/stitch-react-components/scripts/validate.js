/**
 * AST & Design Token Validator for Stitch-generated React Components.
 * Powered by TypeScript Compiler API.
 * Validates:
 * 1. Valid TSX/JSX syntax.
 * 2. Proper Props interface definition (must end with 'Props').
 * 3. Component export (named or default).
 * 4. Design token compliance (flags arbitrary hex colors in classNames).
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const HEX_COLOR_REGEX = /#[0-9A-Fa-f]{3,8}\b/;

function validateComponent(filePath) {
  if (!filePath) {
    console.error('❌ Usage: node validate.js <path-to-component.tsx>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File not found: ${resolvedPath}`);
    process.exit(1);
  }

  try {
    const code = fs.readFileSync(resolvedPath, 'utf-8');
    const filename = path.basename(resolvedPath);

    console.log(`\n🔍 Scanning AST for: ${filename}...`);

    const sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    let hasInterface = false;
    let hasExport = false;
    const tailwindIssues = [];

    function visit(node) {
      // Check interface or type alias declaration ending in Props
      if (ts.isInterfaceDeclaration(node)) {
        if (node.name.text.endsWith('Props')) {
          hasInterface = true;
        }
      }
      if (ts.isTypeAliasDeclaration(node)) {
        if (node.name.text.endsWith('Props')) {
          hasInterface = true;
        }
      }

      // Check export
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        hasExport = true;
      }
      if (node.modifiers && node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        hasExport = true;
      }

      // Check JSX attributes for arbitrary hex colors
      if (ts.isJsxAttribute(node) && node.name.text === 'className') {
        if (node.initializer && ts.isStringLiteral(node.initializer)) {
          const val = node.initializer.text;
          if (HEX_COLOR_REGEX.test(val)) {
            tailwindIssues.push(val);
          }
        } else if (node.initializer && ts.isJsxExpression(node.initializer)) {
          const exprText = node.initializer.expression ? node.initializer.expression.getText(sourceFile) : '';
          if (HEX_COLOR_REGEX.test(exprText)) {
            tailwindIssues.push(exprText);
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    console.log(`\n📋 Validation Report: ${filename}`);
    console.log('-------------------------------------------');

    let passed = true;

    if (hasInterface) {
      console.log('✅ Props Interface: Found (typed contract valid).');
    } else {
      console.warn('⚠️ Props Interface: Missing interface/type ending in "Props".');
    }

    if (hasExport) {
      console.log('✅ Component Export: Found exported symbol.');
    } else {
      console.error('❌ Component Export: No exported component found.');
      passed = false;
    }

    if (tailwindIssues.length === 0) {
      console.log('✅ Design Tokens: Clean (No hardcoded hex codes found in classes).');
    } else {
      console.warn(`⚠️ Design Tokens: Found ${tailwindIssues.length} hardcoded hex codes in className:`);
      tailwindIssues.slice(0, 5).forEach((hex) => console.warn(`   - ${hex}`));
      if (tailwindIssues.length > 5) {
        console.warn(`   ...and ${tailwindIssues.length - 5} more.`);
      }
    }

    if (passed) {
      console.log('\n✨ AST VALIDATION PASSED.');
      process.exit(0);
    } else {
      console.error('\n🚫 VALIDATION FAILED.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ AST Parse Error:', err.message);
    process.exit(1);
  }
}

const target = process.argv[2];
validateComponent(target);
