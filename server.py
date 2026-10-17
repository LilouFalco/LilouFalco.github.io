from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit, unquote
from pathlib import PurePosixPath
import os
os.chdir('/home/portfolio')
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        allowed = path.rstrip('/') in ('/projets','/parcours','/voyages','/contact') or path in ('/','/index.html','/projets.html','/parcours.html','/voyages.html','/contact.html','/style.css','/fonts.css','/app.js') or path in ('/projets/index.html','/parcours/index.html','/voyages/index.html','/contact/index.html') or path.startswith('/assets/')
        if not allowed or any(p.startswith('.') for p in PurePosixPath(path).parts if p not in ('/','')):
            self.send_error(404)
            return
        super().do_GET()
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; script-src 'self'; media-src 'self'; frame-ancestors 'none'; base-uri 'none'")
        super().end_headers()
ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '18743'))),Handler).serve_forever()
