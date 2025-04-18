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

**Problems Encountered & Solutions:**
1. **Git Repository Conflict**
   - Problem: Local Git repository conflicted with GitHub repository
   - Attempted Solution: Tried git pull with --allow-unrelated-histories
   - New Problem: Git refused to merge unrelated histories
   - Final Solution: Used force push after confirming remote only had initial setup
   
2. **Nested Git Repository**
   - Problem: React app created with its own .git directory
   - Solution: Removed nested .git directory to prevent submodule issues

### Step 2: Data Models and Interfaces 
- Define TypeScript interfaces for comment data 
- Create models for LLM scores, human scores, and alignment metrics 
- Set up context for global state management 

**Problems Encountered & Solutions:**
1. **Type Definition Chain**
   - Problem: Circular type dependencies between components
   - Solution: Separated types into distinct interfaces and used type composition

### Step 3: Component Development 
- Create reusable UI components (Header, Footer, Card, etc.) 
- Implement scoring components (dropdown selectors, score displays) 
- Develop file upload/download functionality 

**Problems Encountered & Solutions:**
1. **Material-UI Grid Component Type Errors** 
   - Problem: Grid component type mismatches
   - Attempted Solution: Added 'item' prop
   - New Problem: TypeScript still reports prop type errors
   - Current Status: Needs resolution in next phase

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

**Problems Encountered & Solutions:**
1. **Chart.js Integration Chain**
   - Problem: Chart.js TypeScript type conflicts
   - Attempted Solution: Updated type definitions
   - New Problem: Radar chart specific type issues
   - Current Status: Needs resolution in next phase

2. **State Management Chain**
   - Problem: Complex state updates across pages
   - Solution: Implemented Context API with reducer pattern
   - New Problem: Performance issues with large datasets
   - Solution: Added memoization for expensive calculations

### Step 5: Testing and Refinement 
- Unit testing setup
- Integration testing
- Performance optimization
- Bug fixes

**Current Issues to Address:**
1. TypeScript Errors:
   - Material-UI Grid component type mismatches
   - Chart.js type definition conflicts
   - Component prop type refinements needed

2. Performance Concerns:
   - Large dataset handling
   - Chart rendering optimization
   - State update batching

### Next Steps:
1. Resolve TypeScript errors in Grid components
2. Fix Chart.js type definition issues
3. Implement proper error handling
4. Add loading states for async operations
5. Complete unit and integration tests

### Lessons Learned:
1. Start with proper TypeScript configuration from the beginning
2. Consider type compatibility when choosing third-party libraries
3. Document problem-chains as they occur for better troubleshooting
4. Use feature branches for major component development
