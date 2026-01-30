# BioWorkflow Generator

A VS Code extension that transforms Jupyter notebooks into production-quality bioinformatics workflows. Automatically converts exploratory analysis into Snakemake/Nextflow pipelines with proper documentation, containerization, and software engineering best practices.

## 🎯 Problem

Bioinformatics researchers often develop analyses in Jupyter notebooks, but translating these into reproducible, scalable production pipelines is time-consuming and error-prone. Critical elements like dependency management, containerization, documentation, and proper workflow orchestration are frequently missing.

## 💡 Solution

BioWorkflow Generator bridges the gap between exploratory research and production-ready code by automatically:

- 📊 Parsing Jupyter notebooks and extracting executable code
- 🔍 Detecting dependencies and tool requirements
- 🐍 Generating Snakemake and Nextflow workflow files
- 🐳 Creating Docker containers with proper environments
- 📝 Auto-generating documentation and READMEs
- 🧪 Scaffolding test suites and CI/CD configurations
- 📦 Preparing GitHub-ready repository structures

## ✨ Features (Current - Week 1 MVP)

- ✅ Right-click `.ipynb` files to convert them
- ✅ Automatic Python import detection using AST parsing
- ✅ Cell-by-cell code extraction
- ✅ File I/O pattern detection
- ✅ Generate analysis summaries and reports
- ✅ 100% local processing (no LLM required)

## 🚀 Roadmap

### Week 2-3: Workflow Generation
- [ ] Generate Snakemake workflow files from notebook structure
- [ ] Generate Nextflow DSL2 pipelines
- [ ] Create environment.yml / requirements.txt
- [ ] Build basic Dockerfiles with detected dependencies
- [ ] Improve file I/O detection (read/write operations)

### Week 4-5: Production Features
- [ ] Auto-generate test scaffolds
- [ ] Create GitHub Actions CI/CD workflows
- [ ] Add error handling and logging to generated pipelines
- [ ] Extract hardcoded parameters into config files
- [ ] Support for Singularity containers

### Future Iterations
- [ ] One-click GitHub repository creation
- [ ] Interactive refinement UI
- [ ] Support for R notebooks
- [ ] Cloud deployment configurations (AWS, GCP, Azure)
- [ ] Integration with workflow execution platforms
- [ ] LLM-powered optimization suggestions (optional)

## 📦 Installation (For Development)

### Prerequisites
- Node.js (v18+)
- Python 3.8+
- VS Code 1.93.0+

### Setup

1. Clone the repository:
```bash
git clone https://github.com/sanyabadole/BioWorkflowConverter.git
cd BioWorkflowConverter/bio-workflow-generator
```

2. Install Node dependencies:
```bash
npm install
```

3. Set up Python environment:
```bash
cd python
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# venv\Scripts\activate   # On Windows
pip install nbformat
cd ..
```

4. Compile the extension:
```bash
npm run compile
```

## 🛠️ Development

### Running the Extension

1. Open the project in VS Code
2. Press **F5** to launch the Extension Development Host
3. In the new window, open a folder with `.ipynb` files
4. Right-click on a notebook → **"Convert to Workflow"**

### Project Structure

```
bio-workflow-generator/
├── src/
│   └── extension.ts          # Main extension logic
├── python/
│   └── parse_notebook.py     # Notebook parser using nbformat + AST
├── dist/                     # Compiled output (generated)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── esbuild.js                # Build configuration
```

### Technologies

- **TypeScript** - Extension framework
- **Python AST** - Code analysis and import detection
- **nbformat** - Jupyter notebook parsing
- **VS Code Extension API** - IDE integration

## 📖 Usage

1. Open VS Code with a bioinformatics project
2. Navigate to a Jupyter notebook (`.ipynb`)
3. Right-click the file in Explorer
4. Select **"Convert to Workflow"**
5. Check the generated `[notebook_name]_converted/` folder for:
   - `analysis.json` - Full parsed notebook data
   - `README.md` - Human-readable summary with dependencies

## 🧪 Example Output

For a notebook with single-cell RNA-seq analysis:

**Generated README.md:**
```markdown
# scRNA_analysis - Converted Workflow

## Analysis Summary
**Total Cells**: 15
**Code Cells**: 12

## Detected Dependencies
- scanpy
- pandas
- numpy
- matplotlib.pyplot
- seaborn

## Input Files Detected
- data/raw/counts_matrix.h5ad
- metadata/sample_info.csv
```

## 🤝 Contributing

This is an early-stage project! Contributions welcome:

- 🐛 Report bugs or request features via GitHub Issues
- 💻 Submit PRs for new features or improvements
- 📝 Improve documentation
- 🧪 Add test cases

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Sanya Badole**
- GitHub: [@sanyabadole](https://github.com/sanyabadole)

## 🙏 Acknowledgments

Built to address the reproducibility gap in computational biology. Inspired by tools like Snakemake, Nextflow, and the challenges of production bioinformatics workflows.

---

**Status**: Week 1 MVP Complete ✅ | Active Development 🚧
