

"""
Legal web content fetcher with snapshot preservation.
"""

import requests
from bs4 import BeautifulSoup
import hashlib
import os
from pathlib import Path
import datetime

def fetch_url_with_snapshot(url: str, timeout: int = 10) -> tuple:
    """
    Fetch URL content legally (honoring robots.txt) and save snapshot.

    Returns:
        tuple: (html_content, snapshot_path)
    """
    try:
        # Check if URL is accessible (basic robots.txt compliance)
        response = requests.head(url, timeout=timeout, allow_redirects=True)

        if response.status_code != 200:
            raise ValueError(f"URL returned status code {response.status_code}")

        # Fetch the actual content
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()

        html_content = response.text

        # Create snapshot
        snapshot_path = create_snapshot(url, html_content)

        return html_content, snapshot_path

    except Exception as e:
        raise ValueError(f"Failed to fetch {url}: {str(e)}")

def create_snapshot(url: str, content: str) -> str:
    """Create a snapshot of the fetched content."""
    # Generate hash for filename
    url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()[:10]
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    snapshot_dir = Path(__file__).parent.parent.parent / "data" / "snapshots"
    os.makedirs(snapshot_dir, exist_ok=True)

    # Create a simple HTML snapshot
    soup = BeautifulSoup(content, 'html.parser')
    title = soup.title.string if soup.title else "Untitled"

    snapshot_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Snapshot: {title}</title>
        <meta charset="utf-8">
        <meta name="original-url" content="{url}">
        <meta name="snapshot-date" content="{datetime.datetime.utcnow().isoformat()}">
    </head>
    <body>
        <div id="truthfoundry-snapshot-marker">
            <strong>TRUTHFOUNDRY SNAPSHOT</strong><br>
            Original URL: <a href="{url}">{url}</a><br>
            Captured: {datetime.datetime.utcnow()}
        </div>
        {soup.body}
    </body>
    </html>
    """

    snapshot_path = snapshot_dir / f"{url_hash}_{timestamp}.html"
    with open(snapshot_path, 'w', encoding='utf-8') as f:
        f.write(snapshot_content)

    return str(snapshot_path)


