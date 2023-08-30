# Getting Started

This documentation is intended to guide you through the process of creating your own client application and integrating your community with the Community Hive platform.

## Prerequisites

Before you begin interacting with the Community Hive API, ensure that the following prerequisites are met:

1. All API requests must be made over a secure connection using HTTPS.
2. Your client application should support sending `PUT` requests and receiving `POST` requests.
3. Your client application must have the capability to encode and decode JWT (JSON Web Tokens) tokens.
4. Your client application should be able to store data on the local server.

## Key Terminology

- **Community Hive Key**: A key provided by Community Hive upon activating the client application. This key is necessary to decode JWT tokens received from Community Hive.
- **Community Hive Site Key**: A randomly generated 40-character string that your client application generates during activation. This key is used to encode JWT tokens for `PUT` requests to Community Hive.
- **Community Hive Site ID**: A unique identifier assigned by Community Hive during activation to identify the client application.

## Authentication

All API requests, whether sending or receiving, are authorized using JWT tokens. These tokens are stored in the request body as plain text. Note that the JWT token is **not** passed as a `Bearer` token in the `Authorization` header.

::: tip
You can inspect JWT tokens using the service: [https://jwt.io](https://jwt.io).
:::

### Generating a JWT Token

For requests made by your client application, data will be encoded in the JWT payload. The JWT payload will be signed using the base 64 encoded [Community Hive Site Key](#key-terminology), which is generated during client activation.

#### Payload/Claims

The JWT payload should include the following claims:

```json
{
  "iss": "Issuer of the JWT",
  "sub": "Subject of the JWT (the user)",
  "iat": "Time the token was issued",
  "exp": "Time the token expires",
  "nbf": "Time before which the token must not be accepted for processing",
  "aud": "Recipient for which the token is intended"
}
```

Additional request data should be JSON encoded and placed in the JWT payload.

#### Examples

Here's how to build a JWT token:

:::code-group
```php [PHP]
use Jose\Component\Core\AlgorithmManager;
use Jose\Component\Core\JWK;
use Jose\Component\Signature\Algorithm\HS256;
use Jose\Component\Signature\JWSBuilder;
use Jose\Component\Signature\JWSVerifier;
use Jose\Component\Signature\Serializer\CompactSerializer;

// Create a JWK (JSON Web Key) for signing
$jwk = new JWK([
    'kty' => 'oct',
    'k' => base64_encode(COMMUNITY_HIVE_SITE_KEY),
]);

// Create a JWS (JSON Web Signature) builder
$jwsCompactSerializer = new CompactSerializer();
$jwsBuilder = new JWSBuilder(new AlgorithmManager([new HS256()]));

// Define default payload claims
$defaultPayload = [
    'iss' => CLIENT_APPLICATION_URL,
    'sub' => COMMUNITY_HIVE_SITE_ID,
    'iat' => time(), // Issued at time (current Unix timestamp)
    'nbf' => time(), // Issued at time (current Unix timestamp)
    'exp' => time() + 60, // Expiry time (current Unix timestamp + 60 seconds)
    'aud' => 'communityhive',
];

// Build the JWS
$jws = $jwsBuilder
    ->create()
    ->withPayload(json_encode(array_merge($defaultPayload, [
        'more_data_here' => 'data'
    ])))
    ->addSignature($jwk, [
        'typ' => 'JWT',
        'alg' => 'HS256',
    ])
    ->build();

// Serialize and return the JWT token
return $jwsCompactSerializer->serialize($jws, 0);
```
```javascript [Javascript]
const jwt = require('jsonwebtoken');

// Define your payload and secret key
const payload = {
    iss: CLIENT_APPLICATION_URL,
    sub: COMMUNITY_HIVE_SITE_ID,
    iat: Math.floor(Date.now() / 1000), // Issued at time (current Unix timestamp)
    nbf: Math.floor(Date.now() / 1000), // Not before time (current Unix timestamp)
    exp: Math.floor(Date.now() / 1000) + 60, // Expiry time (current Unix timestamp + 60 seconds)
    aud: 'communityhive',
    // ... add any additional claims here
};

// Encode the token
const token = jwt.sign(payload, COMMUNITY_HIVE_SITE_KEY, { algorithm: 'HS256' });
console.log(token);
```
:::

### Decoding a JWT Token

When your client application receives a `POST` request from Community Hive, the JWT token will be present in the request body as plain text. This token is signed using the base 64 encoded [Community Hive Key](#key-terminology), provided during activation.

#### Examples

Here's how to decode a JWT token:

:::code-group
```php [PHP]
use Jose\Component\Core\AlgorithmManager;
use Jose\Component\Core\JWK;
use Jose\Component\Signature\Algorithm\HS256;
use Jose\Component\Signature\JWSVerifier;
use Jose\Component\Signature\Serializer\CompactSerializer;

$key = new JWK([
    'kty' => 'oct',
    'k' => base64_encode(COMMUNITY_HIVE_KEY),
]);

$verifier = new JWSVerifier(new AlgorithmManager([new HS256()]));
$serializer = new CompactSerializer();

$data = $serializer->unserialize($token);
if (! $verifier->verifyWithKey($data, $key, 0)) {
    return false;
}

return json_decode($data->getPayload() ?? [], true);
```
```javascript [Javascript]
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, COMMUNITY_HIVE_SITE_KEY);
  console.log(decoded);
} catch (error) {
  console.error('Error decoding JWT token:', error.message);
}
```
:::

## Handling Requests

The following outlines how to handle various types of requests with the Community Hive API.

### Requests from Client Application

All requests initiated by your client application should use the `PUT` method, and the request data should be placed in the JWT payload. The `Content-Type` header should be set to `text/plain`.

:::warning
The exception to this rule is when your client application initially calls the `/activate` endpoint to activate itself with Community Hive. In this case, the request data should be JSON encoded and placed in the request body with `Content-Type` set to `application/json`.
:::

### Requests from Community Hive

When receiving requests from Community Hive, your client application should listen for `POST` requests. You must also decode and validate the JWT token as described in the [Authentication](#authentication) section. The request payload will be located within the JWT token's payload. The `Content-Type` header will be `text/plain`.

Your client application should respond by providing the required JSON-encoded data in the response body, with the `Content-Type` set to `application/json`.

## API Endpoints

Below is an overview of the available API endpoints for the Community Hive integration.

**Community Hive Base API URL**: `https://www.communityhive.com/api/v1/`

### Endpoints for Client Application

The following endpoints are used by your client application. Request data should be placed in the JWT payload, and requests should be made using the `PUT` method.

### `PUT /activate`

**Activate**

This is the initial call to the Community Hive API, used to register the client application. It is the only endpoint that doesn't require a JWT token.

**Request**:
```json
{
  "site_name": "Friendly Name of Your Site",
  "site_url": "Root URL of Your Site",
  "site_api_url": "URL to Your API Endpoint for Community Hive",
  "site_key": "Generated Site Key",
  "site_email": "Email of Community Manager for Issues",
  "site_software": "invisioncommunity|xenforo|wordpress|squarespace",
  "hive_system_version": "Version of Hive Plugin (e.g., 1.0.0)"
}
```

**Response**:
```json
{
    "hive_key": "ywhanae098gh4039gh49gh0aerh",
    "hive_site_id": "34t89

jq09gh0439hg90h9eq"
}
```

:::tip
Both the `hive_key` and `hive_site_id` are crucial for authenticating Community Hive API calls and communicating with Community Hive. Store these keys securely and never share them. If lost, contact support for assistance.
:::

:::tip
During activation, Community Hive will call the `site_api_url` of your client application to verify accessibility. A failure to respond with a `200` status to a `POST` request at `site_api_url` will result in activation failure.
:::

### `PUT /subscribe`

**Subscribe**

This endpoint is used when a member wants to subscribe, usually after being informed that their email will be shared.

:::tip
Immediately after a successful `/activate` response, it's recommended to call this endpoint to subscribe the community manager to their community on Community Hive.
:::

**Request**:
```json
{
  "site_member_id": "Member ID on Your Site (integer) or 0 if guest",
  "group_hash": "Member's Group Permission Hash or 'guest' if guest",
  "member_email": "Member's Email",
  "hive_site_id": "Stored Hive Site ID",
  "hive_system_version": "Version of Hive Plugin (e.g., 1.0.0)"
}
```

**Response**:
```json
{
  "redirect_url": "https:\/\/communityhive.com\/subscribe\/TOKEN"
}
```

After receiving this response, your client application should redirect the user to the provided `redirect_url`.

### `PUT /groupupdate`

**Member Group Change Notification**

Use this endpoint to notify Community Hive when a member's permissions within your client application change. This helps ensure that members see content appropriate for their permissions.

Additionally, if a member is deleted or banned, the `group_hash` should revert to `guest`.

**Request**:
```json
{
  "site_member_id": "Member ID on Your Site (integer) or 0 if guest",
  "group_hash": "Member's Group Permission Hash or 'guest' if guest",
  "hive_site_id": "Stored Hive Site ID",
  "hive_system_version": "Version of Hive Plugin (e.g., 1.0.0)",
  "new_site_member_id": "New Member ID if user was merged with another account"
}
```

### Endpoints for Community Hive

The following endpoints are called by Community Hive to your client application. The request data will be placed in the JWT payload, and all requests are made using the `POST` method.

The endpoint that Community Hive will call is the `site_api_url` provided during activation.

Each request payload will include a `request_type` key, which your client application should use to determine the appropriate response.

When responding to Community Hive API calls, the data should be JSON encoded and placed in the response body. Set the `Content-Type` header to `application/json`.

### Request Type: `sync`

**Community Hive Sync Call**

Community Hive performs this sync call once a week to ensure synchronization in case of communication failures or bugs.

**Request**:
```json
{
  "request_type": "sync",
  "data": {
    "42": "4t3gqegragaregaga",
    "463634": "u7jtyhsrraghsfhfsd",
    "334649": "4t3gqegragaregaga",
    "13532": "4t3gqegragaregaga",
    "54364": "kfy8it8e7687669i"
  }
}
```

Your client application should respond with any `site_member_id` where the `group_hash` was incorrect or the member no longer exists in your client application. Community Hive will update its database based on your response. Correct `site_member_id` entries should be excluded from the response.

**Response**:
```json
{
  "42": false,
  "463634": "4t3gqegragaregaga"
}
```

In this example response, `site_member_id` **42** no longer exists (member was deleted), and `site_member_id` **463634** requires a `group_hash` update.

### Request Type: `content`

**Community Hive Content Call**

Community Hive sends a `content` request to fetch content that should be shown to members. The payload includes a `group_hash` that your client application should use to determine what content to display.

**Request**:
```json
{
  "hive_key": "5y094qj4309gh049egh0E9H9RHG",
  "request_type": "content",
  "group_hash": "4t3gqegragaregaga"
}
```

Your client application should respond with a JSON object containing up to 10 items based on the permissions associated with the included `group_hash`.

Community Hive may also send a request with `group_hash` set to `guest`, which is intended to fetch publicly viewable content.

If your community cannot validate the `hive_key`, your client application should return an error.

**Response**:
```json
{
  "results": [
    {
      "title": "Content Title",
      "content": "Content",
      "date": "Creation Date (Unix timestamp)",
      "author": "Author's Name",
      "key1": "Content Item ID",
      "key2": "Comment/Reply ID (if applicable)",
      "replies": "Comment Count (if applicable)",
      "reactions": "Reaction Count (if applicable)",
      "image": {
        "name": "Filename (if applicable)",
        "file": "Base64 encoded file content (if applicable)"
      }
    }   
  ]
}
```

### Other Requests

Below are additional requests your client application should respond to.

#### Link Click

When a user clicks a content item link on Community Hive, they are redirected to `https://site_api_url?click=hash`.

The hash is a base64-decoded string that represents the clicked item, for example, `key1=12345` once decoded. Extract the content item ID from the hash. Your client application should then redirect the user to the appropriate content item.

Example:
:::code-group
```php [Wordpress]
if ($item = request()->input('click')) {
    $decoded = base64_decode($item);
    parse_str($decoded, $id);

    if (isset($id['key1']) && $url = get_permalink((int) $id['key1'])) {
        return redirect()->to($url);
    }

    return app()->make(ErrorResponse::class, [
        'message' => 'We are unable to redirect you to the post.',
    ]);
}
```
:::

#### Follow Click

When a user clicks "Follow" on Community Hive, they are redirected to `https://site_api_url?follow=1`. Your client application should redirect the user to a publicly viewable user interface where they can choose to follow the community.