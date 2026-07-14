"""
Appraisal Review Pipeline — Strands Agent SDK Lambda

Drop-in replacement for appraisal-review-lambda.
Same 5 stages, same API calls, same S3 bucket, same event payload.
Deploys as AWS Lambda via Strands Studio.

Stages:
  1. Extraction (XML-first for appraisal, BDA/OCR for PDFs)
  2. External Lookups (USPS, ASC, Google Maps)
  3. Photo Analysis (Bedrock vision)
  4. Specialist Agent Evaluation (router + LLM)
  5. Save Results (checklist_items + case_llm_runs)
"""
import asyncio
import json
import logging
import os
import re
import time
from datetime import datetime, timezone

import boto3
from strands import Agent, tool
from strands.models import BedrockModel

logger = logging.getLogger("appraisal_pipeline")
logger.setLevel(logging.INFO)

# ─── Config from environment / event ────────────────────────────────────────
API_BASE_URL = os.environ.get("API_BASE_URL", "")
S3_BUCKET = os.environ.get("S3_BUCKET", "ultralender")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
LLM_MODEL_ID = os.environ.get("LLM_MODEL_ID", "amazon.nova-pro-v1:0")


# ═══════════════════════════════════════════════════════════════════════════════
# TOOLS — Same logic as existing pipeline modules
# ═══════════════════════════════════════════════════════════════════════════════


@tool
def fetch_case_data(case_id: int, api_base_url: str, auth_token: str) -> dict:
    """Fetch case evaluation data from backend API (documents, questions, fields)."""
    import httpx

    headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    client = httpx.Client(timeout=60, headers=headers, verify=False)
    try:
        resp = client.get(f"{api_base_url}/api/review-pipeline-data/case/{case_id}/evaluation-data")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}
    finally:
        client.close()


@tool
def extract_xml_fields(xml_s3_path: str, bucket: str, region: str) -> dict:
    """Fetch and parse appraisal XML from S3 into structured fields."""
    import xml.etree.ElementTree as ET

    s3 = boto3.client("s3", region_name=region)
    key = xml_s3_path.replace(f"s3://{bucket}/", "") if xml_s3_path.startswith("s3://") else xml_s3_path
    obj = s3.get_object(Bucket=bucket, Key=key)
    xml_content = obj["Body"].read().decode("utf-8")
    root = ET.fromstring(xml_content)
    fields = {}
    for elem in root.iter():
        tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
        if elem.text and elem.text.strip():
            fields[tag] = elem.text.strip()
        for attr_name, attr_val in elem.attrib.items():
            if attr_val.strip():
                fields[f"{tag}_{attr_name}"] = attr_val.strip()
    return {"appraisal": fields, "field_count": len(fields)}


@tool
def usps_validate_address(street: str, city: str, state: str, zip_code: str) -> dict:
    """Validate property address via USPS Web Tools API."""
    import requests
    import xml.etree.ElementTree as ET

    user_id = os.environ.get("USPS_USER_ID", "")
    if not user_id:
        return {"match": None, "error": "USPS_USER_ID not configured"}
    xml_req = (
        f'<AddressValidateRequest USERID="{user_id}"><Address>'
        f"<Address1></Address1><Address2>{street}</Address2>"
        f"<City>{city}</City><State>{state}</State>"
        f"<Zip5>{zip_code}</Zip5><Zip4></Zip4></Address></AddressValidateRequest>"
    )
    try:
        resp = requests.get(
            "https://secure.shippingapis.com/ShippingAPI.dll",
            params={"API": "Verify", "XML": xml_req},
            timeout=10,
        )
        root = ET.fromstring(resp.text)
        error = root.find(".//Error")
        if error is not None:
            return {"match": False, "error": error.find("Description").text}
        addr = root.find(".//Address")
        usps_addr = f"{addr.find('Address2').text}, {addr.find('City').text}, {addr.find('State').text} {addr.find('Zip5').text}"
        return {"match": True, "usps_address": usps_addr}
    except Exception as e:
        return {"match": None, "error": str(e)}


@tool
def asc_verify_appraiser(first_name: str, last_name: str, state: str, license_number: str) -> dict:
    """Verify appraiser license via ASC National Registry."""
    import requests

    try:
        resp = requests.get(
            "https://www.asc.gov/api/appraiser/search",
            params={"firstName": first_name, "lastName": last_name, "state": state},
            timeout=15,
        )
        results = resp.json().get("results", [])
        for r in results:
            if license_number and r.get("licenseNumber", "").strip() == license_number.strip():
                return {"found": True, "status": r.get("status"), "license_number": r.get("licenseNumber"), "expiration_date": r.get("expirationDate")}
        if results:
            return {"found": True, "status": results[0].get("status"), "license_number": results[0].get("licenseNumber")}
        return {"found": False, "error": "No matching appraiser"}
    except Exception as e:
        return {"found": None, "error": str(e)}


@tool
def google_maps_streetview(address: str, case_id: int, bucket: str, region: str) -> dict:
    """Capture Google Street View image and upload to S3."""
    import requests

    api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return {"error": "GOOGLE_MAPS_API_KEY not configured"}
    url = f"https://maps.googleapis.com/maps/api/streetview?size=640x480&location={address}&key={api_key}"
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200 and len(resp.content) > 5000:
            s3_key = f"loanDocs/AppraisalReview/{case_id}/streetview/streetview_auto.jpg"
            s3 = boto3.client("s3", region_name=region)
            s3.put_object(Bucket=bucket, Key=s3_key, Body=resp.content, ContentType="image/jpeg")
            return {"streetview_auto": s3_key, "size_bytes": len(resp.content)}
        return {"error": f"Street View unavailable (status={resp.status_code})"}
    except Exception as e:
        return {"error": str(e)}


@tool
def analyze_photo_bedrock(image_base64: str, analysis_type: str, region: str, model_id: str) -> dict:
    """Analyze property photo using Bedrock vision model."""
    import base64

    prompts = {
        "safety": "Check for: smoke detectors, CO detectors, window bars, oil tanks, power lines. Answer Yes/No for each.",
        "deficiency": "Identify deferred maintenance: peeling paint, damaged roof, cracks, water damage. Describe findings.",
        "exterior": "Analyze exterior: solar panels, fencing, landscaping, structural issues. Report findings.",
    }
    client = boto3.client("bedrock-runtime", region_name=region)
    resp = client.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [
            {"image": {"format": "png", "source": {"bytes": base64.b64decode(image_base64)}}},
            {"text": prompts.get(analysis_type, prompts["safety"])},
        ]}],
        inferenceConfig={"maxTokens": 1024, "temperature": 0.0},
    )
    return {"analysis": resp["output"]["message"]["content"][0]["text"], "type": analysis_type}


@tool
def evaluate_question_llm(question: str, field_data: str, instruction: str, region: str, model_id: str) -> dict:
    """Evaluate a checklist question using Bedrock LLM. Returns answer, reasoning, confidence."""
    system_prompt = (
        "You are an expert mortgage appraisal reviewer. "
        "Evaluate checklist questions by comparing extracted field values. "
        "Return Yes, No, N/A, or Unknown on FIRST line, then reasoning. "
        "Last line: Confidence: X.XX (0.00-1.00). "
        "Rules: [NOT AVAILABLE]=missing. All missing→Unknown. Precondition false→N/A."
    )
    user_prompt = f"## Question: {question}\n\n### Field Values\n{field_data}\n\n### Instructions\n{instruction}\n\nAnswer:"
    client = boto3.client("bedrock-runtime", region_name=region)
    resp = client.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": user_prompt}]}],
        system=[{"text": system_prompt}],
        inferenceConfig={"maxTokens": 1024, "temperature": 0.0},
    )
    raw = resp["output"]["message"]["content"][0]["text"]
    lines = raw.strip().split("\n")
    first = re.sub(r"\*+", "", lines[0]).strip().rstrip(".").upper()
    if first in ("YES", "Y"):
        answer = "Yes"
    elif first in ("NO", "N"):
        answer = "No"
    elif first in ("NA", "N/A", "NOT APPLICABLE"):
        answer = "N/A"
    else:
        answer = "Unknown"
    conf_match = re.search(r"[Cc]onfidence\s*[:=]\s*([\d.]+)", raw)
    confidence = float(conf_match.group(1)) if conf_match else (0.85 if answer in ("Yes", "No") else 0.50)
    if confidence > 1.0:
        confidence = confidence / 100.0
    reasoning = "\n".join(lines[1:]).strip()
    return {"answer": answer, "reasoning": reasoning, "confidence": confidence}


@tool
def save_results_to_api(case_id: int, rows: list, api_base_url: str, auth_token: str) -> dict:
    """Save evaluation results: checklist items + LLM runs + case status update."""
    import httpx

    headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    client = httpx.Client(timeout=30, headers=headers, verify=False)
    saved = failed = 0

    # Get existing checklist items to map question text → item ID
    try:
        resp = client.get(f"{api_base_url}/api/question-processing/case/{case_id}/checklist-items")
        items = resp.json().get("items", []) if resp.status_code == 200 else []
    except Exception:
        items = []

    items_by_order = {it.get("order_index"): it for it in items if it.get("order_index") is not None}

    for row in rows:
        oi, q_text, answer, reasoning, prompt_sent, conf = row
        item = items_by_order.get(oi)
        if not item:
            failed += 1
            continue
        try:
            update_data = {
                "response": answer.lower() if answer in ("Yes", "No") else answer,
                "ai_comment": reasoning[:500],
                "confidence": str(round(conf, 2)),
                "requires_review": conf < 0.80 or answer == "Unknown",
            }
            r = client.post(f"{api_base_url}/api/cases/{case_id}/checklist/{item['id']}/update", json=update_data)
            saved += 1 if r.status_code == 200 else 0
            failed += 0 if r.status_code == 200 else 1
        except Exception:
            failed += 1

    # Update case status
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        client.post(f"{api_base_url}/api/case-processing/state/{case_id}/update", json={
            "current_stage": "completed", "progress_percentage": 100, "completed_at": now_iso,
        })
        client.post(f"{api_base_url}/api/cases/{case_id}/update", json={
            "status": "Review Pipeline Complete", "completed_at": now_iso,
        })
    except Exception:
        pass

    client.close()
    yes = sum(1 for r in rows if r[2] == "Yes")
    no = sum(1 for r in rows if r[2] == "No")
    na = sum(1 for r in rows if r[2] == "N/A")
    unk = sum(1 for r in rows if r[2] == "Unknown")
    return {"saved": saved, "failed": failed, "total": len(rows), "yes": yes, "no": no, "na": na, "unknown": unk}


@tool
def update_processing_state(case_id: int, stage: str, progress: int, api_base_url: str, auth_token: str) -> dict:
    """Update case processing state via backend API."""
    import httpx

    headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    data = {"current_stage": stage, "progress_percentage": progress}
    if stage == "completed":
        data["completed_at"] = datetime.now(timezone.utc).isoformat()
    try:
        r = httpx.post(f"{api_base_url}/api/case-processing/state/{case_id}/update", json=data, headers=headers, timeout=10, verify=False)
        return {"success": r.status_code == 200}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ═══════════════════════════════════════════════════════════════════════════════
# PIPELINE ORCHESTRATOR AGENT
# ═══════════════════════════════════════════════════════════════════════════════

ORCHESTRATOR_SYSTEM_PROMPT = """You are the Appraisal Review Pipeline Orchestrator.
You process a mortgage appraisal case through 5 sequential stages.

You receive a case event with: case_id, documents, auth_token, api_base_url, tenant_config.

Execute these stages IN ORDER:

STAGE 1 - EXTRACTION:
- Call fetch_case_data to get evaluation data (documents, questions, field mappings)
- If XML path exists, call extract_xml_fields
- Store extracted fields for later stages

STAGE 2 - EXTERNAL LOOKUPS:
- Extract address from appraisal fields → call usps_validate_address
- Extract appraiser name → call asc_verify_appraiser
- Call google_maps_streetview with full address

STAGE 3 - PHOTO ANALYSIS:
- Find appraisal PDF from documents
- Call analyze_photo_bedrock for property photos

STAGE 4 - CHECKLIST EVALUATION:
- For each question from evaluation data:
  - Build field_data from extracted fields using field_mappings
  - Call evaluate_question_llm with question + field_data
- Collect all results as rows: [order_index, question, answer, reasoning, prompt, confidence]

STAGE 5 - SAVE RESULTS:
- Call save_results_to_api with all evaluation rows
- Return final summary

Call update_processing_state at the start of each stage.
If any stage fails, log the error and continue to the next stage.
Return the final summary with counts."""

# All tools available to the orchestrator
ALL_TOOLS = [
    fetch_case_data,
    extract_xml_fields,
    usps_validate_address,
    asc_verify_appraiser,
    google_maps_streetview,
    analyze_photo_bedrock,
    evaluate_question_llm,
    save_results_to_api,
    update_processing_state,
]


def create_pipeline_agent():
    """Create the Strands pipeline agent with Bedrock model."""
    model = BedrockModel(
        model_id=LLM_MODEL_ID,
        region_name=AWS_REGION,
    )
    return Agent(
        model=model,
        tools=ALL_TOOLS,
        system_prompt=ORCHESTRATOR_SYSTEM_PROMPT,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# LAMBDA HANDLER
# ═══════════════════════════════════════════════════════════════════════════════

def handler(event, context):
    """AWS Lambda entry point. Same event payload as appraisal-review-lambda."""
    case_id = event.get("case_id", "unknown")
    logger.info(f"[HANDLER] Invoked case={case_id}")
    start = time.time()

    # Extract config from event (same as existing lambda)
    api_base_url = event.get("api_base_url") or API_BASE_URL
    auth_token = event.get("auth_token", "")
    tenant_config = event.get("tenant_config", {})

    # Override globals from tenant_config
    global S3_BUCKET, AWS_REGION, LLM_MODEL_ID
    S3_BUCKET = tenant_config.get("AWS_S3_BUCKET", S3_BUCKET)
    AWS_REGION = tenant_config.get("AWS_REGION", AWS_REGION)
    LLM_MODEL_ID = tenant_config.get("LLM_MODEL_ID", LLM_MODEL_ID)

    # Build the prompt for the orchestrator
    prompt = f"""Process appraisal review for case_id={case_id}.

Configuration:
- api_base_url: {api_base_url}
- auth_token: {auth_token[:20]}... (use full token in tool calls)
- s3_bucket: {S3_BUCKET}
- region: {AWS_REGION}
- model_id: {LLM_MODEL_ID}
- documents: {json.dumps(event.get('documents', []))}

Full auth_token for tool calls: {auth_token}

Execute all 5 stages and return the final summary."""

    try:
        agent = create_pipeline_agent()
        result = agent(prompt)
        elapsed = time.time() - start
        logger.info(f"[HANDLER] Complete case={case_id} elapsed={elapsed:.1f}s")
        return {
            "statusCode": 200,
            "body": json.dumps({"case_id": case_id, "result": str(result), "elapsed_seconds": round(elapsed, 1)}, default=str),
        }
    except Exception as e:
        logger.error(f"[HANDLER] Failed case={case_id}: {e}", exc_info=True)
        return {"statusCode": 500, "body": json.dumps({"error": str(e), "case_id": case_id})}


# ─── Local testing ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run appraisal review pipeline locally")
    parser.add_argument("--case-id", type=int, required=True)
    parser.add_argument("--api-base-url", default=os.environ.get("API_BASE_URL", "http://localhost:8002"))
    parser.add_argument("--auth-token", default=os.environ.get("AUTH_TOKEN", ""))
    args = parser.parse_args()

    event = {
        "case_id": args.case_id,
        "api_base_url": args.api_base_url,
        "auth_token": args.auth_token,
        "tenant_config": {
            "AWS_REGION": AWS_REGION,
            "AWS_S3_BUCKET": S3_BUCKET,
            "LLM_MODEL_ID": LLM_MODEL_ID,
        },
    }
    result = handler(event, None)
    print(json.dumps(json.loads(result["body"]), indent=2))
