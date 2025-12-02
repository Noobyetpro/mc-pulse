---
sidebar_position: 2
---

# Making your first API call

All examples hit the hosted endpoint at **https://mc-pulse.vercel.app/api** (no port). Swap `type=bedrock` or set `port` if you want non-default ports.

## cURL
```bash
curl "https://mc-pulse.vercel.app/api/status/java?host=arch.mc"
```

## JavaScript (fetch)
```js
const res = await fetch('https://mc-pulse.vercel.app/api/status/java?host=arch.mc');
if (!res.ok) throw new Error('Request failed');
const data = await res.json();
console.log(data);
```

## Node (axios)
```js
import axios from 'axios';

const {data} = await axios.get('https://mc-pulse.vercel.app/api/status/java', {
  params: {host: 'arch.mc'},
});
console.log(data);
```

## Python (requests)
```python
import requests

resp = requests.get(
    "https://mc-pulse.vercel.app/api/status/java",
    params={"host": "arch.mc"},
    timeout=10,
)
resp.raise_for_status()
print(resp.json())
```

## Go (net/http)
```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	req, _ := http.NewRequest("GET", "https://mc-pulse.vercel.app/api/status/java", nil)
	q := req.URL.Query()
	q.Add("host", "arch.mc")
	req.URL.RawQuery = q.Encode()

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var payload map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		panic(err)
	}
	fmt.Println(payload)
}
```

## Ruby (Net::HTTP)
```ruby
require "net/http"
require "json"

uri = URI("https://mc-pulse.vercel.app/api/status/java")
uri.query = URI.encode_www_form(host: "arch.mc")

res = Net::HTTP.get_response(uri)
raise res.body unless res.is_a?(Net::HTTPSuccess)

puts JSON.parse(res.body)
```

Next up: add API keys and webhooks so you can broadcast status updates—see [Adding webhooks](./adding-webhooks.md).
