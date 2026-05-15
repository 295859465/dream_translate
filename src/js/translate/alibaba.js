'use strict'

/**
 * Dream Translate
 * https://github.com/295859465/dream_translate
 * @license MIT License
 */

function alibabaTranslate() {
    return {
        langMap: {
            "auto": "auto",
            "en": "en",
            "zh": "zh",
            "ru": "ru",
            "tr": "tr",
            "pt": "pt",
            "th": "th",
            "id": "id",
            "it": "it",
            "spa": "es",
            "fra": "fr",
            "ara": "ar",
            "vie": "vi"
        },
        langMapInvert: {},
        pairMap: {
            "auto": ["en"],
            "en": ["zh", "ru", "es", "fr", "ar", "tr", "pt", "th", "id", "vi"],
            "zh": ["en", "vi"],
            "ru": ["en", "es", "tr", "it", "fr", "pt"],
            "es": ["en", "ru", "tr", "it", "fr", "pt"],
            "fr": ["en", "ru", "tr", "it", "es", "pt"],
            "ar": ["en", "zh"],
            "tr": ["en", "ru", "fr", "it", "es", "pt"],
            "pt": ["en", "ru", "fr", "it", "es", "tr"],
            "it": ["en", "ru", "fr", "pt", "es", "tr"],
            "th": ["en", "zh"],
            "id": ["en", "zh"],
            "vi": ["en", "zh"]
        },
        init() {
            this.langMapInvert = invertObject(this.langMap)
            return this
        },
        addListenerRequest() {
            onBeforeSendHeadersAddListener(this.onChangeHeaders,
                {urls: ['*://translate.alibaba.com/*'], types: ['xmlhttprequest']})
        },
        removeListenerRequest() {
            onBeforeSendHeadersRemoveListener(this.onChangeHeaders)
        },
        onChangeHeaders(details) {
            let s = `origin: https://translate.alibaba.com
referer: https://translate.alibaba.com/
sec-fetch-site: same-origin`
            return {requestHeaders: details.requestHeaders.concat(requestHeadersFormat(s))}
        },
        async trans(q, srcLan, tarLan) {
            srcLan = this.langMap[srcLan] || 'auto'
            tarLan = this.langMap[tarLan] || 'zh'
            if (!inArray(tarLan, this.pairMap[srcLan])) tarLan = this.pairMap[srcLan][0]
            
            if (q.length > 5000) return reject('The text is too large!')
            let url = `https://translate.alibaba.com/api/translate/text`
            let p = new URLSearchParams(`srcLanguage=${srcLan}&tgtLanguage=${tarLan}&srcText=${q}&viewType=&source=&bizType=message`)
            const token_request = await fetch('https://translate.alibaba.com/api/translate/csrftoken', {
                headers: {
                    'Accept': 'application/json, text/plain, */*'
                }
            })
            const token = await token_request.json()
            // debug('阿里token：', token);
            const formData = new FormData();
            formData.append('srcLang', 'auto');
            formData.append('tgtLang', 'zh');
            formData.append('domain', 'general');
            formData.append('query', q);
            formData.append('_csrf', token.token);
            const request = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json, text/plain, */*'
                }
            })
            const r = await request.json()
            // debug('阿里翻译结果:', r);
            if (r.success === true) {
                return this.unify(r, q, srcLan, tarLan)
            }else {
                debug('阿里翻译错误!');
                return
            }
        },
        unify(r, q, srcLan, tarLan) {
            if (srcLan === 'auto' && r.recognizeLanguage) srcLan = r.recognizeLanguage
            let map = this.langMapInvert
            srcLan = map[srcLan] || 'auto'
            tarLan = map[tarLan] || ''
            let ret = {text: q, srcLan: srcLan, tarLan: tarLan, lanTTS: null, data: []}
            let srcArr = q.split('\n')
            let tarArr = []
            let arr = r && r.data
            ret.data.push({srcText: q, tarText: arr.translateText})
            return ret
        },
        async query(q, srcLan, tarLan) {
            return checkRetry(() => this.trans(q, srcLan, tarLan))
        },
        tts(q, lan) {
            lan = this.langMap[lan] || 'en'
            return new Promise((resolve) => {
                // 阿里云 TTS 有点慢，发音效果也不是太理想，懒得解密了，偷懒直接用搜狗的。
                let getUrl = (s) => {
                    return `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(s)}&speed=1&lang=${lan}&from=translateweb&speaker=3`
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
            return `https://translate.alibaba.com/?d_sl=${srcLan}&d_tl=${tarLan}&d_text=${encodeURIComponent(q)}`
        },
    }
}
