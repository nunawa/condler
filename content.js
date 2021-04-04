const info = "[condler] info: ";
const error = "[condler] error: ";



// ドロップダウン並べ替え非表示
$("span.rush-component div.sg-col-6-of-20.sg-col.sg-col-6-of-16.sg-col-6-of-12 span.a-dropdown-container").hide();

// アドオン用DOM要素作成
let div = document.createElement("div");
div.id = "condler";
div.className = "a-section a-spacing-none";

// 検索結果ページかどうか
if (document.getElementById("s-refinements")) {
    console.log(info + "s-refinements exists");
    $("div#s-refinements>div>div:first").before(div);
    $("div#condler").load(browser.runtime.getURL("search-options-dom.html"), loadCallback());
} else {
    console.log(info + "s-refinements does not exists");
}



// firefoxかchromeか判別してから実行
// 読み込みタイミングに違いがあるため
function loadCallback() {
    if (chrome.app) {
        console.log(info + "current browser: chrome");

        $(window).on("load", function() {
            main();
        });
    } else {
        console.log(info + "current browser: firefox");

        $(function() {
            main();
        });
    }
}



function main() {
    // アドオン非表示設定の適用
    browser.storage.local.get("numel").then(function(result) {
        for (let i = 0; i < result.numel; i++) {
            const key = "ele" + i;

            browser.storage.local.get([key]).then(function(result) {
                if (result[key] == false) {
                    console.log(info + key + " is false");
                    // + 変数名 でセレクタに変数使える
                    $("div#condler #" + key + "*").hide();
                }
            });
        }
    });



    // url解析
    const radioButton = $("div#condler input[type='radio'][name='radioButton']");
    if (radioButton.length) {
        console.log(info + "get radioButton: success");
    } else {
        console.log(error + "get radioButton: failure");
    }
    urlParse(location.href, radioButton);



    // 並べ替えの値復元、クリック時のイベントハンドラ
    radioButton.each(function(index) {
        if (sessionStorage.getItem("button" + index) == "true") {
            $(this).prop("checked", true);
        }

        $(this).on("click", function() {
            for (let i = 0; i < radioButton.length; i++) {
                sessionStorage.setItem("button" + i, "false");
            }
            sessionStorage.setItem("button" + index, "true");
            window.location.href = location.href + $(this).val();
        });
    });



    // Amazon公式出品の値復元
    const checkbox = $("div#condler input[type='checkbox'][name='checkbox']");
    if (sessionStorage.getItem("checkbox") == "true") {
        checkbox.prop("checked", true);
    }

    // Amazon公式出品クリック時のイベントハンドラ
    const checkboxPrevState = checkbox.prop("checked");
    checkbox.on("click", function() {
        if (checkboxPrevState) {
            sessionStorage.setItem("checkbox", "false");
            console.log(info + "checkbox: true->false");

            // 出品者欄にAmazon.co.jpが存在するかどうか
            if (document.getElementById("p_6/AN1VRQENFRJN5")) {   
                console.log(info + "amazonCheckbox is exist");
                
                // Amazon.co.jpチェック解除のリンクへ
                window.location.href = $("div#s-refinements li#p_6\\/AN1VRQENFRJN5 a").attr("href");
            } else {
                // URLから関連要素削除したリンクへ
                window.location.href = location.href.replace($(this).val(), "").replace("p_6%3AAN1VRQENFRJN5", "");
            }
        } else {
            sessionStorage.setItem("checkbox", "true");
            console.log(info + "checkbox: false->true");

            window.location.href = location.href + $(this).val();
        }
    });



    // 値段絞り込み値sessionStorageから復元
    const lowPrice = $("div#condler li#priceInput>input#low-price");
    const highPrice = $("div#condler li#priceInput>input#high-price");
    if (sessionStorage.getItem("price0") != null) {
        lowPrice.val(sessionStorage.getItem("price0"));
    }
    if (sessionStorage.getItem("price1") != null) {
        highPrice.val(sessionStorage.getItem("price1"));
    }

    // 値引き率絞り込み値sessionStorageから復元
    const lowPercent = $("div#condler li#percentOffInput>input#low-percent");
    const highPercent = $("div#condler li#percentOffInput>input#high-percent");
    if (sessionStorage.getItem("percent0") != null) {
        lowPercent.val(sessionStorage.getItem("percent0"));
    }
    if (sessionStorage.getItem("percent1") != null) {
        highPercent.val(sessionStorage.getItem("percent1"));
    }



    // 値段絞り込みのGoボタンクリック時のイベントハンドラ
    $("div#condler li#priceInput input.a-button-input").on("click", function() {
        const lowPriceVal = lowPrice.val();
        console.log(info + "lowPrice: " + lowPriceVal);
        
        const highPriceVal = highPrice.val();
        console.log(info + "highPrice: " + highPriceVal);

        // abcが混ざってる -> 何もしない
        // 空 -> 削除
        // 0 -> そのまま普通に処理
        
        // p_36%3A[PRICE]00-[PRICE]00,

        const replacedUrl = location.href.replace(/p_36%3A\d+00-\d+00/g, "").replace(/p_36%3A-?\d+00-?/g, "");
        numberParse(0, lowPriceVal, highPriceVal, replacedUrl);
    });

    // 値引き率絞り込みのGoボタンクリック時のイベントハンドラ
    $("div#condler li#percentOffInput input.a-button-input").on("click", function() {
        const lowPercentVal = lowPercent.val();
        console.log(info + "lowPercent: " + lowPercentVal);
        
        const highPercentVal = highPercent.val();
        console.log(info + "highPercent: " + highPercentVal);

        // p_8%3A[PERCENT]-[PERCENT]

        const replacedUrl = location.href.replace(/p_8%3A\d+-\d+/g, "").replace(/p_8%3A-?\d+-?/g, "");
        numberParse(1, lowPercentVal, highPercentVal, replacedUrl);
    });



    // カテゴリー選択時「すべてのカテゴリー」を押したときのイベントハンドラ
    $("div#departments li#n>span.a-list-item").on("click", function(e) {
        e.preventDefault();

        console.log(info + "all category clicked");

        sessionStorageClear(radioButton.length);

        // チェックボックス
        let linkUrl = $(this).closest("a").attr("href");
        if (linkUrl === undefined) {
            // その他普通のテキストなど
            linkUrl = $(this).children("a").attr("href");
        }
        pageTransition(linkUrl);
    });

    // 検索画面の左側の条件欄リンククリック時のイベントハンドラ
    // 「すべてのカテゴリー」とカテゴリー展開テキストは除外
    $("div#s-refinements span.a-list-item").not("div#departments li#n>span.a-list-item, div#s-refinements li.a-spacing-micro>span.a-list-item:has('a.a-expander-header.a-declarative.a-expander-extend-header.s-expander-text')").on("click", function(e) {
        // デフォルトのの動作をキャンセル
        e.preventDefault();

        // 他のプログラムのイベントリスナーを停止する
        // たぶんチェックボックスだけイベントリスナーが設置してある
        e.stopImmediatePropagation();

        console.log(info + "s-refinements clicked");

        // チェックボックス
        let linkUrl = $(this).closest("a").attr("href");
        if (linkUrl === undefined) {
            // その他普通のテキストなど
            linkUrl = $(this).children("a").attr("href");
        }

        pageTransition(linkUrl);
    });

    // aタグと検索ボタンクリック時のイベントハンドラ
    // 別タブで開くやつと左側の条件欄は除外
    $("a[target != '_blank'], input#nav-search-submit-button").not("div#s-refinements span.a-list-item *").on("click", function() {
        console.log(info + "other a tags or search button clicked");
        
        sessionStorageClear(radioButton.length);

        // 左絞り込み押して遷移 -> ソートは保持
        // 上の検索ボタン押して遷移 -> 保持しない
        // 別のページ行って検索 -> 保持しない
    });
}



// URLパースして値をsessionStorageCompareに渡す
function urlParse(url, radioButton) {
    const params = new URLSearchParams(url);

    if (params.has("s")) {
        const s = params.get("s");

        radioButton.each(function(index) {
            const elementValue = $(this).val().replace("&sort=", "");
            if (s == elementValue) {
                sessionStorageCompare("button" + index, "true", radioButton.length);
            }
        });
    } else {
        for (let i = 0; i < radioButton.length; i++) {
            sessionStorage.removeItem("button" + i);
        }
    }

    if (url.match(/p_6%3AAN1VRQENFRJN5/)) {
        sessionStorageCompare("checkbox", "true");
        // sessionStorage.setでもよい？
    } else {
        sessionStorage.removeItem("checkbox");
    }

    let price = url.match(/p_36%3A\d+00-\d+00/g);
    if (price != null) {
        price = price[0].replace("p_36%3A", "").split("-");
        sessionStorageCompare("price0", price[0].substring(0, price[0].length-2));
        sessionStorageCompare("price1", price[1].substring(0, price[1].length-2));
    } else {
        price = url.match(/p_36%3A\d+00-/g);
        if (price != null) {
            price = price[0].replace("p_36%3A", "").replace("00-", "");
            sessionStorageCompare("price0", price);
            sessionStorageCompare("price1", "");
        } else {
            price = url.match(/p_36%3A-\d+00/g);
            if (price != null) {
                price = price[0].replace("p_36%3A-", "");
                sessionStorageCompare("price0", "");
                sessionStorageCompare("price1", price.substring(0, price.length-2));
            } else {
                sessionStorage.removeItem("price0");
                sessionStorage.removeItem("price1");
            }
        }
    }

    let percent = url.match(/p_8%3A\d+-\d+/g);
    if (percent != null) {
        percent = percent[0].replace("p_8%3A", "").split("-");
        sessionStorageCompare("percent0", percent[0]);
        sessionStorageCompare("percent1", percent[1]);
    } else {
        percent = url.match(/p_8%3A\d+-/g);
        if (percent != null) {
            percent = percent[0].replace("p_8%3A", "").replace("-", "");
            sessionStorageCompare("percent0", percent);
            sessionStorageCompare("percent1", "");
        } else {
            percent = url.match(/p_8%3A-\d+/g);
            if (percent != null) {
                percent = percent[0].replace("p_8%3A", "").replace("-", "");
                sessionStorageCompare("percent0", "");
                sessionStorageCompare("percent1", percent);
            } else {
                sessionStorage.removeItem("percent0");
                sessionStorage.removeItem("percent1");
            }
        }
    }
}



// sessionStorageからget -> 値が不一致だったらURLのを設定
function sessionStorageCompare(key, value, length) {
    if (value != sessionStorage.getItem(key)) {
        console.log(info + "change item: " + key + ", " + value);
        if (key.includes("button")) {
            for (let i = 0; i < length; i++) {
                sessionStorage.setItem("button" + i, "false");
            }
        }
        sessionStorage.setItem(key, value);
    }
}



// 入力値分析、ページ遷移
// urlの部分 &high-price= と &pct-off= 分ける
function numberParse(type, low, high, replacedUrl) {
    const pattern = /\D/g;
    let param;
    let highParam;
    let lowParam;
    let key0;
    let key1;
    
    if (type == 0) {
        param = `&low-price=${low}&high-price=${high}`;
        highParam = `&high-price=${high}`;
        lowParam = `&low-price=${low}`;
        key0 = "price0";
        key1 = "price1";
    } else if (type == 1) {
        // 0入力しても削除されない
        if (low == 0) {
            low = "";
        }
        if (high == 0) {
            high = "";
        }

        param = `&pct-off=${low}-${high}`;
        highParam = `&pct-off=-${high}`;
        lowParam = `&pct-off=${low}-`;
        key0 = "percent0";
        key1 = "percent1";
    }

    if (pattern.test(low)) {
        console.log(error + "low is NaN");
    } else if (pattern.test(high)) {
        console.log(error + "high is NaN");
    } else if (parseInt(low) > parseInt(high)) {
        console.log(error + "low > high");
    } else if (low == "" && high == "") {
        sessionStorage.setItem(key0, low);
        sessionStorage.setItem(key1, high);
        window.location.href = replacedUrl;
    } else if (low == "") {
        sessionStorage.setItem(key0, low);
        sessionStorage.setItem(key1, high);
        window.location.href = replacedUrl + highParam;
    } else if (high == "") {
        sessionStorage.setItem(key0, low);
        sessionStorage.setItem(key1, high);
        window.location.href = replacedUrl + lowParam;
    } else {
        sessionStorage.setItem(key0, low);
        sessionStorage.setItem(key1, high);
        window.location.href = location.href + param;
    }
}



// アドオンが使ってるsessionStorageを消去
function sessionStorageClear(length) {
    console.log(info + "sessionStorageClear() is worked");

    for (let i = 0; i < length; i++) {
        sessionStorage.removeItem("button" + i);
    }
    sessionStorage.removeItem("checkbox");
    sessionStorage.removeItem("price0");
    sessionStorage.removeItem("price1");
    sessionStorage.removeItem("percent0");
    sessionStorage.removeItem("percent1");
}



// 300ms後にページ遷移
function pageTransition(linkUrl) {
    console.log(info + "pageTransition() is worked");
    
    setTimeout(function() {
        location.href = linkUrl;
    }, 300);
}