const proxies = [
    "http://pqvMwc:53QHQr@138.59.207.5:9506",
    "http://pqvMwc:53QHQr@138.59.207.3:9075",
    "http://pqvMwc:53QHQr@138.59.206.253:9252",
    "http://pqvMwc:53QHQr@138.59.206.251:9589",
    "http://pqvMwc:53QHQr@186.179.61.116:9379",
    "http://pqvMwc:53QHQr@186.179.63.23:9374",
    "http://pqvMwc:53QHQr@186.179.61.42:9414",
    "http://pqvMwc:53QHQr@95.164.108.178:9075",
    "http://pqvMwc:53QHQr@95.164.110.111:9520",
    "http://pqvMwc:53QHQr@95.164.128.68:9379",
    "http://pqvMwc:53QHQr@95.164.111.252:9663",
    "http://pqvMwc:53QHQr@95.164.128.82:9553",
    "http://pqvMwc:53QHQr@95.164.111.128:9764",
    "http://pqvMwc:53QHQr@181.177.86.38:9114",
    "http://pqvMwc:53QHQr@181.177.84.62:9383",
    "http://pqvMwc:53QHQr@181.177.85.116:9636",
    "http://pqvMwc:53QHQr@181.177.84.248:9704",
    "http://pqvMwc:53QHQr@181.177.86.2:9981",
    "http://pqvMwc:53QHQr@181.177.85.195:9547",
    "http://pqvMwc:53QHQr@181.177.84.195:9751",
]


export function getRandomProxy() {
    const randomIndex = Math.floor(Math.random() * proxies.length);
    return proxies[randomIndex];
}
