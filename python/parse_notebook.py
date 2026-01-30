import nbformat
import ast
import json
import sys

def parse_notebook(notebook_path):
    """Parse Jupyter notebook and extract metadata."""
    
    # Read the notebook
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
    
    result = {
        'cells': [],
        'imports': [],
        'files_read': [],
        'files_written': []
    }
    
    # Process each code cell
    for i, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            source = cell['source']
            
            # Store cell info
            result['cells'].append({
                'index': i,
                'source': source,
                'type': 'code'
            })
            
            # Parse imports using AST
            try:
                tree = ast.parse(source)
                for node in ast.walk(tree):
                    # Extract import statements
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            result['imports'].append(alias.name)
                    elif isinstance(node, ast.ImportFrom):
                        module = node.module if node.module else ''
                        for alias in node.names:
                            result['imports'].append(f"{module}.{alias.name}" if module else alias.name)
                    
                    # Detect file I/O patterns (basic version)
                    if isinstance(node, ast.Call):
                        if isinstance(node.func, ast.Attribute):
                            # Patterns like pd.read_csv(), sc.read_h5ad()
                            if 'read' in node.func.attr:
                                # Try to extract filename from first argument
                                if node.args and isinstance(node.args[0], ast.Constant):
                                    result['files_read'].append(node.args[0].value)
            
            except SyntaxError:
                # Skip cells with syntax errors
                pass
        
        elif cell['cell_type'] == 'markdown':
            result['cells'].append({
                'index': i,
                'source': cell['source'],
                'type': 'markdown'
            })
    
    # Remove duplicates
    result['imports'] = list(set(result['imports']))
    result['files_read'] = list(set(result['files_read']))
    
    return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python parse_notebook.py <notebook_path>")
        sys.exit(1)
    
    notebook_path = sys.argv[1]
    result = parse_notebook(notebook_path)
    
    # Output as JSON for easy consumption by TypeScript
    print(json.dumps(result, indent=2))
