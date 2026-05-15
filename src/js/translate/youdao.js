'use strict'

/**
 * Dream Translate
 * https://github.com/295859465/dream_translate
 * @license MIT License
 */

function youdaoTranslate() {
    return {
        token: {
            token: '',
            date: 0,
        },
        langMap: {
            "en": "en",
            "ru": "ru",
            "pt": "pt",
            "hi": "hi",
            "de": "de",
            "el": "el",
            "it": "it",
            "id": "id",
            "nl": "nl",
            "kor": "ko",
            "jp": "ja",
            "fra": "fr",
            "spa": "es",
            "ara": "ar",
            "dan": "da",
            "fin": "fi",
            "may": "ms",
            "vie": "vi",
            "zh": "zh-CHS"
        },
        langMapInvert: {},
        lanTTS: ["en", "zh", "jp", "kor", "fra"],
        md5(e) {
            return;
        },
        init() {
            this.langMapInvert = invertObject(this.langMap)
            let str = localStorage.getItem('youdaoToken')
            if (str) this.token = JSON.parse(str)
            return this
        },
        setToken(options) {
            this.token = Object.assign(this.token, options)
            localStorage.setItem('youdaoToken', JSON.stringify(this.token))
        },
        getToken() {
            return new Promise((resolve, reject) => {
                httpGet('https://fanyi.youdao.com/').then(r => {
                    let arr = r.match(/<script.*?src="(http[^"]+fanyi\.min\.js)"/)
                    if (arr) {
                        httpGet(arr[1]).then(r => {
                            let tArr = r.match(/sign:n\.md5\("fanyideskweb"\+e\+i\+"([^"]+)"\)/)
                            if (tArr) {
                                let token = {token: tArr[1], date: Math.floor(Date.now() / 36e5)}
                                this.setToken(token)
                                resolve(token)
                            } else {
                                reject('youdao token error!')
                            }
                        }).catch(e => {
                            reject('youdao js error:', e)
                        })
                    } else {
                        reject('youdao *.min.js error!')
                    }
                }).catch(e => {
                    reject('youdao home error:', e)
                })
            })
        },
        addListenerRequest() {
            onBeforeSendHeadersAddListener(this.onChangeHeaders,
                {urls: ['*://fanyi.youdao.com/*'], types: ['xmlhttprequest']})
        },
        removeListenerRequest() {
            onBeforeSendHeadersRemoveListener(this.onChangeHeaders)
        },
        onChangeHeaders(details) {
            let h = details.requestHeaders
            /*h.some((v, k) => {
                if (v.name.toLowerCase() === 'referer') {
                    h.splice(k, 1)
                    return true
                }
            })*/
            h.push({name: 'Origin', value: 'https://fanyi.youdao.com'})
            h.push({name: 'Referer', value: 'https://fanyi.youdao.com'})
            return {requestHeaders: h}
        },
        DEFAULT_PARAMS : {
            client: "deskdict",
            keyfrom: "chrome.extension",
            xmlVersion: "3.2",
            dogVersion: "1.0",
            ue: "utf8",
            doctype: "xml",
            pos: "-1",
            vendor: "getcrx.cn",
            appVer: "3.1.17.4208"
        },
        ContentType : {
            JSON: "application/json",
            FORM: "application/x-www-form-urlencoded"
        },
        // 对象转查询字符串
        toQueryString(params) {
            if (!params) return "";
            return Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join("&");
        },
        async fetchXML(url, params) {
            return fetch(url + "?" + this.toQueryString(params), {
                headers: { "Content-Type": this.ContentType.FORM }
            })
            .then(response => response.text())
            .then(text => new fxparser.XMLParser().parse(text));
            // .then(text => new DOMParser().parseFromString(text, "text/xml"));
        },
        async trans(q, srcLan, tarLan) {
            srcLan = this.langMap[srcLan] || 'AUTO'
            tarLan = this.langMap[tarLan] || 'zh-CHS'
            if (srcLan !== 'zh-CHS') tarLan = 'zh-CHS' // 有道只支持单一中文互换翻译
            if (q.length > 5000){
                debug('The text is too large!')
                return;
            }
            let url = 'https://dict.youdao.com/fsearch'
            let json =await this.fetchXML(url, Object.assign({
                    q: q,
                    le: "eng"
                }, this.DEFAULT_PARAMS))
            // debug(json)
            if(json){
                return this.unify(json.yodaodict['custom-translation'], q, srcLan, tarLan)
            }else {
                reject('youdao translate error!')
            }
        },
        unify(r, q, srcLan, tarLan) {
            // console.log('youdao:', r, q, srcLan, tarLan)
            let lanArr = r.type.split('2')
            if (lanArr.length > 1) srcLan = lanArr[0]
            let map = this.langMapInvert
            srcLan = map[srcLan] || 'auto'
            tarLan = map[tarLan] || ''
            let ret = {text: q, srcLan: srcLan, tarLan: tarLan, lanTTS: this.lanTTS, data: []}
            let arr = r && r.translation
            debug(arr)
            if(arr.length > 1){
                arr && arr.forEach(v => {
                    if (v.content) ret.data.push({srcText: q, tarText: v.content})
                })
            }else{
                ret.data.push({srcText: q, tarText: arr.content})
            }
            return ret
        },
        async query(q, srcLan, tarLan, noCache) {
            return checkRetry(async (i) => {
                let t = Math.floor(Date.now() / 36e5)
                let d = this.token.date
                if (i > 0) noCache = true
                if (noCache || !d || Number(d) !== t) {
                    await this.getToken().catch(err => console.warn(err))
                }
                return this.trans(q, srcLan, tarLan)
            })
        },
        tts(q, lan) {
            return new Promise((resolve, reject) => {
                if (!inArray(lan, this.lanTTS)) return reject('This language is not supported!')
                let lanArr = {en: "eng", zh: 'zh-CHS', jp: "jap", kor: "ko", fra: "fr"}
                let le = lanArr[lan] || lanArr.en
                // resolve(`https://tts.youdao.com/fanyivoice?word=${encodeURI(q)}&le=eng&keyfrom=speaker-target`)
                let getUrl = (s) => {
                    return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(s)}&type=2`
                }
                let r = []
                let arr = sliceStr(q, 128)
                arr.forEach(text => {
                    r.push(getUrl(text))
                })
                resolve(r)
            })
        },
        link(q, srcLan, tarLan) {
            return `https://fanyi.youdao.com/?d_sl=${srcLan}&d_tl=${tarLan}&d_text=${encodeURI(q)}`
        },
    }
}
