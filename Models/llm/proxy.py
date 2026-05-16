import random

proxy_usa_short = [

]

proxy_usa = [
    "http://pAUMt6:KXeVen@191.102.156.137:9143",
    "http://pAUMt6:KXeVen@95.164.201.204:9895",
    "http://pAUMt6:KXeVen@138.59.207.69:9944",
    "http://pAUMt6:KXeVen@138.59.206.14:9314",
    "http://pAUMt6:KXeVen@190.111.161.51:9211",
] + proxy_usa_short

proxies = [] + proxy_usa

proxy_russia = [
"http://kDpC5q:eYwVYu@45.11.124.14:9827",
"http://kDpC5q:eYwVYu@45.11.126.194:9233",
"http://kDpC5q:eYwVYu@45.11.125.226:9210",
"http://kDpC5q:eYwVYu@45.11.124.132:9214",
"http://kDpC5q:eYwVYu@45.11.127.245:9458",
"http://kDpC5q:eYwVYu@45.11.124.151:9787",
"http://kDpC5q:eYwVYu@45.11.126.60:9132",
"http://kDpC5q:eYwVYu@45.11.125.38:9548",
"http://kDpC5q:eYwVYu@45.11.126.130:9872",
"http://kDpC5q:eYwVYu@45.11.127.53:9585",
"http://kDpC5q:eYwVYu@45.11.127.181:9903",
"http://kDpC5q:eYwVYu@45.11.126.204:9373",
"http://kDpC5q:eYwVYu@45.11.126.72:9514",
"http://kDpC5q:eYwVYu@45.11.127.168:9344",
"http://kDpC5q:eYwVYu@45.11.126.116:9603",
"http://kDpC5q:eYwVYu@45.11.126.228:9827",
"http://kDpC5q:eYwVYu@45.11.126.61:9723",
"http://kDpC5q:eYwVYu@45.11.125.208:9636",
"http://kDpC5q:eYwVYu@45.11.125.204:9337",
"http://kDpC5q:eYwVYu@45.11.124.149:9737",
"http://kDpC5q:eYwVYu@45.11.125.158:9320",
"http://kDpC5q:eYwVYu@45.11.125.166:9727",
"http://kDpC5q:eYwVYu@45.11.126.109:9991",
"http://kDpC5q:eYwVYu@45.11.127.65:9099",
"http://kDpC5q:eYwVYu@45.11.126.219:9688",
"http://kDpC5q:eYwVYu@45.11.124.194:9389",
"http://kDpC5q:eYwVYu@45.11.127.125:9659",
"http://kDpC5q:eYwVYu@45.11.125.251:9062",
"http://kDpC5q:eYwVYu@45.11.124.217:9505",
"http://kDpC5q:eYwVYu@45.11.126.6:9819",
"http://kDpC5q:eYwVYu@45.11.124.100:9575",
"http://kDpC5q:eYwVYu@45.11.127.110:9910",
"http://kDpC5q:eYwVYu@45.11.127.60:9035",
"http://kDpC5q:eYwVYu@45.11.125.202:9876",
"http://kDpC5q:eYwVYu@45.11.127.232:9159",
"http://kDpC5q:eYwVYu@45.11.124.253:9667",
"http://kDpC5q:eYwVYu@45.11.124.201:9934",
"http://kDpC5q:eYwVYu@45.11.124.200:9024",
"http://kDpC5q:eYwVYu@45.11.125.184:9346",
"http://kDpC5q:eYwVYu@45.11.127.98:9234",
"http://kDpC5q:eYwVYu@45.11.124.128:9116",
"http://kDpC5q:eYwVYu@45.11.124.167:9869",
"http://kDpC5q:eYwVYu@45.11.126.56:9305",
"http://kDpC5q:eYwVYu@45.11.125.155:9304",
"http://kDpC5q:eYwVYu@45.11.127.213:9622",
"http://kDpC5q:eYwVYu@45.11.125.210:9395",
"http://kDpC5q:eYwVYu@45.11.125.183:9500",
"http://kDpC5q:eYwVYu@45.11.127.225:9261",
"http://kDpC5q:eYwVYu@45.11.125.212:9830",
"http://kDpC5q:eYwVYu@45.11.127.22:9362",
]

all_proxy = proxy_russia + proxies


def get_next_proxy():
    return random.choice(proxies)


def get_next_proxy_usa():
    return random.choice(proxy_usa)


def get_next_proxy_all():
    return random.choice(all_proxy)
