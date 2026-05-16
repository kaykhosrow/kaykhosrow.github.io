import re
from bs4 import BeautifulSoup

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def replace_block(index_html, marker, new_content):
    pattern = rf'(<!-- AUTO:{marker}:start -->).*?(<!-- AUTO:{marker}:end -->)'
    replacement = rf'\1\n{new_content}\n\2'
    return re.sub(pattern, replacement, index_html, flags=re.DOTALL)

index_html = read('index.html')
conf       = BeautifulSoup(read('conferences.html'), 'html.parser')
code       = BeautifulSoup(read('code.html'), 'html.parser')

# ── Conferences: top 3 entries ────────────────────────────────
entries = conf.select('.conf-entry')[:3]
conf_block = '\n'.join(f'''                <div class="experience-item">
                  <h5><strong>{e.find('h5').get_text(strip=True)}</strong></h5>
                  <p>{e.find('p').get_text(strip=True)}</p>
                </div>''' for e in entries)
index_html = replace_block(index_html, 'conferences', conf_block)

# ── Code: top 3 items ─────────────────────────────────────────
code_items = code.select('.code-item')[:3]
code_block = '\n'.join(str(item) for item in code_items)
index_html = replace_block(index_html, 'code', code_block)

write('index.html', index_html)
print("Synced.")
