// 要素非表示設定保存用
// 要素数取得
$.get(browser.runtime.getURL("search-options-dom.html"), function(data) {
    let numel = 0;
    while (true) {
        if (!$(data).find("[id='ele"+numel+"']").length && !$(data).siblings("[id='ele"+numel+"']").length) {
            break;
        }
        numel++;
    }
    console.log("numel: " + numel);
    browser.storage.local.get("numel").then(function(result) {
        // 保存されている要素数と今取得した要素数が違う場合
        if (result.numel != numel) {
            // result.numelが空の時もここの処理入る
            console.log("numel is empty or mismatch prev numel");

            // 表示非表示データをリセット
            let data = {};
            for (let i = 0; i < numel; i++) {
                const key = "ele" + i;
                data[key] = true;
            }
            browser.storage.local.set(data);
        }
    });
    browser.storage.local.set({numel: numel});
});