# Sih-project-

## Open On Another Laptop

1. Connect both laptops to the same Wi-Fi network.
2. On the host laptop, run `npm run dev`.
3. Open the printed `Network` URL on the other laptop, for example `http://192.168.1.20:3000`.
4. If Windows Firewall asks, allow Node.js or TCP port `3000` on Private networks.

The server listens on all network interfaces (`0.0.0.0`). In PowerShell, set a different port with `$env:PORT=3001; npm run dev` if port `3000` is already in use.

## Publish On The Internet

1. Push this repository to GitHub.
2. Create an account at [Render](https://render.com).
3. Choose **New +** and select **Blueprint**.
4. Connect this GitHub repository. Render will read `render.yaml` automatically.
5. Set `GEMINI_API_KEY` in the Render environment variables if AI briefings are needed.
6. Deploy and share the generated `https://...onrender.com` URL.

The Render service uses `npm run build` and `npm start`, and the assigned public port is provided automatically by Render.