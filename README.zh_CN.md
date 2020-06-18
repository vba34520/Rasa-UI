# Rasa-UI
A simple Rasa UI

![a.gif](https://i.loli.net/2020/06/18/KEG1atwnScQFIgV.gif)

# README.md
[English](README.md)

# 使用方法
1. 初始化Rasa
```bash
rasa init
```
2. 启动Rasa API（允许跨域）
```bash
rasa run --enable-api --cors "*"
```
3. 直接打开页面`index.html`

# 备注
domain.yml中的utter_greet可改成如下实现选择
```yaml
responses:
  utter_greet:
  - text: Hey! How are you?
    buttons:
      - payload: '/mood_great'
        title: 'great'
      - payload: '/mood_unhappy'
        title: 'sad'
```