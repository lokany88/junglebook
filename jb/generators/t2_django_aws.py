# jb/generators/t2_django_aws.py
from pathlib import Path
import shutil
from .common import standardize_repo_tree

def generate_t2(slug: str, idea: str):
    target = Path(f"apps/{slug}")
    src = Path("templates/t2-django-aws")
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(src, target)
    standardize_repo_tree(target, slug, idea, template="django_postgres")
    (target / "README.md").write_text(f"# {slug}\n\n{idea}\n")

