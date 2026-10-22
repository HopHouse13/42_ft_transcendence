### Prerequisites

| Tool | Version / Notes |
| --- | --- |
| Docker (or Podman) | 24+ recommended

 |
| Docker Compose plugin | v2+

 |
| Make | Required for the automated build and certificate generation commands |
| OpenSSL | To generate a local self-signed certificate

 |
| Google Chrome | Latest stable (officially supported browser)

 |

No local Node.js installation is required to run the project; everything runs in containers. Node.js 20+ is only needed if you want to run the backend or frontend outside Docker.

*(...)*

### 5. Access

| Service | URL |
| --- | --- |
| Application | https://localhost:8443

 |
| HTTP (redirects to HTTPS) | http://localhost:8080

 |
| Grafana | https://localhost:8443/grafana/

 |
| Backend health check | `GET /health` (internal, used by Docker healthcheck)

 |
| Prometheus metrics | `/api/metrics` (internal to the Docker network, scraped by Prometheus; external access is explicitly blocked and obfuscated as a JSON 404 by Nginx) |

Are you also masking the `/health` endpoint from external requests in your Nginx configuration in a similar way?