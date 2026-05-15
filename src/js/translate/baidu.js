'use strict'

/**
 * Dream Translate
 * https://github.com/295859465/dream_translate
 * @license MIT License
 */

function baiduTranslate() {
    return {
        headers : {
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Acs-Token': '1714737656375_1714783878841_/y/Ru+9939osULPg7ZHtXgeybeDfBA1YUb0yselPJLEDOjBjKTFBqZ0YmhCkMx2l31Jv3Y+ujLFT/aGyb4zMwOtXUcEdhAniGeRsh44zWqAM4FKkU3OpoQaplOgyWDB4qwK0J3diwwROGu5jh4LS6a+i8DnfGS4OI5Df4lNkEQXtV+5zh3sOXAYteVwTud7mzl6nxn/3Q9gkgaTwcqJw8VK7lTkclzIJf9XjabJboKDVpqdc4lINrrQRWxMExBA8FD8sp4uvdsiOmFUawYQWTvM3hOwQOVMaVaZwoSyKd7Clky5F2DxtdeISXBHumJVvqNDmbTGeZEPptP19ipK35UJ2nHzvNZJ9JI7fQWbTmLxYBrhYwX+J1azQIQIbEtY8oTZJpOWfhh0aih5UDp+gzYkNcXt9GD33fzybKa7xUW6lgD9h3kEAxVLp2H9eTYUVI30vbFCBI7vwh8zRvdOY+SvfJ2nNva1CSNRP19Qzteon/2Fbg9nBHPFc4tit74mt',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Cookie': '__bid_n=186c934efe06011e1f4207; BIDUPSID=D2D4E300E02C71C493B5CBAADA8151BA; PSTM=1682425668; FPTOKEN=BnSROSs5jhyelsc7AY/mWoFn8FJ+lmKyKNi5hUAzaCYQoPT4UCZY+XdkkN0A3cE5STiNjIt3JViMy2vqbC8Bm1oubcjz9zyTvikjfKvl2p48MxxMWmzxPqPqgoUajs+cJIcasYydz0uHQSDn+hwMPhmz2qB6Ie0UvP9Kyy0vU5pkFTPfLLq4bawr71eu8asc7udLYiOEyI8XatnnSpYUV7xdu4UAnBiJbbkvTien7lpY8K/IodCqO8MCCg+KOFugmN5tVHOpToaKJ3lrCcAVv6fxApPas/VCrnJAdm+9Fan3NnxwKqH37zBI3oliCGU8tlsJQ4cIZyxv+HVS/3hhj/OMUZWIToWeBwX5bfj5g65QRI5haQP7cZ8uQ1BQW35rsLHfhn92DNTKV6UkBOmR1g==|TPmQlnmdI3DJ3b/0ZyWOFDxcpzsV5tklQX4FhuxbLK4=|10|22c12cb00c493e9868202f02d0ab3e3b; BAIDUID=E1EBAF32C1DB7E75C1CF54F025678979:FG=1; BAIDUID_BFESS=E1EBAF32C1DB7E75C1CF54F025678979:FG=1; MBD_AT=0; H_WISE_SIDS=282632_283599_281704_285064_285297_256739_286996_110085_282466_287237_283016_284880_287066_287627_287653_287665_287710_283904_287168_287932_280167_288373_283782_288270_287982_288671_288710_288713_288717_288588_288725_288743_288746_288749_281879_284816_285177_282929_265881_289262_289009_289545_289552_289715_287717_289948_289952_289956_290204_290237_290234_271562_290326_290369_290500_290355_286492_290555_290560_290562_282553_290692_269892_286863_287511_290896_290591_289236_289430_287976_291150_291237_290520_277936; H_WISE_SIDS_BFESS=282632_283599_281704_285064_285297_256739_286996_110085_282466_287237_283016_284880_287066_287627_287653_287665_287710_283904_287168_287932_280167_288373_283782_288270_287982_288671_288710_288713_288717_288588_288725_288743_288746_288749_281879_284816_285177_282929_265881_289262_289009_289545_289552_289715_287717_289948_289952_289956_290204_290237_290234_271562_290326_290369_290500_290355_286492_290555_290560_290562_282553_290692_269892_286863_287511_290896_290591_289236_289430_287976_291150_291237_290520_277936; H_PS_PSSID=40154_40201_40210_40206_40217_40224_40060; MCITY=-353%3A; BAIDU_WISE_UID=wapp_1714282499116_707; ZFY=Xpefmgv2PZiAfrw77aKfqdUHYWy6czIv:A4Ppas78YiA:C; BDUSS=ldFMUtEdzFINUo1bnloOXlqSmw1LVBFS3c1YWRYN0hHQ0lTSTV2OVFnbS1uRlptRVFBQUFBJCQAAAAAAAAAAAEAAACxrZfn9sCfVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL4PL2a-Dy9mY; BDUSS_BFESS=ldFMUtEdzFINUo1bnloOXlqSmw1LVBFS3c1YWRYN0hHQ0lTSTV2OVFnbS1uRlptRVFBQUFBJCQAAAAAAAAAAAEAAACxrZfn9sCfVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL4PL2a-Dy9mY; ab_sr=1.0.1_ZmU3MmRhYzlmYTE4ZDY3Y2VlNDRiZTE2MjcyMGFjYzU2NGEwZWY0NzdmMzUwNzVhNDMyMWU2MTI0Y2FjOGNkZjZkN2YwMGUwZDE0ZWQ1MWQzMDI4OGM1YmZiNjIyMGQ1YTUzYjM4M2JhMDUzYTdkYmUwY2MxZDI3OWJhMTkzNmM5Mzc2NjNhZjIyOTdkMDUzNjg4MmI4NjI2ZjY3ODNlZQ==; RT="z=1&dm=baidu.com&si=5f26d3ba-b628-48a3-86e6-2bdfa76ee6bb&ss=lvre14n5&sl=2&tt=5lz&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=cra"',
            'Origin': 'https://fanyi.baidu.com',
            'Referer': 'https://fanyi.baidu.com/mtpe-individual/multimodal?query=%EF%BB%BF%E4%BD%A0%E5%A5%BD&lang=zh2en',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
            'accept': 'text/event-stream',
            'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        },
        get_specific_str(str, arr) {
            let i = 0
            while (i < arr.length) {
                // 如果字符串在当前元素中，则返回索引
                if (arr[i].includes(str)) {
                    return i
                } else {
                    i += 1
                }
            }
            return -1
        },
        token: {
            gtk: '',
            token: '',
            date: 0,
        },
        lanTTS: ["en", "zh", "yue", "ara", "kor", "jp", "th", "pt", "spa", "fra", "ru", "de"],
        sign(t, e) {
            let ye = function (t, e) {
                for (let r = 0; r < e.length - 2; r += 3) {
                    let n = e.charAt(r + 2)
                    n = n >= "a" ? n.charCodeAt(0) - 87 : Number(n)
                    n = "+" === e.charAt(r + 1) ? t >>> n : t << n
                    t = "+" === e.charAt(r) ? t + n & 4294967295 : t ^ n
                }
                return t
            }
            let he = '', r = t.length
            r > 30 && (t = "" + t.substr(0, 10) + t.substr(Math.floor(r / 2) - 5, 10) + t.substr(-10, 10))
            let n = ('' !== he ? he : (he = e || "") || "").split("."), o = Number(n[0]) || 0, a = Number(n[1]) || 0
            let c = [], i = 0, u = 0
            for (; u < t.length; u++) {
                let s = t.charCodeAt(u)
                128 > s ? c[i++] = s : (2048 > s ? c[i++] = s >> 6 | 192 : (55296 === (64512 & s) && u + 1 < t.length && 56320 === (64512 & t.charCodeAt(u + 1)) ?
                    (s = 65536 + ((1023 & s) << 10) + (1023 & t.charCodeAt(++u)), c[i++] = s >> 18 | 240, c[i++] = s >> 12 & 63 | 128) :
                    c[i++] = s >> 12 | 224, c[i++] = s >> 6 & 63 | 128), c[i++] = 63 & s | 128)
            }
            let f = o, l = 0
            for (; l < c.length; l++) f = ye(f += c[l], "+-a^+6")
            return f = ye(f, "+-3^+b+-f"), 0 > (f ^= a) && (f = 2147483648 + (2147483647 & f)), (f %= 1e6).toString() + "." + (f ^ o)
        },
        init() {
            let str = localStorage.getItem('baiduToken')
            if (str) this.token = JSON.parse(str)
            return this
        },
        setToken(options) {
            this.token = Object.assign(this.token, options)
            localStorage.setItem('baiduToken', JSON.stringify(this.token))
        },
        getToken() {
            return new Promise((resolve, reject) => {
                httpGet('https://fanyi.baidu.com/').then(r => {
                    let arr = r.match(/window\.gtk\s=\s['"]([^'"]+)['"];/)
                    let tArr = r.match(/token:\s'([^']+)'/)
                    if (!arr) return reject('baidu gtk empty!')
                    if (!tArr) return reject('baidu token empty!')
                    let token = {gtk: arr[1], token: tArr[1], date: Math.floor(Date.now() / 36e5)}
                    this.setToken(token)
                    resolve(token)
                }).catch(e => {
                    reject(e)
                })
            })
        },
        async trans(q, srcLan, tarLan) {
            if (q.length > 5000){
                debug('The text is too large!')
                return
            }
            let json_data = {
                'query': q,
                'from': srcLan,
                'to': tarLan,
                'reference': '',
                'corpusIds': [],
                'qcSettings': ['1','2','3','4','5','6','7','8','9','10','11'],
                'needPhonetic': false,
                'domain': 'common',
                'milliTimestamp': new Date().getTime(),
            }
            const response = await fetch('https://fanyi.baidu.com/ait/text/translate', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(json_data),
                credentials: 'include'
            });
            const r = await response.text();
            if (r) {
                let arr = r.split('event: message')
                let index = this.get_specific_str('翻译中', arr)
                if (index !== -1) {
                    let str = arr[index]
                    if (str) {
                        str = str.substring(7)
                        // console.log(str);
                        // return;
                        let fanyi_arr = JSON.parse(str)
                        // return fanyi_arr.data.list[0].dst
                        return this.unify(fanyi_arr.data.list[0].dst, q, srcLan, tarLan)
                    }
                }
                // resolve(this.unify(r, q, srcLan, tarLan))
            } else {
                console.log('百度翻译访问失败!')
                return
            }
        
        },
        unify(r, text, srcLan, tarLan) {
            let ret = {text, srcLan, tarLan, lanTTS: null, data: []}
            if (r) {
                ret.data.push({srcText: text, tarText: r})
            }
            return ret
        },
        unify1(r, text, srcLan, tarLan) {
            // console.log('baidu:', r, text, srcLan, tarLan)
            // console.log(JSON.stringify(r))
            let res = getJSONValue(r, 'trans_result', {})
            let data = []
            if (res.data) {
                res.data.forEach(v => {
                    if (v.src && v.dst) data.push({srcText: v.src, tarText: v.dst})
                })
            }
            if (setting.translateThin) return {text, srcLan, tarLan, lanTTS: this.lanTTS, data} // 精简显示

            // 重点词汇
            let s = ''
            if (res.keywords && res.keywords.length > 0) {
                s += `<div class="case_dd"><div class="case_dd_head">重点词汇</div>`
                s += `<div class="case_dd_parts">`
                res.keywords.forEach(v => {
                    if (v.word && v.means) s += `<p><b data-search="true">${v.word}</b>${v.means.join('；')}</p>`
                })
                s += `</div></div>`
            }

            // 百度支持牛津，格林斯，英英等，如果全显示，会很复杂，小框显示也会很乱，所以只显示最简单的部分即可。
            // 在翻译领域，除了国际巨头谷歌，在国内做的最好的非百度莫属，然后是搜狗，有道；如今搜狗被腾讯收购，或许未来会改名。-- 2021.1.6
            let simple_means = getJSONValue(r, 'dict_result.simple_means')
            if (simple_means) {
                s += `<div class="case_dd">`
                let {word_name, symbols, word_means, exchange, memory_skill, tags} = simple_means
                if (word_name) s += `<div class="case_dd_head">${word_name}</div>`  // 查询的单词

                let getIconHTML = function (type, text, title) {
                    let lan = type === 'uk' ? 'uk' : 'en'
                    let src = `https://fanyi.baidu.com/gettts?lan=${lan}&text=${encodeURIComponent(text)}&spd=3&source=web`
                    return `<i class="dmx-icon dmx_ripple" data-type="${type}" data-src-mp3="${src}" title="${title}"></i>`
                }
                let hasParts = false
                if (symbols) {
                    symbols.forEach(sym => {
                        // 音标
                        let {ph_en, ph_am, parts} = sym
                        if (ph_en || ph_am) {
                            s += `<div class="case_dd_ph">`
                            s += `[${ph_en}${ph_am && ph_en !== ph_am ? ' $ ' + ph_am : ''}]`
                            s += getIconHTML('uk', text, '英音')
                            s += getIconHTML('us', text, '美音')
                            s += `</div>`
                        }

                        // 释义
                        if (parts && parts.length > 0) {
                            hasParts = true
                            s += `<div class="case_dd_parts">`
                            parts.forEach(v => {
                                let {part, means} = v
                                let firstVal = getJSONValue(means, '0')
                                if (firstVal && isString(firstVal)) {
                                    s += `<p>${part ? `<b>${part}</b>` : ''}${means.join('；')}</p>`
                                } else {
                                    let firstVal = getJSONValue(means, '0.text')
                                    if (firstVal && isString(firstVal)) {
                                        for (let mv of means) {
                                            let {text, part, means} = mv
                                            s += `<p>${part ? `<b>${part}</b>` : ''}${text} ${means ? means.join('；') : ''}</p>`
                                        }
                                    }
                                }
                            })
                            s += `</div>`
                        }
                    })
                }
                if (!hasParts && word_means) s += `<div class="case_dd_parts"><p>${word_means.join('；')}</p></div>`

                // 单词形态
                if (exchange) {
                    let exchangeObj = {
                        word_third: '第三人称单数',
                        word_pl: '复数',
                        word_ing: '现在分词',
                        word_past: '过去式',
                        word_done: '过去分词',
                        word_er: '比较级',
                        word_est: '最高级',
                        word_proto: '原型',
                    }
                    s += `<div class="case_dd_exchange">`
                    for (let [k, v] of Object.entries(exchange)) {
                        if (!v) continue
                        let wordStr = ''
                        v.forEach(word => {
                            if (word) wordStr += `<a data-search="true">${word}</a>`
                        })
                        s += `<b>${exchangeObj[k] || '其他'}</b><u>${wordStr}</u>`
                    }
                    s += `</div>`
                }

                // 记忆技巧
                if (memory_skill) {
                    s += `<div class="case_dd_parts"><b>记忆技巧：</b>${memory_skill}</div>`
                }

                // 单词标签
                if (tags) {
                    s += `<div class="case_dd_tags">`
                    for (let [k, v] of Object.entries(tags)) {
                        let tagStr = ''
                        v.forEach(tag => {
                            if (tag) tagStr += `<u>${tag}</u>`
                        })
                        s += tagStr
                    }
                    s += `</div>`
                }

                s += `</div>`
            }

            // 视频显示，如果有的话。
            let videoObj = getJSONValue(r, 'dict_result.queryExplainVideo')
            if (videoObj && videoObj.thumbUrl && videoObj.videoUrl) {
                // s += `<div style="margin:10px auto;width:400px;height:224px;background:#000"><video width="400" height="224" src="${videoObj.videoUrl}" poster="${videoObj.thumbUrl}" controls="controls" rel="noreferrer"></video></div>`
                let src = B.root + 'html/video.html?' + new URLSearchParams(`thumbUrl=${videoObj.thumbUrl}&videoUrl=${videoObj.videoUrl}`)
                s += `<div style="margin:10px auto;width:400px;height:224px;background:#000"><iframe width="400" height="224" src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
            }

            return {text, srcLan, tarLan, lanTTS: this.lanTTS, data, extra: s}
        },
        async query(q, srcLan, tarLan, noCache) {
            if (srcLan === 'auto') {
                srcLan = 'en' // 默认值
                await httpPost({
                    url: `https://fanyi.baidu.com/langdetect`,
                    body: `query=${encodeURIComponent(q)}`
                }).then(r => {
                    if (r.lan) srcLan = r.lan
                }).catch(err => {
                    debug(err)
                })
            }
            if (srcLan === tarLan) tarLan = srcLan === 'zh' ? 'en' : 'zh'

            return checkRetry(async (i) => {
                let t = Math.floor(Date.now() / 36e5)
                let d = this.token.date
                if (i > 0) noCache = true
                if (noCache || !d || Number(d) !== t) {
                    await this.getToken().catch(err => {
                        debug(err)
                    })
                }
                return this.trans(q, srcLan, tarLan)
            })
        },
        tts(q, lan) {
            return new Promise((resolve, reject) => {
                if (!inArray(lan, this.lanTTS)) return reject('This language is not supported!')
                if (lan === 'yue') lan = 'cte' // 粤语
                // https://tts.baidu.com/text2audio?tex=%E6%98%8E(ming2)%E7%99%BD(bai2)&cuid=baike&lan=ZH&ctp=1&pdt=31&vol=9&spd=4&per=4100
                let getUrl = (s) => {
                    return `https://fanyi.baidu.com/gettts?lan=${lan}&text=${encodeURIComponent(s)}&spd=3&source=web`
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
            // https://fanyi.baidu.com/gettts?lan=uk&text=hello&spd=3
            // return `https://fanyi.baidu.com/#${srcLan}/${tarLan}/${encodeURIComponent(q)}`
            return `https://fanyi.baidu.com/gettts?lan=${srcLan}&text=${encodeURIComponent(q)}&spd=3`
        },
    }
}
