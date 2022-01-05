const info = "[condler] info: ";
const error = "[condler] error: ";



let element = {};
let newLayoutFlag = false;

// URLパースして値をsessionStorageCompareに渡す
function urlParse(url, radioButton) {
    const params = new URLSearchParams(url);

    if (params.has("s")) {
        const s = params.get("s");

        radioButton.each(function(index) {
            const elementValue = $(this).val().replace("&sort=", "");
            if (s == elementValue) {
                element["button" + index] = true;
            } else {
                element["button" + index] = false;
            }
        });
    } else {
        for (let i = 0; i < radioButton.length; i++) {
            element["button" + i] = false;
        }
    }

    if (url.match(/p_6%3AAN1VRQENFRJN5/)) {
        element.checkbox = true;
    } else {
        element.checkbox = false;
    }

    let price = url.match(/p_36%3A\d+00-\d+00/g);
    if (price != null) {
        price = price[0].replace("p_36%3A", "").split("-");
        element.price0 = price[0].substring(0, price[0].length-2);
        element.price1 = price[1].substring(0, price[1].length-2);
    } else {
        price = url.match(/p_36%3A\d+00-/g);
        if (price != null) {
            price = price[0].replace("p_36%3A", "").replace("00-", "");
            element.price0 = price;
            element.price1 = "";
        } else {
            price = url.match(/p_36%3A-\d+00/g);
            if (price != null) {
                price = price[0].replace("p_36%3A-", "");
                element.price0 = "";
                element.price1 = price.substring(0, price.length-2);
            } else {
                element.price0 = "";
                element.price1 = "";
            }
        }
    }

    let percent = url.match(/p_8%3A\d+-\d+/g);
    if (percent != null) {
        percent = percent[0].replace("p_8%3A", "").split("-");
        element.percent0 = percent[0];
        element.percent1 = percent[1];
    } else {
        percent = url.match(/p_8%3A\d+-/g);
        if (percent != null) {
            percent = percent[0].replace("p_8%3A", "").replace("-", "");
            element.percent0 = percent;
            element.percent1 = "";
        } else {
            percent = url.match(/p_8%3A-\d+/g);
            if (percent != null) {
                percent = percent[0].replace("p_8%3A", "").replace("-", "");
                element.percent0 = "";
                element.percent1 = percent;
            } else {
                element.percent0 = "";
                element.percent1 = "";
            }
        }
    }
}



// 入力値分析、ページ遷移
// urlの部分 &high-price= と &pct-off= 分ける
function numberParse(type, low, high, replacedUrl) {
    const pattern = /\D/g;
    let param;
    let highParam;
    let lowParam;
    
    if (type == 0) {
        param = `&low-price=${low}&high-price=${high}`;
        highParam = `&high-price=${high}`;
        lowParam = `&low-price=${low}`;
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
    }

    if (pattern.test(low)) {
        //console.log(error + "low is NaN");
    } else if (pattern.test(high)) {
        //console.log(error + "high is NaN");
    } else if (parseInt(low) > parseInt(high)) {
        //console.log(error + "low > high");
    } else if (low == "" && high == "") {
        window.location.href = replacedUrl;
    } else if (low == "") {
        window.location.href = replacedUrl + highParam;
    } else if (high == "") {
        window.location.href = replacedUrl + lowParam;
    } else {
        window.location.href = location.href + param;
    }
}



// 300ms後にページ遷移
function pageTransition(linkUrl) {
    setTimeout(function() {
        location.href = linkUrl;
    }, 300);
}



function main(radioButton) {
    // アドオン非表示設定の適用
    browser.storage.local.get("numel").then(function(result) {
        for (let i = 0; i < result.numel; i++) {
            const key = "ele" + i;

            browser.storage.local.get([key]).then(function(result) {
                if (result[key] == false) {
                    //console.log(info + key + " is false");
                    // + 変数名 でセレクタに変数使える
                    $("div#condler #" + key + "*").hide();
                }
            });
        }
    });



    // url解析
    if (!radioButton.length) {
        //console.log(error + "get radioButton: failure");
    }
    urlParse(location.href, radioButton);



    // 並べ替えの値復元、クリック時のイベントハンドラ
    let allButtonFalseFlag = true;
    radioButton.each(function(index) {
        if (element["button" + index] == true) {
            $(this).prop("checked", true);
            allButtonFalseFlag = false;
        }

        $(this).on("click", function() {
            window.location.href = location.href + $(this).val();
        });
    });

    if (allButtonFalseFlag == true) {
        $("div#condler li#ele0 input[type='radio'][name='radioButton']").prop("checked", true);
    }



    // Amazon公式出品の値復元
    const checkbox = $("div#condler input[type='checkbox'][name='checkbox']");
    if (element.checkbox == true) {
        checkbox.prop("checked", true);
    }

    // Amazon公式出品クリック時のイベントハンドラ
    const checkboxPrevState = checkbox.prop("checked");
    checkbox.on("click", function() {
        if (checkboxPrevState) {
            //console.log(info + "checkbox: true->false");

            // 出品者欄にAmazon.co.jpが存在するかどうか
            if (document.getElementById("p_6/AN1VRQENFRJN5")) {   
                //console.log(info + "amazonCheckbox is exist");
                
                // Amazon.co.jpチェック解除のリンクへ
                if (newLayoutFlag) {
                    window.location.href = $("a#p_6\\/AN1VRQENFRJN5").attr("href");
                } else {
                    window.location.href = $("div#s-refinements li#p_6\\/AN1VRQENFRJN5 a").attr("href");
                }
            } else {
                // URLから関連要素削除したリンクへ
                window.location.href = location.href.replace($(this).val(), "").replace("p_6%3AAN1VRQENFRJN5", "");
            }
        } else {
            //console.log(info + "checkbox: false->true");

            window.location.href = location.href + $(this).val();
        }
    });



    // 値段絞り込み値を復元
    const lowPrice = $("div#condler li#priceInput>input#low-price");
    const highPrice = $("div#condler li#priceInput>input#high-price");
    if (element.price0) {
        lowPrice.val(element.price0);
    }
    if (element.price1) {
        highPrice.val(element.price1);
    }

    // 値引き率絞り込み値を復元
    const lowPercent = $("div#condler li#percentOffInput>input#low-percent");
    const highPercent = $("div#condler li#percentOffInput>input#high-percent");
    if (element.percent0) {
        lowPercent.val(element.percent0);
    }
    if (element.percent1) {
        highPercent.val(element.percent1);
    }



    // 値段絞り込みのGoボタンクリック時のイベントハンドラ
    $("div#condler li#priceInput input.a-button-input").on("click", function() {
        const lowPriceVal = lowPrice.val();
        //console.log(info + "lowPrice: " + lowPriceVal);
        
        const highPriceVal = highPrice.val();
        //console.log(info + "highPrice: " + highPriceVal);

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
        //console.log(info + "lowPercent: " + lowPercentVal);
        
        const highPercentVal = highPercent.val();
        //console.log(info + "highPercent: " + highPercentVal);

        // p_8%3A[PERCENT]-[PERCENT]

        const replacedUrl = location.href.replace(/p_8%3A\d+-\d+/g, "").replace(/p_8%3A-?\d+-?/g, "");
        numberParse(1, lowPercentVal, highPercentVal, replacedUrl);
    });



    // div#dropdown-content-s-all-filters配下のaタグに対して遅延.load()
    $("div#dropdown-content-s-all-filters span.a-declarative>a[href^='\\/s?']").on("click", function() {
        setTimeout(() => {
            const timer = setInterval(() => {
                if (!document.getElementById("#condler")) {
                    clearInterval(timer);

                    let div = document.createElement("div");
                    div.id = "condler";
                    div.className = "a-section a-spacing-none";

                    $("div#dropdown-content-s-all-filters>div:first").before(div);

                    $("div#condler").load(browser.runtime.getURL("search-options-dom.html"), loadCallback());
                }
            }, 100);
        }, 1000);
    });

    // カテゴリー選択時「すべてのカテゴリー」を押したときのイベントハンドラ
    $("div#departments li#n>span.a-list-item").on("click", function(e) {
        e.preventDefault();

        //console.log(info + "all category clicked");

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

        //console.log(info + "s-refinements clicked");

        let linkUrl = $(this).closest("a").attr("href");
        if (linkUrl === undefined) {
            linkUrl = $(this).children("a").attr("href");
        }

        pageTransition(linkUrl);
    });
}



// 100ms間隔で5回、radioButtonの取得を試みる
// 読み込みタイミングに違いがあるため
function loadCallback() {
    const timer = setInterval(() => {
        const radioButton = $("div#condler input[type='radio'][name='radioButton']");
        if (radioButton.length) {
            //console.log(info + "get radioButton succeed");
            clearInterval(timer);

            main(radioButton);
        }
    }, 100, 5);
}



$(window).on("load", function() {
    // ドロップダウン並べ替え非表示
    $("span.rush-component div.sg-col-6-of-20.sg-col.sg-col-6-of-16.sg-col-6-of-12 span.a-dropdown-container").hide();

    // アドオン用DOM要素作成
    let div = document.createElement("div");
    div.id = "condler";
    div.className = "a-section a-spacing-none";

    // 100ms間隔で5回、targetNodeの取得を試みる
    const timer = setInterval(() => {
        const primaryTarget = $("div#s-refinements>div>div:first");
        const secondaryTarget = $("div#dropdown-content-s-all-filters>div:first");
        if (primaryTarget.length) {
            clearInterval(timer);

            primaryTarget.before(div);
            $("div#condler").load(browser.runtime.getURL("search-options-dom.html"), loadCallback());
        } else if (secondaryTarget.length) {
            clearInterval(timer);

            newLayoutFlag = true;
            secondaryTarget.before(div);
            $("div#condler").load(browser.runtime.getURL("search-options-dom.html"), loadCallback());
        }
    }, 100, 5);
});