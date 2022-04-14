// options_uiのconsole.logは about:debugging->調査->コンソール に表示される

$(window).on("load", () => {
    const checkbox = $("input[name='checkbox']");

    browser.storage.local.get("isHideElem").then((result) => {
        let isHideElem = result["isHideElem"];

        checkbox.each((i, elem) => {
            const key = $(elem).attr("id");
            $(elem).prop("checked", isHideElem[key]);

            $(elem).on("click", () => {
                isHideElem[key] = $(elem).prop("checked");
                browser.storage.local.set({"isHideElem": isHideElem});
            });
        });
    });
});