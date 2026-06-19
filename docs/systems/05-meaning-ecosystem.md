# SYS-05: 意味生態系（Meaning Ecosystem）

[← 概要](00-overview.md)

## 概要

社会に **単一の幸福度** を設定しない。各共同体は六つの「形」を持ち、**合算しない**。

## 六つの形

| 軸 | 内容 | 例（地域） |
|----|------|-----------|
| **自律** | 自分の生を自分で選べる | コモン・ガーデン |
| **熟達** | 時間をかけて何かを身につける | アトリエ |
| **関係** | 特定の他者と結びつく | コーラス |
| **継続** | 過去と未来の物語を持つ | パリンプセスト |
| **生成** | 自分より後に残る何かへ関与する | ジェネシス・フォージ |
| **驚異** | 完全には制御できないものに出会う | アビス |

## 非加算の原則

自律と共同性、継続と刷新、安全と冒険は **同時に最大化できない**。

→ 合計点・レーダーチャート的な「総合評価」UIは **作らない**。

## 共同体プロファイル（案）

```yaml
Community:
  id: CommunityId
  name: string
  region: RegionId
  meaning_profile:
    # 各軸は「強調度」ではなく「生の様式の記述」
    autonomy: LifestyleDescriptor
    mastery: LifestyleDescriptor
    relation: LifestyleDescriptor
    continuity: LifestyleDescriptor
    generation: LifestyleDescriptor
    wonder: LifestyleDescriptor
  # 数値スコアは持たない。代わりに:
  exemplars: NPCId[]          # この共同体の生を体現する人物
  tensions: Tension[]           # 軸間の内在的緊張
```

## 表示方法

| 方法 | 用途 |
|------|------|
| NPCの人生叙事 | プレイヤーへの primary フィードバック |
| 共同体の儀式・建築・音楽 |  embodied な価値の可視化 |
| 制度試行の結果物語 | コヴナント再訪時 |

## 他システムとの連動

| 連動先 | 内容 |
|--------|------|
| コヴナント・グラマー | 制度が共同体の形を変容させる |
| 身体的ゲームプレイ | 各軸に対応する実践 |
| エンディング | 六エンディングは異なる軸の優先を反映 |

## 設計上の禁止

- 「幸福度92」のような単一メーター
- 共同体のランキング・順位付け
