import json
import secrets
import requests


def get(url, params=None):
    r = requests.get(url=url, params=params)
    r = json.loads(r.text)
    return r


def post(url, data=None):
    data = json.dumps(data, ensure_ascii=False)
    data = data.encode(encoding="utf-8")
    r = requests.post(url=url, data=data)
    r = json.loads(r.text)
    return r


if __name__ == "__main__":
    conversation_id = secrets.token_urlsafe(16)  # 随机生成会话id
    messages_url = "http://localhost:5005/conversations/{}/messages".format(conversation_id)  # 发送消息
    predict_url = "http://localhost:5005/conversations/{}/predict".format(conversation_id)  # 预测下一步动作
    execute_url = "http://localhost:5005/conversations/{}/execute".format(conversation_id)  # 执行动作
    action = "action_listen"  # 动作初始化为等待输入
    while True:
        if action in ["action_listen"]:
            # 等待输入
            text = input("Your input ->  ")
            post(messages_url, data={"text": text, "sender": "user"})  # 发送消息

        response = post(predict_url)  # 预测下一步动作
        action = response["scores"][0]["action"]  # 取出置信度最高的下一步动作

        response = post(execute_url, data={"name": action})  # 执行动作
        messages = response["messages"]  # 取出对话信息
        if messages:
            print(messages)
