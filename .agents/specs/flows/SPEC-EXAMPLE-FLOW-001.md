---
id: SPEC-EXAMPLE-FLOW-001
title: Example flow
status: draft
category: flow
related_requirements:
  - REQ-EXAMPLE-001
related_contracts:
  - .agents/contract/api/example-api.yaml
---

# User Flow
1. ユーザーが example action を開始する
2. システムが処理を開始する
3. 結果またはエラーを返す

# States
- idle
- processing
- success
- failure

# Error Handling
- failure では再試行経路を提供する
