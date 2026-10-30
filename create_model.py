# Optional: creates a standalone "hikma-ai" model inside Ollama.
# Not needed for the website, which sends prompt.txt itself.
import subprocess
from pathlib import Path

BASE_MODEL = "gemma4:31b-cloud"
NAME = "hikma-ai"

prompt = (Path(__file__).parent / "prompt.txt").read_text(encoding="utf-8").strip()
modelfile = f'FROM {BASE_MODEL}\n\nSYSTEM """\n{prompt}\n"""\n\nPARAMETER temperature 0.4\n'
Path("Modelfile").write_text(modelfile, encoding="utf-8")
print("Modelfile saved. Creating model...")
subprocess.run(["ollama", "create", NAME, "-f", "Modelfile"], check=True)
print(f"Done. Run it with: ollama run {NAME}")
