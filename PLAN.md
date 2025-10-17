### **Step 1: Ingest & Baseline Agent**

This initial step is unchanged and serves as the objective entry point for any piece of code entering the system.

- **Function:** It selects a code snippet and immediately runs the full suite of baseline measurements (linting, type checks, unit tests).
- **Purpose:** To establish a clean, data-driven "before" state against which the final result can be compared.

---

### **Step 2: Perplexity Router Agent 🧠**

This agent acts as an intelligent triage system, deciding if a piece of code is a candidate for automated refactoring or if it's too confusing and should be handled separately.

- **Function:** It calculates the **maximum token-level perplexity** of the `original_code` and compares it to a pre-defined `CONFUSION_THRESHOLD`.
- **Routing Logic:**
  - If perplexity is **low**, the workflow proceeds to Step 3 for strategic refactoring.
  - If perplexity is **high** (in the top 5% of uncertainty), it **branches directly to Step 5**, skipping the refactoring and flagging the code for special analysis.

---

### **Step 3: Strategy Prediction Agent (Decision Tree Brain)**

This agent consolidates the feature engineering and prediction steps into a single "thinking" module. It only runs on code that passed the perplexity check.

- **Function:**
  1.  **Feature Engineering:** It first calculates the necessary features from the code (e.g., `cyclomatic_complexity`, `line_count`).
  2.  **Prediction:** It then loads your trained **Random Forest model** (`refactoring_model.pkl`) and uses these features to predict the single, statistically optimal refactoring action.
- **Purpose:** To replace guessing with a data-driven decision on _how_ to refactor the code.

---

### **Step 4: Targeted Execution Agent**

This agent is the "hands" of the operation, executing the precise instruction provided by the prediction agent.

- **Function:** It takes the predicted refactoring action (e.g., `'Extract Method'`), builds a targeted prompt around it, and sends it to the target LLM to generate the `refactored_code`.
- **Purpose:** To carry out the refactoring strategy with surgical precision.

---

### **Step 5: Measure & Learn Agent 📈**

This final, consolidated agent handles all post-mortem analysis and ensures the system improves over time.

- **Function:**
  1.  **Comprehensive Measurement:** It runs the standard measurement suite on the final code.
  2.  **Custom Statistics Module:** It executes **every script** within your custom statistics folder (e.g., `/custom_stats/`) to gather advanced metrics like AST comparisons.
  3.  **Verdict:** It analyzes all the data to assign a `final_verdict` (e.g., `IMPROVEMENT`, `REGRESSION`, or `FLAGGED_AS_CONFUSING`).
  4.  **Learning:** It logs the complete experiment state and, if the code was refactored, adds the features and outcome as a new row of data for retraining the Decision Tree model.

Here are the exact JSON inputs/outputs and file structures for each node in your 5-step cycle.

---

### Node 1: Ingest & Baseline Agent

This node's purpose is to initialize the experiment by assigning a unique ID and calculating the objective "before" state of the code.

#### **Files in this Node**

- `1_ingest_agent.py`: The main Python script that contains the agent's logic. It reads the code, generates a UUID, and calls the linter.
- `.pylintrc`: A configuration file for the linter. This ensures that the "static_error_count" is calculated consistently and objectively across all runs. It defines which errors to check for.
- `unit_tests.py`: A file containing the unit tests for the code snippets. This agent runs these tests to verify the baseline functional correctness.

---

#### **JSON State Transformation**

- **INPUT to Node 1**
  ```json
  {
    "code_id": null,
    "original_code": "def calculate_stats(numbers):\n    # Calculate sum of squares for numbers > 5\n    sum_sq = 0\n    for n in numbers:\n        if n > 5:\n            sum_sq += n * n\n    # Calculate count of numbers > 5\n    count = 0\n    for n in numbers:\n        if n > 5:\n            count += 1\n    if count == 0:\n        return 0\n    return sum_sq / count",
    "refactored_code": null,
    "strategy": {},
    "analysis": {},
    "final_verdict": null
  }
  ```
- **OUTPUT from Node 1**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "def calculate_stats(numbers):\n    # Calculate sum of squares for numbers > 5\n    sum_sq = 0\n    for n in numbers:\n        if n > 5:\n            sum_sq += n * n\n    # Calculate count of numbers > 5\n    count = 0\n    for n in numbers:\n        if n > 5:\n            count += 1\n    if count == 0:\n        return 0\n    return sum_sq / count",
    "refactored_code": null,
    "strategy": {},
    "analysis": {
      "baseline_metrics": {
        "static_error_count": 3,
        "type_error_count": 0,
        "unit_tests_pass": true
      }
    },
    "final_verdict": null
  }
  ```

---

### Node 2: Perplexity Router Agent 🧠

This node acts as the triage system, deciding whether the code is clear enough for refactoring or too confusing and should be branched off.

#### **Files in this Node**

- `2_router_agent.py`: The Python script that loads the language model and calculates the max token-level perplexity. It contains the routing logic.
- `config.json`: A model configuration file specifying details for the transformer model.
- `model.safetensors`: The pre-trained weights of the language model (e.g., `Qwen2.5-Coder`) used to calculate perplexity.
- `tokenizer.json`: The tokenizer file corresponding to the model, used to break the code into tokens.

---

#### **JSON State Transformation**

- **INPUT to Node 2**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": null,
    "strategy": {},
    "analysis": {
      "baseline_metrics": {
        "static_error_count": 3,
        "type_error_count": 0,
        "unit_tests_pass": true
      }
    },
    "final_verdict": null
  }
  ```
- **OUTPUT from Node 2**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": null,
    "strategy": {},
    "analysis": {
      "baseline_metrics": {
        "static_error_count": 3,
        "type_error_count": 0,
        "unit_tests_pass": true
      },
      "max_perplexity": 210.7
    },
    "final_verdict": null
  }
  ```

---

### Node 3: Strategy Prediction Agent

This is the "brain" of the operation. It only runs if the router decides the code is clear. It analyzes the code and predicts the best refactoring strategy.

#### **Files in this Node**

- `3_prediction_agent.py`: The main script for this node. It calls the feature engineering script and then uses the loaded model to make a prediction.
- `feature_engineering.py`: A utility script containing functions to calculate code metrics like `cyclomatic_complexity`, `line_count`, etc.
- `refactoring_model.pkl`: The saved, pre-trained **Decision Tree/Random Forest model** file. This is the core intellectual property of the system.

---

#### **JSON State Transformation**

- **INPUT to Node 3**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": null,
    "strategy": {},
    "analysis": {
      "baseline_metrics": { "...": "..." },
      "max_perplexity": 210.7
    },
    "final_verdict": null
  }
  ```
- **OUTPUT from Node 3**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": null,
    "strategy": {
      "chosen_refactoring": "Extract Method",
      "hypothesis": "Model predicts 'Extract Method' is the optimal action based on features like high complexity and code duplication."
    },
    "analysis": {
      "baseline_metrics": { "...": "..." },
      "max_perplexity": 210.7
    },
    "final_verdict": null
  }
  ```

---

### Node 4: Targeted Execution Agent

This node acts as the "hands," precisely executing the strategy chosen by the brain.

#### **Files in this Node**

- `4_execution_agent.py`: The main script that constructs the prompt and calls the LLM API for refactoring.
- `prompt_template.txt`: A text file containing the detailed refactoring prompt structure. The agent injects the `original_code` and the `chosen_refactoring` into this template.

---

#### **JSON State Transformation**

- **INPUT to Node 4**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": null,
    "strategy": {
      "chosen_refactoring": "Extract Method",
      "hypothesis": "..."
    },
    "analysis": { "...": "..." },
    "final_verdict": null
  }
  ```
- **OUTPUT from Node 4**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": "def _get_filtered_numbers(numbers):\n    return [n for n in numbers if n > 5]\n\ndef calculate_stats(numbers):\n    filtered_nums = _get_filtered_numbers(numbers)\n    if not filtered_nums:\n        return 0\n    sum_sq = sum(n * n for n in filtered_nums)\n    return sum_sq / len(filtered_nums)",
    "strategy": {
      "chosen_refactoring": "Extract Method",
      "hypothesis": "..."
    },
    "analysis": { "...": "..." },
    "final_verdict": null
  }
  ```

---

### Node 5: Measure & Learn Agent 📈

This final node is the judge and archivist. It measures the outcome of the experiment and saves the results to make the whole system smarter.

#### **Files in this Node**

- `5_measure_learn_agent.py`: The main script that orchestrates the final analysis, calls the custom stats, assigns a verdict, and logs the results.
- `/custom_stats/`: A **folder** containing your scalable, custom analysis scripts.
  - `01_ast_diff_analyzer.py`: A script that builds an Abstract Syntax Tree for both code versions and calculates the difference in node count and structure.
  - `02_token_flow_analyzer.py`: Another custom script, perhaps measuring changes in variable usage or control flow.
- `log_results.py`: A utility script that takes the final state JSON and appends it to a master results file (e.g., `results.csv`) which will be used to retrain the Decision Tree model.

---

#### **JSON State Transformation**

- **INPUT to Node 5**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "...",
    "refactored_code": "def _get_filtered_numbers(numbers): ...",
    "strategy": { "...": "..." },
    "analysis": {
      "baseline_metrics": { "...": "..." },
      "max_perplexity": 210.7
    },
    "final_verdict": null
  }
  ```
- **OUTPUT from Node 5 (Final State)**
  ```json
  {
    "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
    "original_code": "def calculate_stats(numbers):\n    # Calculate sum of squares for numbers > 5\n    sum_sq = 0\n    for n in numbers:\n        if n > 5:\n            sum_sq += n * n\n    # Calculate count of numbers > 5\n    count = 0\n    for n in numbers:\n        if n > 5:\n            count += 1\n    if count == 0:\n        return 0\n    return sum_sq / count",
    "refactored_code": "def _get_filtered_numbers(numbers):\n    return [n for n in numbers if n > 5]\n\ndef calculate_stats(numbers):\n    filtered_nums = _get_filtered_numbers(numbers)\n    if not filtered_nums:\n        return 0\n    sum_sq = sum(n * n for n in filtered_nums)\n    return sum_sq / len(filtered_nums)",
    "strategy": {
      "chosen_refactoring": "Extract Method",
      "hypothesis": "Model predicts 'Extract Method' is the optimal action based on features like high complexity and code duplication."
    },
    "analysis": {
      "baseline_metrics": {
        "static_error_count": 3,
        "type_error_count": 0,
        "unit_tests_pass": true
      },
      "max_perplexity": 210.7,
      "refactored_metrics": {
        "static_error_count": 0,
        "type_error_count": 0,
        "unit_tests_pass": true
      },
      "deltas": {
        "static_error_delta": -3
      },
      "custom_metrics": {
        "ast_node_change": -8,
        "comment_density_change": 0.0
      }
    },
    "final_verdict": "IMPROVEMENT"
  }
  ```

Data

Create

    /api/data/node 1/input

    /api/data/node 2/input

    /api/data/node 3/input

    /api/data/node 4/input

    /api/data/node 5/input

Read

    /api/data/node 1/output

    /api/data/node 2/output

    /api/data/node 3/output

    /api/data/node 4/output

    /api/data/node 5/output

Update

    /api/data/node 1/input

    /api/data/node 2/input

    /api/data/node 3/input

    /api/data/node 4/input

    /api/data/node 5/input

Delete

    /api/data/node 1/output

    /api/data/node 2/output

    /api/data/node 3/output

    /api/data/node 4/output

    /api/data/node 5/output



    /api/data/node 1/input

    /api/data/node 2/input

    /api/data/node 3/input

    /api/data/node 4/input

    /api/data/node 5/input
