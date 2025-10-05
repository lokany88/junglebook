def select_template(idea: str) -> tuple[str, str]:
    """
    Returns (slug, template_name).
    Example: ("ai-tutors-marketplace", "next_serverless_edge")
    """
    import re, hashlib, time
    slug = re.sub(r"[^a-z0-9-]", "-", idea.lower())[:30] or f"app-{int(time.time())}"
    # Placeholder: always return T1 unless keywords indicate compliance
    if any(k in idea.lower() for k in ["hipaa", "pci", "bank", "insurance", "pii"]):
        return slug, "django_postgres"
    return slug, "next_serverless_edge"

