# jb/generators/t1_next_worker.py
from pathlib import Path
import shutil
from .common import standardize_repo_tree

def generate_t1(slug: str, idea: str):
    target = Path(f"apps/{slug}")
    src = Path("templates/t1-next-worker")
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(src, target)
    # Ensure wrangler.toml exists (or copy your example and let preset adjust D1)
    if not (target / "wrangler.toml").exists() and (target / "infra/cloudflare/wrangler.example.toml").exists():
        shutil.copyfile(target / "infra/cloudflare/wrangler.example.toml", target / "wrangler.toml")
    # Add v2.0 standard skeleton
    standardize_repo_tree(target, slug, idea, template="next_serverless_edge")
    # Minimal README
    (target / "README.md").write_text(f"# {slug}\n\n{idea}\n")

