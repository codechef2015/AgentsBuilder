"""
Templates API — Serves flow templates from MySQL database
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import json
import mysql.connector
import os

router = APIRouter(prefix="/api/templates", tags=["templates"])

def get_db_connection():
    """Get MySQL connection using environment variables or defaults."""
    return mysql.connector.connect(
        host=os.environ.get("MYSQL_HOST", "localhost"),
        user=os.environ.get("MYSQL_USER", "root"),
        password=os.environ.get("MYSQL_PASSWORD", ""),
        database=os.environ.get("MYSQL_DATABASE", "strands_builder"),
        port=int(os.environ.get("MYSQL_PORT", "3306"))
    )

class TemplateResponse(BaseModel):
    template_id: str
    name: str
    description: Optional[str]
    category: str
    pattern: Optional[str]
    difficulty: str
    tags: Optional[List[str]]
    flow_data: dict
    source_url: Optional[str]
    source_author: Optional[str]
    is_official: bool
    use_count: int

class TemplateListItem(BaseModel):
    template_id: str
    name: str
    description: Optional[str]
    category: str
    difficulty: str
    is_official: bool
    use_count: int
    source_author: Optional[str]

@router.get("/", response_model=List[TemplateListItem])
async def list_templates(category: Optional[str] = None, difficulty: Optional[str] = None, framework: Optional[str] = None):
    """List all published templates, optionally filtered by category, difficulty, or framework."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT template_id, name, description, category, difficulty, is_official, use_count, source_author FROM flow_templates WHERE is_published = TRUE"
    params = []
    
    if category:
        query += " AND category = %s"
        params.append(category)
    if difficulty:
        query += " AND difficulty = %s"
        params.append(difficulty)
    if framework:
        query += " AND (framework = %s OR framework IS NULL)"
        params.append(framework)
    
    query += " ORDER BY is_official DESC, use_count DESC"
    
    cursor.execute(query, params)
    templates = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return templates

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str):
    """Get a specific template with full flow data."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        """SELECT template_id, name, description, category, pattern, difficulty, 
           tags, flow_data, source_url, source_author, is_official, use_count 
           FROM flow_templates WHERE template_id = %s AND is_published = TRUE""",
        (template_id,)
    )
    template = cursor.fetchone()
    
    if not template:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Increment use count
    cursor.execute(
        "UPDATE flow_templates SET use_count = use_count + 1 WHERE template_id = %s",
        (template_id,)
    )
    conn.commit()
    
    # Parse JSON fields
    if isinstance(template['tags'], str):
        template['tags'] = json.loads(template['tags'])
    if isinstance(template['flow_data'], str):
        template['flow_data'] = json.loads(template['flow_data'])
    
    cursor.close()
    conn.close()
    
    return template
