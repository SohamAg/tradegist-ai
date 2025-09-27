import pandas as pd
from features import compute_features
from rules import run_all_rules

tr = pd.read_csv("data/trades_roundtrips.csv")
feat = compute_features(tr)
tags = run_all_rules(feat)

feat.to_csv("data/trade_features.csv", index=False)
# tags.to_csv("data/tags.csv", index=False)

# print("Trades:", len(tr), "Features:", feat.shape, "Tags:", len(tags))
# print(tags.head())
