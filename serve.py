import http.server
import socketserver
import socket
import os
import sys

PORT = 8080

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 允許跨域與快顯快取防護
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    local_ip = get_local_ip()

    print("=" * 60)
    print(" 🎱 AR 撞球大師 (AR 8-Ball Master) WebAR 本地測試伺服器")
    print("=" * 60)
    print(f" 本機電腦測試請開啟:   http://localhost:{PORT}")
    print(f" 區域網路 iPhone 測試: http://{local_ip}:{PORT}")
    print("=" * 60)
    print(" 💡 提醒：iOS Safari 開啟相機需透過 HTTPS 或 localhost。")
    print("    建議方式：")
    print("    1. 使用 GitHub Pages 發布 (已內建 GitHub Actions 自動部署)")
    print("    2. 或透過 ngrok / localtunnel: `npx localtunnel --port 8080`")
    print("=" * 60)
    print(" 按下 Ctrl + C 停止伺服器...\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n伺服器已停止。")

if __name__ == '__main__':
    main()
