importScripts("./lib/browser-polyfill.js");

function applyPrevSetting() {
    // v1.2.1までの設定引き継ぎ
    browser.storage.local.get("numel").then((result) => {
        const numel = result["numel"];

        if (numel) {
            let prevSetting = {
                sortRelevance: true,
                sortPopularity: true,
                sortSales: true,
                sortReview: true,
                sortPrice: true,
                sortInversePrice: true,
                sortReleaseDate: true,
                filterAmazonOnly: true,
                filterPrice: true,
                filterPercentOff: true
            };

            // 各キーごとに古い設定の値を代入
            let cnt = 0;
            for (const key of Object.keys(prevSetting)) {
                const eleKey = "ele" + cnt;

                browser.storage.local.get(eleKey).then((result) => {
                    prevSetting[key] = result[eleKey];
                });
                browser.storage.local.remove(eleKey);

                cnt++;
            }

            browser.storage.local.get("isHideElem").then((result) => {
                let newSetting = result["isHideElem"];
                
                // 現在のデフォルト設定に古い設定を上書き・マージ
                Object.assign(newSetting, prevSetting);
                browser.storage.local.set({"isHideElem": newSetting});
            });

            browser.storage.local.remove("numel");
        }
    });
}

// 要素非表示設定保存用
const isHideElem = {
    "filterAmazonOnly": true,
    "filterPercentOff": true,
    "filterPrice": true,
    "sortInversePrice": true,
    "sortPopularity": true,
    "sortPrice": true,
    "sortReleaseDate": true,
    "sortRelevance": true,
    "sortReview": true,
    "sortSales": true
}
browser.storage.local.set({"isHideElem": isHideElem}).then(applyPrevSetting);
