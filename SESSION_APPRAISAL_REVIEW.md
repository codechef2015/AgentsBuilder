# Appraisal Review Pipeline → Strands Agentic Workflow

## Session: 2026-05-12

### Objective
Migrate the existing appraisal review pipeline (from KL_Altisourse) into a Strands Agent SDK multi-agent workflow, visually designed and deployable via Strands Studio UI.

---

## Current Pipeline Analysis

### Source Codebase: `C:\wamp64\www\KL_Altisourse`

#### Architecture (3 approaches exist):

**Approach 1: BDA (Bedrock Data Automation) — `ultralender-lambda/appraisal_lambda/`**
- `hybrid_processor.py` → Stages 1-3 (document extraction via BDA + LLM)
- `rule_engine.py` → Stage 4 (question/answer processing)
- Orchestrated by `lambda_invoker_service.py` in backend

**Approach 2: Textract+LLM — `appraisal-review-lambda/`**
- Single Lambda with 5-stage pipeline
- Stage 1: Extraction (XML-first, BDA fallback)
- Stage 2: External Lookups (USPS, ASC, Google Maps)
- Stage 3: Photo Analysis (Bedrock vision)
- Stage 4: Specialist Agent Evaluation (router + agents)
- Stage 5: Save Results

**Approach 3: Local CLI — `appraisal-review-pipeline/`**
- Same logic as Approach 2, runnable locally

### Pipeline Stages (Unified View):

```
Case Input (case_id, documents[], auth_token)
    │
    ├── Stage 1: EXTRACTION
    │   ├── XML parsing (appraisal XML → structured fields)
    │   ├── BDA/Textract OCR (PDF → text)
    │   └── LLM field extraction (text → key-value pairs)
    │
    ├── Stage 2: EXTERNAL LOOKUPS
    │   ├── USPS address validation
    │   ├── ASC appraiser license verification
    │   └── Google Maps Street View capture
    │
    ├── Stage 3: PHOTO ANALYSIS
    │   ├── PDF photo extraction
    │   ├── Bedrock vision analysis (deficiencies, smoke detectors, etc.)
    │   └── Street View comparison
    │
    ├── Stage 4: CHECKLIST EVALUATION
    │   ├── Field resolution (question → relevant fields)
    │   ├── Specialist agents (USPS, ASC, Photo)
    │   ├── Rule engine (operator-based rules)
    │   └── LLM evaluation (complex questions)
    │
    └── Stage 5: SAVE RESULTS
        ├── Update checklist items
        ├── Save LLM runs
        └── Update case status
```

---

## Strands Agentic Implementation

### Agent Architecture:

```
┌──────────────────────────────────────────────────────────────┐
│        ORCHESTRATOR: appraisal_review_orchestrator            │
│  System: "You coordinate the full appraisal review pipeline" │
│  Model: amazon.nova-pro-v1:0 | Mode: Sequential             │
└────┬─────────┬──────────┬──────────┬──────────┬─────────────┘
     │         │          │          │          │
┌────▼───┐ ┌──▼────┐ ┌───▼───┐ ┌───▼────┐ ┌───▼────┐
│Extract │ │Lookup │ │Photo  │ │Eval    │ │Save    │
│Agent   │ │Agent  │ │Agent  │ │Agent   │ │Agent   │
└────────┘ └───────┘ └───────┘ └────────┘ └────────┘
```

### Custom Tools (ported from existing code):

1. **xml_parse_appraisal** — Parse XML to structured fields
2. **bda_extract_fields** — BDA document extraction
3. **fetch_s3_document** — S3 document retrieval
4. **usps_validate_address** — USPS API call
5. **asc_verify_appraiser** — ASC license check
6. **google_maps_streetview** — Street View capture
7. **extract_photos_from_pdf** — PDF photo extraction
8. **analyze_photo_bedrock** — Bedrock vision analysis
9. **compare_streetview** — Subject vs Street View comparison
10. **resolve_field_value** — Map question to field values
11. **evaluate_question_llm** — LLM-based Q&A evaluation
12. **apply_rule_engine** — Operator/rule-based evaluation
13. **save_checklist_items** — Persist results to API
14. **save_llm_runs** — Persist LLM run data
15. **update_case_status** — Update case processing state

---

## Implementation Plan

### Phase 1: Pre-built Flow Template ✅ (This Session)
- Create a pre-built project template that loads in Strands Studio
- Includes all 5 agents + orchestrator + tools + connections
- Generates executable Strands SDK Python code

### Phase 2: Tool Implementation
- Port each tool function from existing codebase
- Test individually via Studio execution panel

### Phase 3: Integration Testing
- Run against golden set cases
- Compare results with existing pipeline

### Phase 4: Deployment
- Deploy as Lambda via Studio
- Wire backend `lambda_invoker_service.py` to invoke Strands Lambda

---

## Files Created

- `SESSION_APPRAISAL_REVIEW.md` — This document
- `appraisal-review-workflow.json` — Production-grade importable project (17 nodes, 16 edges)

## How to Load & Test

1. Open http://localhost:5173
2. Click the **Upload/Import** button in the top toolbar
3. Select `appraisal-review-workflow.json`
4. The full orchestrator workflow loads on canvas
5. Edit the **Input Node** to set a real case_id and auth_token
6. Click **Execute** to run the pipeline against your backend

## Production Integration

The workflow uses your existing infrastructure:
- **S3 Bucket**: `ultralender` (from tenant_config.AWS_S3_BUCKET)
- **API Base**: Your backend at the configured api_base_url
- **Auth**: Bearer token from Cognito (with refresh_token support)
- **Models**: amazon.nova-pro-v1:0 / nova-lite-v1:0
- **External APIs**: USPS Web Tools, ASC Registry, Google Maps

## Status: ✅ Build Passing | JSON Valid (17 nodes, 16 edges)
