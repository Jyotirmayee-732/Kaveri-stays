# 06 — Spec Drift

## 6.1 Generated OpenAPI spec vs original spec

The FastAPI-generated specification was checked against
`03_openapi_original.yaml`.

Generated specification:
`http://127.0.0.1:8000/openapi.json`

The generated specification is OpenAPI 3.1.0, while the original
hand-written specification uses OpenAPI 3.0.3.

---

## Differences found

### 1. OpenAPI version

Original:

```yaml
openapi: 3.0.3