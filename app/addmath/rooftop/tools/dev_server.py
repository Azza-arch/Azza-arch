"""Local dev server for app/addmath/rooftop with caching disabled.

python's plain `http.server` sends a `Last-Modified` header but no
`Cache-Control`, so browsers apply heuristic caching and can keep serving a
stale HTML/CSS/JS file after an edit even on an ordinary refresh. This wrapper
sends `Cache-Control: no-store` on every response so edits always show up.

Usage (from the repository root):
    python app/addmath/rooftop/tools/dev_server.py [port]
Default port: 8765.
"""
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    # ThreadingHTTPServer, not plain HTTPServer: the level now loads ~90
    # assets in parallel on boot, and a single-threaded server serializes
    # those requests and can drop/time out some of them under load.
    ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
