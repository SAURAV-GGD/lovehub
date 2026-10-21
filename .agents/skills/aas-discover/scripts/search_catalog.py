#!/usr/bin/env python3
"""
AAS Catalog Search and Installation Helper
Enables instant search across 2,737+ skills in the local AAS catalog,
and optional installation into the active workspace (.agents/skills).
"""

import sys
import os
import json
import shutil
import argparse

CATALOG_PATH = r"C:\Users\MISSGC\.gemini\config\aas-catalog\data\catalog.json"
SKILLS_DIR = r"C:\Users\MISSGC\.gemini\config\aas-catalog\skills"
WORKSPACE_SKILLS = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def load_catalog():
    if not os.path.exists(CATALOG_PATH):
        print(f"Error: Catalog not found at {CATALOG_PATH}")
        sys.exit(1)
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def search_skills(query, limit=10):
    cat = load_catalog()
    skills = cat.get("skills", [])
    query_lower = query.lower()
    
    matches = []
    # Support skills as either list of dicts or dict of dicts
    items = skills if isinstance(skills, list) else skills.values()
    for meta in items:
        skill_id = meta.get("id") or meta.get("name") or ""
        score = 0
        name = meta.get("name", "").lower()
        desc = meta.get("description", "").lower()
        tags = [t.lower() for t in meta.get("tags", [])]
        category = meta.get("category", "").lower()
        
        if query_lower == skill_id.lower():
            score += 100
        elif query_lower in name:
            score += 50
        elif any(query_lower in t for t in tags):
            score += 30
        elif query_lower in category:
            score += 20
        elif query_lower in desc:
            score += 10
            
        if score > 0:
            matches.append((score, skill_id, meta))
            
    matches.sort(key=lambda x: x[0], reverse=True)
    return matches[:limit]

def install_skill(skill_id):
    src = os.path.join(SKILLS_DIR, skill_id)
    if not os.path.exists(src):
        print(f"Skill '{skill_id}' not found in catalog.")
        return False
        
    dest = os.path.join(WORKSPACE_SKILLS, skill_id)
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    print(f"Successfully installed skill '{skill_id}' into {dest}")
    return True

def main():
    parser = argparse.ArgumentParser(description="AAS Skills Catalog CLI")
    parser.add_argument("query", nargs="?", help="Search term for skills")
    parser.add_argument("--install", help="Skill ID to install into workspace")
    parser.add_argument("--limit", type=int, default=10, help="Maximum search results to display")
    args = parser.parse_args()

    if args.install:
        install_skill(args.install)
        return

    if not args.query:
        parser.print_help()
        return

    results = search_skills(args.query, limit=args.limit)
    if not results:
        print(f"No skills found matching '{args.query}'.")
        return

    print(f"Found {len(results)} matches for '{args.query}':\n")
    for score, sid, meta in results:
        print(f"• {sid}")
        print(f"  Description: {meta.get('description', '')[:120]}...")
        print(f"  Category: {meta.get('category', 'unknown')} | Risk: {meta.get('risk', 'safe')}")
        print()

if __name__ == "__main__":
    main()
