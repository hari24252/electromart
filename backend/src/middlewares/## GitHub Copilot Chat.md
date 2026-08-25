## GitHub Copilot Chat

- Extension: 0.59.0 (prod)
- VS Code: 1.131.0 (e4c7e7b1d6d060162f4aa7f8225271b67ce1df75)
- OS: linux 7.0.0-29-generic x64
- GitHub Account: hariharan24252-collab

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "telemetry.telemetryLevel": "all",
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (95 ms)
- DNS ipv6 Lookup: Error (107 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (11 ms)
- Electron fetch (configured): HTTP 200 (156 ms)
- Node.js https: HTTP 200 (532 ms)
- Node.js fetch: HTTP 200 (124 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.21 (97 ms)
- DNS ipv6 Lookup: Error (60 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (26 ms)
- Electron fetch (configured): HTTP 200 (419 ms)
- Node.js https: HTTP 200 (1341 ms)
- Node.js fetch: HTTP 200 (1423 ms)

Connecting to https://proxy.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 4.225.11.192 (226 ms)
- DNS ipv6 Lookup: Error (133 ms): getaddrinfo ENOTFOUND proxy.individual.githubcopilot.com
- Proxy URL: None (297 ms)
- Electron fetch (configured): HTTP 200 (247 ms)
- Node.js https: HTTP 200 (988 ms)
- Node.js fetch: HTTP 200 (1174 ms)

Connecting to https://mobile.events.data.microsoft.com/OneCollector/1.0?cors=true&content-type=application/x-json-stream (Electron fetch): HTTP 200 (396 ms)
Connecting to https://telemetry.individual.githubcopilot.com/telemetry (Node.js https): HTTP 200 (1562 ms)
Connecting to https://default.exp-tas.com/vscode/ab (Node.js fetch): HTTP 200 (761 ms)

Number of system certificates: 365

## Notes

- Active fetcher: Electron fetch.
- For corporate networks also see: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).