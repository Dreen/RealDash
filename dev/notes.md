jq
----------
`cat samples/mtgoxGBPticker.json | jq '[.vol, .sell, .avg, .vwap | .value | tonumber | select(. < 100)]'`
