'use strict'

/**
 * Dream Translate
 * 360翻译
 * https://github.com/295859465/dream_translate
 * @license MIT License
 */

function soTranslate() {
    return {
        data: {},
        init() {
            return this
        },
        addListenerRequest() {
            onBeforeSendHeadersAddListener(this.onChangeHeaders, {urls: ['*://fanyi.so.com/*']})
        },
        removeListenerRequest() {
            onBeforeSendHeadersRemoveListener(this.onChangeHeaders)
        },
        onChangeHeaders(details) {
            let s = `Host: fanyi.so.com
Origin: https://fanyi.so.com
pro: fanyi
Referer: https://fanyi.so.com/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin`
            return {requestHeaders: details.requestHeaders.concat(requestHeadersFormat(s))}
        },
        headers1 : {
            'Host': 'fanyi.so.com',
            'Origin': 'https://fanyi.so.com',
            'pro': 'fanyi',
            'Referer': 'https://fanyi.so.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        },
        headers : {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Content-Length': '0',
            'Cookie': 'QiHooGUID=F02A63E0BCB72DB4A01C21FA023475E1.1703769301607; Q_UDID=00b0237e-501b-1360-b2eb-96b79d1ac5ec; __guid=144965027.253643186935022000.1703769305042.223; count=2',
            'Origin': 'https://fanyi.so.com',
            'Pro': 'fanyi',
            'Referer': 'https://fanyi.so.com/',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        async trans(q, srcLan, tarLan) {
            if (/\p{Script=Han}/u.test(q)) srcLan = 'zh';
            tarLan = srcLan === 'zh' ? 'en' : 'zh';
            const eng = srcLan === 'en' ? 1 : 0;
            if (q.length > 5000) {
                debug('The text is too large!');
                return
            }
            const url = 'https://fanyi.so.com/index/search';
            const p = `query=${q}&from=英文&to=中文&eng=1&tone=`;
            const json_data = {
                eng: eng,
                ignore_trans: 0,
                query: q
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: new URLSearchParams(json_data),
                credentials: 'include'
            })
            const r = await response.json();
            if (r.data) {
                return this.unify(r, q, srcLan, tarLan)
            }else {
                debug('360翻译错误!');
                return
            }
        },
        unify(r, text, srcLan, tarLan) {
            // console.log('so:', r, q, srcLan, tarLan)
            let ret = {text, srcLan, tarLan, lanTTS: null, data: []}
            let data = r && r.data
            if (data) {
                this.data = data
                if (data.fanyi) ret.data.push({srcText: text, tarText: data.fanyi})
            }
            return ret
        },
        async query(q, srcLan, tarLan) {
            return checkRetry(() => this.trans(q, srcLan, tarLan))
        },
        tts(q, lan) {
            return new Promise((resolve, reject) => {
                let isEn = lan === 'en'
                let r = this.data && this.data.speak_url
                if (r) {
                    let arr = {}
                    if (r.word_type === 'en2zh') {
                        arr['en'] = r.speak_url
                        arr['zh'] = r.tSpeak_url
                    } else {
                        arr['zh'] = r.speak_url
                        arr['en'] = r.tSpeak_url
                    }
                    resolve(`https://fanyi.so.com` + (isEn ? arr['en'] : arr['zh']))
                } else {
                    reject('speak url empty')
                }
            })
        },
        link(q, srcLan, tarLan) {
            return `https://fanyi.so.com/?src=dream_translate#${q}`
        },
    }
}
