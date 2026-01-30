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
                            full_import = f"{module}.{alias.name}" if module else alias.name
                            result['imports'].append(full_import)
                    
                    # Detect file I/O patterns (enhanced version)
                    if isinstance(node, ast.Call):
                        # Handle attribute calls (e.g., pd.read_csv, sc.read_10x_h5)
                        if isinstance(node.func, ast.Attribute):
                            func_name = node.func.attr
                            
                            # Detect read operations
                            if any(pattern in func_name.lower() for pattern in ['read', 'load']):
                                if node.args and isinstance(node.args[0], ast.Constant):
                                    result['files_read'].append(node.args[0].value)
                            
                            # Detect write operations  
                            if any(pattern in func_name.lower() for pattern in ['write', 'save', 'to_csv', 'to_excel', 'to_parquet', 'to_hdf', 'savefig']):
                                if node.args and isinstance(node.args[0], ast.Constant):
                                    result['files_written'].append(node.args[0].value)
                        
                        # Handle direct function calls (e.g., open())
                        elif isinstance(node.func, ast.Name):
                            if node.func.id == 'open':
                                if node.args and isinstance(node.args[0], ast.Constant):
                                    # Check mode argument to determine read/write
                                    mode = 'r'  # default
                                    if len(node.args) > 1 and isinstance(node.args[1], ast.Constant):
                                        mode = node.args[1].value
                                    
                                    if 'w' in mode or 'a' in mode:
                                        result['files_written'].append(node.args[0].value)
                                    else:
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
    result['files_written'] = list(set(result['files_written']))
    
    return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python parse_notebook.py <notebook_path>")
        sys.exit(1)
    
    notebook_path = sys.argv[1]
    result = parse_notebook(notebook_path)
    
    # Output as JSON for easy consumption by TypeScript
    print(json.dumps(result, indent=2))
