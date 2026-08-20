# 验证 ID Token

SoulAuth 用 RS256 签发 ID Token，并在 JWKS 端点发布公钥。
消费方在**本地**验签，不需要为每个请求回调 SoulAuth。

## 为什么本地验签

三个理由，重要性递增：

1. **延迟** —— 已认证路径上没有网络往返。
2. **可用性** —— SoulAuth 短暂宕机降级的是新登录，
   而不是你整个系统的每一个请求。
3. **这是契约。** 对 SoulSeedOS，`P0-DECISION-10` 把它定死了：
   RS256、本地验签、寿命 ≤300 秒。

短寿命正是本地验签得以安全的原因。一个被吊销的会话在五分钟内自然失效，
不需要任何吊销通道 —— 用有界的陈旧，换来一个远为简单且可用的接入方式。

## 取 JWKS

```bash
curl -s https://auth.example.com/api/oidc/jwks
```

```json
{
  "keys": [
    { "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "...", "n": "...", "e": "AQAB" }
  ]
}
```

缓存它。遇到不认识的 `kid` 时再重取 —— 那是密钥轮换，
也是唯一该触发重取的事件。不要轮询。

## 要校验什么

下面每一条都要。漏掉任何一条，签名令牌就变成了装饰品：

| 检查项 | 为什么 |
| --- | --- |
| **签名** | RS256，用与令牌 `kid` 匹配的 JWKS 公钥。 |
| **`iss`** | 必须逐字等于你配的 issuer。 |
| **`aud`** | 必须等于你的 `client_id`。缺了这条，发给别的客户端的令牌也会被接受。 |
| **`exp`** | 未过期。允许几秒时钟偏差，不是几分钟。 |
| **`nonce`** | 若你在 `/authorize` 发过，必须匹配。 |
| **`sid`** | 必须存在且非空。 |

::: danger 不要接受 `alg: none`，也不要让令牌自己挑算法
把算法钉死为 RS256。一个从待验证令牌的头部去读 `alg` 的验证器，
就是那个经典的 JWT 漏洞。
:::

## Claims

| Claim | 含义 |
| --- | --- |
| `iss` | 签发方 —— `APP_URL` 去掉尾斜杠 |
| `sub` | 稳定的用户标识 |
| `aud` | 你的 `client_id` |
| `exp` / `iat` | 过期与签发时间 |
| `sid` | 认证会话 id —— **必填** |
| `nonce` | 你传了就回显 |

### `sid` 不是可选的

`sid` 标识认证会话，是协同登出得以工作的依据：
RP 发起的登出靠它定位要终止的那个会话。

**SoulAuth 在取不到会话引用时拒签**，从不签发缺 `sid` 的 ID Token。
所以如果你手上的令牌 `sid` 为空，那你拿的是 **access token**，不是 ID Token。
这是最常见的接入错误。

## 示例

### Node

```js
import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(
  new URL('https://auth.example.com/api/oidc/jwks')
)

const { payload } = await jwtVerify(idToken, JWKS, {
  issuer: 'https://auth.example.com',
  audience: process.env.CLIENT_ID,
  algorithms: ['RS256'],
})

if (!payload.sid) throw new Error('缺少 sid —— 这是不是 access token？')
```

### Python

```python
from jwt import PyJWKClient
import jwt

jwks = PyJWKClient("https://auth.example.com/api/oidc/jwks")
key = jwks.get_signing_key_from_jwt(id_token).key

claims = jwt.decode(
    id_token, key,
    algorithms=["RS256"],
    audience=CLIENT_ID,
    issuer="https://auth.example.com",
)

assert claims.get("sid"), "缺少 sid —— 这是不是 access token？"
```

### Rust

```rust
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

let mut validation = Validation::new(Algorithm::RS256);
validation.set_issuer(&["https://auth.example.com"]);
validation.set_audience(&[client_id]);

let data = decode::<Claims>(id_token, &decoding_key, &validation)?;
```

## 排查

```bash
# SoulAuth 实际声明的 issuer
curl -s https://auth.example.com/.well-known/openid-configuration | jq -r .issuer

# 当前签名密钥的 kid
curl -s https://auth.example.com/api/oidc/jwks | jq -r '.keys[0].kid'

# 你的令牌里到底是什么
echo "$ID_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '{iss, aud, sid, exp}'
```

常见故障：

| 症状 | 病因 |
| --- | --- |
| 所有令牌都报 issuer 不匹配 | `issuer` 差了一个尾斜杠、端口或 `www` |
| 本来好的，重启之后全挂 | 没配签名密钥，每次启动换一把 |
| 一个副本上好使，另一个上不好使 | 副本之间没共享签名密钥 |
| `sid` 为空 | 你在看 access token |
| 过几分钟就失败 | 符合预期 —— 令牌过期了，去刷新 |

第二和第三是同一个根因，见[生产闸门](/zh/guide/configuration#生产闸门)。

## 下一步

- [**BFF 模式**](./bff)
- [**SoulSeedOS 适配器**](./soulseedos)
- [**OIDC API 参考**](/zh/reference/oidc)
