import requests
from bs4 import BeautifulSoup

response = requests.get("https://www.princeton.edu/events/2025/millstone-exhibition-jasper-waldman-0", timeout=2)
assert(response.status_code == 200)
soup = BeautifulSoup(response.text, 'html.parser')
text = str(soup)
print(text)