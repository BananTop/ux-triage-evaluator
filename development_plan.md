# UX Triage Evaluator - Development Plan

## Project Overview
This webapp allows users to evaluate how well an LLM judges app store comments across UX dimensions (Attractiveness, Perspecuity, Novelty, Stimulation, Dependability, Efficiency). It compares LLM evaluations with human evaluations, displays alignment scores, and supports iterative prompt refinement.

## Technology Stack
- Frontend: React with TypeScript
- UI Framework: Material-UI
- State Management: React Context API
- Visualization: Chart.js for spider charts
- File handling: JSON parsing/exporting

## Development Steps

### Step 1: Project Setup
- Initialize React app with TypeScript
- Set up folder structure
- Install dependencies (Material-UI, React Router, Chart.js)
- Create basic routing

### Step 2: Data Models and Interfaces
- Define TypeScript interfaces for comment data
- Create models for LLM scores, human scores, and alignment metrics
- Set up context for global state management

### Step 3: Component Development
- Create reusable UI components (Header, Footer, Card, etc.)
- Implement scoring components (dropdown selectors, score displays)
- Develop file upload/download functionality

### Step 4: Page Implementation
1. Prompt Input Page
   - Text area for LLM prompt input
   - Prompt history section
   - Save/load functionality

2. Comments Page
   - JSON file upload
   - Comments display
   - Batch processing controls

3. Evaluation Page
   - Side-by-side LLM vs human scoring interface
   - "Hide LLM scores" toggle
   - Dimension scoring dropdowns (-3 to +3)
   - Comment navigation

4. Analysis Page
   - Spider chart for alignment visualization
   - Misaligned comments section
   - Detailed dimension comparison
   - Export results functionality

5. History Page
   - Past prompts display
   - Performance metrics per prompt
   - Comparative analysis

### Step 5: Integration and Testing
- Connect pages with routing
- Implement data flow between pages
- Test with sample data
- Fix bugs and refine UI

### Step 6: Refinement and Optimization
- Improve UI/UX based on testing
- Optimize performance
- Add error handling
- Implement responsive design

### Step 7: Documentation
- Code documentation
- User guide
- Installation instructions

## Timeline
Estimated completion: 2-3 weeks for full implementation

## Next Steps
After plan approval:
1. Initialize project and set up development environment
2. Implement core data structures and state management
3. Build UI components
4. Develop individual pages
5. Connect everything together
6. Test and refine
