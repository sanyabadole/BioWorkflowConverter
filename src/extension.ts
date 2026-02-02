import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { 
    generateSnakefile, 
    generateConfigYaml, 
    generateEnvironmentYaml,
    createScriptFile 
} from './generators/snakemakeGenerator';
import { generateDockerfile, generateDockerignore } from './generators/dockerGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('=== BioWorkflow Generator Extension Activated! ===');
    
    let disposable = vscode.commands.registerCommand(
        'bio-workflow-generator.convertNotebook',
        async (uri: vscode.Uri) => {
            console.log('=== Command triggered! ===');
            
            // Get the notebook file path
            const notebookPath = uri.fsPath;
            
            if (!notebookPath.endsWith('.ipynb')) {
                vscode.window.showErrorMessage('Please select a Jupyter notebook (.ipynb) file');
                return;
            }
            
            vscode.window.showInformationMessage(`Processing: ${path.basename(notebookPath)}`);
            
            try {
                // Call Python parser script
                const pythonScript = path.join(context.extensionPath, 'python', 'parse_notebook.py');
                const result = execSync(`python3 "${pythonScript}" "${notebookPath}"`, {
                    encoding: 'utf-8'
                });
                
                const parsedData = JSON.parse(result);
                
                // Create output folder structure
                const notebookDir = path.dirname(notebookPath);
                const notebookName = path.basename(notebookPath, '.ipynb');
                const outputDir = path.join(notebookDir, `${notebookName}_workflow`);
                
                // Create directory structure
                createDirectoryStructure(outputDir);
                
                // Generate all workflow files
                generateWorkflowFiles(outputDir, notebookName, parsedData);
                
                vscode.window.showInformationMessage(
                    `✅ Workflow generated! Output in: ${outputDir}`
                );
                
                // Open the Snakefile
                const snakefileUri = vscode.Uri.file(path.join(outputDir, 'Snakefile'));
                vscode.window.showTextDocument(snakefileUri);
                
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
                console.error(error);
            }
        }
    );
    
    context.subscriptions.push(disposable);
    console.log('=== Command registered: bio-workflow-generator.convertNotebook ===');
}

function createDirectoryStructure(outputDir: string) {
    const dirs = [
        outputDir,
        path.join(outputDir, 'scripts'),
        path.join(outputDir, 'envs'),
        path.join(outputDir, 'data'),
        path.join(outputDir, 'results')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function generateWorkflowFiles(outputDir: string, notebookName: string, parsedData: any) {
    // 1. Generate Snakefile
    const snakefile = generateSnakefile(notebookName, parsedData);
    fs.writeFileSync(path.join(outputDir, 'Snakefile'), snakefile);
    
    // 2. Generate config.yaml
    const configYaml = generateConfigYaml(parsedData);
    fs.writeFileSync(path.join(outputDir, 'config.yaml'), configYaml);
    
    // 3. Generate environment.yaml
    const envYaml = generateEnvironmentYaml(parsedData.imports);
    fs.writeFileSync(path.join(outputDir, 'envs', 'environment.yaml'), envYaml);
    
    // 4. Generate Dockerfile
    const dockerfile = generateDockerfile(parsedData.imports);
    fs.writeFileSync(path.join(outputDir, 'Dockerfile'), dockerfile);
    
    // 5. Generate .dockerignore
    const dockerignore = generateDockerignore();
    fs.writeFileSync(path.join(outputDir, '.dockerignore'), dockerignore);
    
    // 6. Generate README
    const readme = generateWorkflowReadme(notebookName, parsedData);
    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
    
    // 7. Generate script files for each processing step
    const codeCells = parsedData.cells.filter((c: any) => c.type === 'code');
    codeCells.forEach((cell: any, idx: number) => {
        const outputs = parsedData.files_written.filter((f: string) => 
            cell.source.includes(f)
        );
        
        if (outputs.length > 0) {
            const firstLine = cell.source.split('\n')[0].replace(/^#\s*/, '');
            const ruleName = generateRuleName(firstLine, idx);
            const script = createScriptFile(ruleName, cell.source);
            fs.writeFileSync(path.join(outputDir, 'scripts', `${ruleName}.py`), script);
        }
    });
}

function generateRuleName(description: string, index: number): string {
    let name = description
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
    
    name = name.replace(/^(import|define|load|calculate|filter|normalize|save|generate)\s*/g, '');
    
    if (name.length < 3) {
        name = `step_${index + 1}`;
    }
    
    return name;
}

function generateWorkflowReadme(notebookName: string, data: any): string {
    return `# ${notebookName} - Snakemake Workflow

Generated by BioWorkflow Generator from \`${notebookName}.ipynb\`

## 📋 Quick Start

\`\`\`bash
# Create conda environment
conda env create -f envs/environment.yaml
conda activate bioworkflow

# Run workflow
snakemake --cores all

# Or use Docker
docker build -t ${notebookName.toLowerCase()}-workflow .
docker run -v $(pwd)/data:/workflow/data ${notebookName.toLowerCase()}-workflow
\`\`\`

## 📂 Project Structure

\`\`\`
${notebookName}_workflow/
├── Snakefile              # Main workflow definition
├── config.yaml            # Configuration parameters
├── envs/
│   └── environment.yaml   # Conda environment
├── scripts/               # Python scripts for each rule
├── Dockerfile            # Container definition
└── README.md             # This file
\`\`\`

## 📊 Workflow Overview

**Input Files:** ${data.files_read.length}
${data.files_read.map((f: string) => `- \`${f}\``).join('\n')}

**Output Files:** ${data.files_written.length}
${data.files_written.map((f: string) => `- \`${f}\``).join('\n')}

**Dependencies:**
${data.imports.map((imp: string) => `- ${imp}`).join('\n')}

## 🔧 Customization

Edit \`config.yaml\` to adjust parameters and file paths.

## 📝 Notes

- This workflow was auto-generated and may require manual refinement
- Check input/output paths match your data structure
- Adjust computational resources in Snakefile as needed
`;
}

export function deactivate() {}
