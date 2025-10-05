from pathlib import Path
import shutil
from .common import standardize_repo_tree

def generate_t1(slug: str, idea: str):
    target = Path(f"apps/{slug}")
    src = Path("templates/t1-next-worker")
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(src, target)
    # Add v2.0 skeleton
    standardize_repo_tree(target, slug, idea, template="next_serverless_edge")
    (target / "README.md").write_text(f"# {slug}\n\n{idea}\n")

