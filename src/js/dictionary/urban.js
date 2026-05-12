'use strict'

/**
 * Dream Translate
 * https://github.com/295859465/dream_translate

 * @license MIT License
 */

function urbanDictionary() {
    return {
        url: 'https://www.urbandictionary.com/define.php?term=',
        init() {
            return this
        },
        unify(r, q) {
            let el = r.querySelector('#content > .def-panel')

            removeD(el.querySelectorAll('script,style,.row,.def-footer,a.mug-ad'))
            cleanAttr(el, ['title', 'class', 'autoplay', 'loop', 'muted', 'playsinline', 'src', 'width', 'height'])
            el.querySelectorAll('.def-header').forEach(e => {
                e.style.fontSize = '120%'
                e.style.fontWeight = '700'
            })

            return {text: q, phonetic: {}, sound: [], html: el.innerHTML}
        },
        query(q) {
            return new Promise((resolve, reject) => {
                if (q.length > 100) return reject('The text is too large!')
                let url = this.url + encodeURIComponent(q)
                httpGet(url, 'document', null, true).then(r => {
                    if (r) {
                        resolve(this.unify(r, q))
                    } else {
                        reject('urbandictionary.com error!')
                    }
                }).catch(e => {
                    reject(e)
                })
            })
        },
        link(q) {
            return this.url + encodeURIComponent(q)
        },
    }
}
