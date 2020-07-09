import json
import secrets
import requests


def post(url, data=None):
    data = json.dumps(data, ensure_ascii=False)
    data = data.encode(encoding="utf-8")
    r = requests.post(url=url, data=data)
    r = json.loads(r.text)
    return r


sender = secrets.token_urlsafe(16)
url = "http://localhost:5005/webhooks/rest/webhook"
while True:
    message = input("Your input ->  ")
    data = {
        "sender": sender,
        "message": message
    }
    result = post(url, data)
    for i in result:
        print(i)
