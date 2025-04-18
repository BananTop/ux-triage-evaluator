# UX Triage Evaluator

A web application that allows users to evaluate how well an LLM is judging app store comments on UX dimensions.

## Project Overview

The UX Triage Evaluator is a tool for evaluating and improving LLM performance in judging app store comments across six user experience dimensions:

- **Attractiveness**: Overall impression, likability, and visual appeal
- **Efficiency**: Speed, responsiveness, and ability to complete tasks quickly
- **Perspicuity**: Clarity, ease of learning, and understandability
- **Dependability**: Reliability, predictability, and stability  
- **Stimulation**: Excitement, interest, and motivation to use
- **Novelty**: Innovation, creativity, and uniqueness

The application offers a complete workflow for:
1. Defining and refining LLM prompts
2. Uploading app store comments for analysis
3. Comparing LLM evaluations with human evaluations
4. Analyzing alignment between LLM and human scoring
5. Tracking performance improvements over time

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Features

### 1. Prompt Editor
- Create and edit prompts for the LLM
- View previous prompts and their performance

### 2. Comment Management
- Upload app store comments via JSON file
- View and manage loaded comments

### 3. Evaluation Interface
- Toggle visibility of LLM scores to prevent bias
- Score comments on six UX dimensions
- Navigate between multiple comments

### 4. Analysis Dashboard
- View overall alignment between LLM and human scoring
- Explore dimension-specific alignment
- Identify most misaligned comments for prompt improvement

### 5. Prompt History
- Track prompt performance over time
- Compare alignment scores across different prompt versions

## Input/Output Formats

### Input JSON Format

```json
{
  "review_id": "example_id_123",
  "review_text": "This app has a great interface but crashes often.",
  "star_rating": 3
}
```

### Output JSON Format

```json
{
  "review_id": "example_id_123",
  "review_text": "This app has a great interface but crashes often.",
  "star_rating": 3,
  "llm_scores": {
    "attractiveness": 2,
    "efficiency": -1,
    "perspicuity": 1,
    "dependability": -2,
    "stimulation": 0,
    "novelty": 1
  },
  "llm_justification": {
    "attractiveness": "The comment praises the interface, indicating positive attractiveness.",
    "efficiency": "Crashes suggest poor efficiency in task completion.",
    "perspicuity": "Comment suggests the interface is understandable.",
    "dependability": "Frequent crashes indicate low reliability.",
    "stimulation": "No clear indication about engagement level.",
    "novelty": "The interface design seems to be appreciated for its creativity."
  },
  "human_scores": {
    "attractiveness": 2,
    "efficiency": -2,
    "perspicuity": 1,
    "dependability": -3,
    "stimulation": 0,
    "novelty": 0
  },
  "overall_alignment_score": 0.78,
  "dimension_alignments": {
    "attractiveness_alignment": 1.0,
    "efficiency_alignment": 0.83,
    "perspicuity_alignment": 1.0,
    "dependability_alignment": 0.83,
    "stimulation_alignment": 1.0,
    "novelty_alignment": 0.83
  }
}
```

## Technology Stack

- React with TypeScript
- Material-UI for UI components
- React Router for navigation
- Chart.js for data visualization
