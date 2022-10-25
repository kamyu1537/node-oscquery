# @kamyu/oscquery

a simple oscquery service.

# Installation

```shell
npm install -P git://github.com/kamyu1537/node-oscquery.git
```

# Usage

```ts
import { OscQueryService } from '@kamyu/oscquery';

const oscQueryPort = 8080;
const oscPort = 8081;

const service = new OscQueryService('ServiceName', oscQueryPort, oscPort);
```

# Packages

- node-osc
- @homebridge/ciao
- eslint
- typescript
- prettier
- ts-node
- ts-node-dev
