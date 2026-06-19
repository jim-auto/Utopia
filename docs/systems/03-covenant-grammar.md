# SYS-03: コヴナント・グラマー（Covenant Grammar）

[← 概要](00-overview.md)

## 概要

社会のルールを **文章の論理** として組み、実際の地区で試行し、数十年後の結果を見届ける制度設計システム。

## 設計画面で定義する項目

| 項目 | 問い |
|------|------|
| 参加資格 | 誰が参加できるか |
| 同意更新 | 同意をどの頻度で更新するか |
| 退出 | 即時か、猶予期間があるか |
| 身体・記憶 | どの変更を許すか |
| 危機介入 | 危険が生じたとき誰が介入できるか |
| 継承 | 子どもや新規人格に何を継承するか |
| 例外判断 | 例外を誰が判断するか |
| 失効 | 制度はいつ失効するか |

## ライフサイクル

```
提案 → 設計（グラマー） → 同意取得 → 試行開始
  → [5年 | 20年 | 50年] 経過
  → 再訪（四期モデル）
  → 改訂 | 失効 | 継承
```

## 試行中のNPC行動

人々はルールをそのまま実行するだけでなく:

- **解釈** する
- **抜け道** を見つける
- **儀式化** する
- **拒否** する
- **次世代へ伝える**

→ シミュレーションだけで終わらない。

## データモデル（案）

```yaml
Covenant:
  id: CovenantId
  proposer: EntityId
  clauses:
    - type: membership | consent | exit | body | intervention | inheritance | exception | expiry
      rule: StructuredRule    # グラマーから生成
      natural_language: string
  trial:
    location: RegionId
    duration: years
    start_period: PeriodId
  consent:
    required_parties: EntityId[]
    objections: ObjectionRecord[]
  simulation_state: TrialState  # 世代・解釈・摩擦
```

## StructuredRule（グラマー内部表現）

```yaml
StructuredRule:
  condition: Expression
  effect: Effect
  scope: EntityGroup
  override: OverrideClause?
  expiry: TimeExpression?
```

## 四期再訪モデル

| 期 | シミュレーション焦点 |
|----|---------------------|
| 設立前 | 提案・反対・同意交渉 |
| 初期 | 設計意図の実現、理想的状态 |
| 中期 | 解釈の分裂、抜け道、摩擦 |
| 後期 | 次世代の再解釈、継承・変容 |

## コンテンツ規模

- **18本の長編コヴナント事件**（25〜30時間想定）
- 各事件は独立した価値の衝突を持つ

## 他システムとの連動

| 連動先 | 内容 |
|--------|------|
| 理由の地図 | 同意・異議の記録 |
| 意味生態系 | 共同体の六軸の形 |
| 誓約 | 試行期間中の退出禁止など |
| プレゼンス | 立会・再訪のタイミング |

## 設計上の禁止

- 総合スコアによる「最適制度」の提示
- プレイヤーが社会全体を完全解決（創作規則 #9）
