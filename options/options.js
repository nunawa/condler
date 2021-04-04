// options_uiのconsole.logは about:debugging->調査->コンソール に表示される

let checkbox = document.getElementsByName("checkbox");

// これはダメ 0になる
//console.log("checkbox.length: " + checkbox.length);

window.onload = function() {
    console.log("checkbox.length: " + checkbox.length);
    browser.storage.local.get("numel").then(function(result) {
        if (checkbox.length != result.numel) {
            console.log("error: mismatch between checkbox.length and numel");
        }
    });

    for (let i = 0; i < checkbox.length; i++) {
        const key = "ele" + i;
        browser.storage.local.get([key]).then(function(result) {
            if (result[key] === undefined) {
                console.log("error: " + key + "is undefined");
            } else {
                checkbox[i].checked = result[key];
            }
        });

        checkbox[i].addEventListener("click", function() {
            console.log("checkbox[" + i +  "], " + this.checked);
            // []で囲うことで変数を展開できる
            browser.storage.local.set({[key]: this.checked});
        });
    }
}