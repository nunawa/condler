// 要素非表示設定保存用
// アドオンの要素数
$.get(browser.runtime.getURL("search-options-dom.html"), function(data) {
    let i = 0;
    while (true) {
        if (!$(data).find("[id='ele"+i+"']").length && !$(data).siblings("[id='ele"+i+"']").length) {
            break;
        }
        i++;
    }
    //console.log("numel: " + i);
    browser.storage.local.set({numel: i});
});

// 表示非表示設定
browser.storage.local.get("ele0").then(function(result) {
    if (!Object.keys(result).length) {
        //console.log("result is empty");

        let data = {};
        browser.storage.local.get("numel").then(function(result) {
            for (let i = 0; i < result.numel; i++) {
                const key = "ele" + i;
                data[key] = true;
            }
            browser.storage.local.set(data);
        });
    }
});