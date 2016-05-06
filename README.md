# ranking-server
ランキング記録サーバー

[![Build Status](https://travis-ci.org/utgw/ranking-server.svg?branch=master)](https://travis-ci.org/utgw/ranking-server)

## Usage

```sh
$ npm install

$ node init-db.js

$ npm start
```

## API document

GET / を除く全ての API において、処理が成功した場合は `ok` が `true` となります。

### GET /
`<h1>It works!</h1>` という HTML を返します。

#### parameters
なし

### GET /:game_name
`game_name` という名前で登録されたゲームのハイスコアを取得して返します。

#### parameters

|name |required|description|
|:----|-------:|:----------|
|token|       o|ゲームのスコア登録やデータ参照に必要なトークンです。|

#### example result

```js
// GET /hoge?token=fuga

{"ok":true,"name":"hoge","ranking":[{"name":"utgwkk","point":200},{"name":"utgwkk","point":101},{"name":"utgwkk","point":55}]}
```

### POST /register/:game_name
`game_name` という名前で新しいゲームを登録します。登録に成功した場合は、 `token` に今後使用するトークンがセットされます。

#### parameters
なし

#### example result

```js
// POST /register/hoge

{"ok":true,"name":"hoge","token":"hogefugapiooooooo0123456789"}
```

### POST /:game_name
`game_name` という名前で登録されたゲームのスコアを追加します。

#### parameters

|name |required|description|
|:----|-------:|:----------|
|token|       o|ゲームのスコア登録やデータ参照に必要なトークンです。|
|point|       o|ゲームのスコアです。|
|player_name |       o|ゲームのプレイヤーの名前です。|

#### example result

```js
// POST /hoge?token=fuga&point=101&player_name=utgwkk

{"ok":true,"player_name":"utgwkk","game_name":"hoge","point":101}
```
