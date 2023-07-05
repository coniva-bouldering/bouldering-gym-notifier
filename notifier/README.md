# bouldering-gym-notifier

ボルダリングジムの更新を知らせるボット

## ディレクトリ構成

モノレポで行う

```bash

bouldering-gym-notifier
├── notifier Cronでスクレイピングと通知を定期実行
└── line-webhook HonoでLINEからのWebhookを受け取り、送信先グループIDなどを受け取る
```

## シーケンス

### スクレイピング

```mermaid
sequenceDiagram
    autonumber
    participant cron as Cron Triggers
    participant worker as Cloudflare Workers
    participant web as ボルダリングジムのWebサイト
    participant db as Cloudflare D1

    cron->>cron: 毎朝9時にWorkerを起動するようにする
    cron->>worker: Worker起動リクエストを送る
    worker->>web: お知らせのURLを3件取得する
    web-->>worker: URL
    worker->>db: URLが登録済であるか検索する
    db-->>worker: 検索結果
    opt 登録済み
        worker-->worker: 何もせずWorkerを終了
    end
    worker->>db: URLをInsert
    db-->>worker: 成功
```

### お知らせを LINE グループに投稿

```mermaid
sequenceDiagram
    autonumber
    participant cron as Cron Triggers
    participant worker as Cloudflare Workers
    participant db as Cloudflare D1
    participant line as LINE API

    cron->>cron: 毎週木曜日にWorkerを起動するようにする
    cron->>worker: Worker起動リクエストを送る
    worker->>db: 未投稿のURLが存在するか検索する
    worker->db: 送信先LINEグループIDを取得
    db-->>worker: 検索結果
    opt 未投稿もしくは送信先なし
        worker-->worker: 何もせずWorkerを終了
    end
    worker->>line: LINEグループIDを使いLINEbotにURLを投稿させる
    line-->>worker: 投稿成功
    worker->>db: postedをtrueに変更
    db-->>worker: 成功
```

## インフラ構成

```mermaid
flowchart TD
    subgraph Cloudflare
        cron[Cron Triggers] --> worker[Cloudflare Workers]
        worker --> db[(Cloudflare D1)]
    end
    subgraph LINE
        worker --> line[LINEbot]
        line --> u[我々のLINEグループ]
    end
```
