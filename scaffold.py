import re
import os

def extract_files(markdown_content):
    """
    Extracts file paths and content from markdown.
    Returns a dictionary of {path: content}.
    """
    files = {}

    # Pattern 1: For Dockerfiles, with "Caminho"
    pattern1 = re.compile(r"\$\*\*Caminho\*\*:\s*`([^`]+)`\s*\n+```[a-zA-Z]*\n(.*?)\n```", re.DOTALL)
    for match in pattern1.finditer(markdown_content):
        path = match.group(1)
        content = match.group(2)
        if 'backend/Dockerfile' in path or 'frontend/Dockerfile' in path:
            files[path] = content

    # Pattern 2: For nginx.conf
    pattern2 = re.compile(r"\$\*\*nginx\.conf\*\* \(Frontend\):\s*\n+```nginx\n(.*?)\n```", re.DOTALL)
    match = pattern2.search(markdown_content)
    if match:
        content = match.group(1)
        files['frontend/nginx.conf'] = content
        
    # Pattern 3: For docker-compose.yml
    pattern3 = re.compile(r"### 3\. `docker-compose\.yml`\s*\n(?:.*\n)*?```yaml\n(.*?)\n```", re.DOTALL)
    match = pattern3.search(markdown_content)
    if match:
        content = match.group(1)
        files['docker-compose.yml'] = content

    # Pattern 4: For deploy.yml
    pattern4 = re.compile(r"\$\*\*Localização\*\*:\s*`(\.github/workflows/deploy\.yml)`\s*\n+```yaml\n(.*?)\n```", re.DOTALL)
    match = pattern4.search(markdown_content)
    if match:
        path = match.group(1)
        content = match.group(2)
        files[path] = content

    return files


def create_files(files):
    """Creates files from a dictionary of {path: content}."""
    for path, content in files.items():
        print(f"Creating file: {path}")
        dir_name = os.path.dirname(path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        with open(path, 'w') as f:
            f.write(content)

def main():
    with open('deploy_pattern_prompt.md', 'r') as f:
        markdown = f.read()
    
    files = extract_files(markdown)
    
    if not files:
        print("No files extracted. Please check the markdown file and regex patterns.")
        return

    create_files(files)
    print(f"\nSuccessfully created {len(files)} files.")


if __name__ == "__main__":
    main()
