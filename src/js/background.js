'use strict'

/**
 * background.js
 * conf.json setting.scribble : direct clickIcon
 * Dream Translate
 * https://github.com/295859465/dream_translate
 * @license MIT License
 */

importScripts('common.js', 'lib/fxparser.min.js', 'translate/alibaba.js', 'translate/baidu.js', 'translate/bing.js', 'translate/deepl.js', 'translate/frdic.js', 'translate/google.js', 'translate/so.js', 'translate/sogou.js', 'translate/youdao.js', );

var conf, setting, sdk = {}
let searchText, searchList
let ocrToken = '', ocrExpires = 0
let translateLoadList = []
let textTmp = ''
let historyMax = 3000
async function initBackground() {
    let languageList = '', dialogCSS = '', dictionaryCSS = {}
    await fetch('../conf/conf.json').then(r => r.json()).then(r => {
        conf = r;
    })
    await fetch('../conf/searchText.txt').then(r => r.text()).then(r => {
        searchText = r
    })
    await fetch('../conf/language.json').then(r => r.text()).then(r => {
        languageList += r
    })
    await fetch('../css/dmx_dialog.css').then(r => r.text()).then(r => {
        dialogCSS += minCss(r)
    })
    for (let name of conf.dictionaryCSS) {
        await fetch(`../css/${name}.css`).then(r => r.text()).then(r => {
            dictionaryCSS[name] = minCss(r)
        })
    }
    storageLocalSet({conf, languageList, dialogCSS, dictionaryCSS}).catch(err => debug(`save error: ${err}`))

    await storageSyncGet(['setting', 'searchText']).then(function (r) {
        saveSettingAll(r.setting, true) // 初始设置参数
        searchList = getSearchList(r.searchText || searchText)
        if (!r.searchText) saveSearchText('') // 如果为空，设置默认值
    })

    // 最大保存历史记录数
    if (storageLocalGet('historyMax')) historyMax = Number(storageLocalGet('historyMax'))

    // 添加菜单
    // setting.searchMenus.forEach(name => {
    //     let url = searchList[name]
    //     url && addMenu(name, name, url)
    // })

    // 初始数据库
    // idb('favorite', 1, initFavorite) // 否则第一次安装时，"我的收藏"需要刷新一下才能正常看到数据。

    // 查看全部数据
    // storageShowAll()
}

function minCss(s) {
    s = s.replace(/\/\*.*?\*\//g, '')
    s = s.replace(/\s+/g, ' ')
    s = s.replace(/\s*([:;{}!,])\s*/g, '$1')
    s = s.replace(/;}/g, '}')
    s = s.replace(/;}/g, '}')
    return s
}

function saveSettingAll(newData, updateIcon, resetDialog) {
    setting = Object.assign({}, conf.setting, newData) //应该以同步设置为准。
    let options = resetDialog ? {setting, dialogConf: {}} : {setting}
    if (resetDialog) saveSearchText('')
    storageSyncSet(options)
}

function saveSearchText(s) {
    if (!s) s = searchText
    storageSyncSet({searchText: s})
    searchList = getSearchList(s)
}

async function autoLang(text){
    let lang = 'en' // 默认值
    const response = await fetch('https://fanyi.baidu.com/langdetect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `query=${encodeURIComponent(text)}`
    }).catch(err => {
        debug('语言检测错误:', err);
        return lang;
    });
    let result = await response.json();
    debug('语言检测结果:', result);
    return result.lan;
}


async function autoPlayTTS(tabId, text, lang) {
    let list = conf.translateTTSList || {}
    let arr = setting.translateTTSList || []
    if (lang === 'auto') lang = await autoLang(text)
    for (let name of arr) {
        let message = {action: 'playSound', nav: 'translate', name, type: 'source', status: 'end'}
        await sandFgMessage(tabId, Object.assign({}, message, {status: 'start'}))
        await playTTS(name, text, lang).then(() => {
            sandFgMessage(tabId, message)
        }).catch(err => {
            debug(`${name} sound error:`, err)
            sandFgMessage(tabId, Object.assign({}, message, {error: `${list[name] || '发音'}出错`}))
        })
    }
}

function sdkInit(name) {
    return new Promise((resolve, reject) => {
        if (sdk[name]) return resolve(sdk[name])
        // debug('sdkInit name 类型:', typeof baiduTranslate)
        try { 
            sdk[name] = new name().init()
            resolve(sdk[name])
        } catch (e) {
            let err = name + ' not exist!'
            debug('sdkInit error:', err)
            reject(err)
        }
        // if (typeof name === 'function') {
        //     sdk[name] = new name().init()
        //     resolve(sdk[name])
        // } else {
        //     let err = name + ' not exist!'
        //     debug('sdkInit error:', err)
        //     reject(err)
        // }
    })
}

const handlers = {
    baidu: baiduTranslate(),
    google: googleTranslate(),
    bing: bingTranslate(),
    deepl: deeplTranslate(),
    alibaba: alibabaTranslate(),
    youdao: youdaoTranslate(),
    sogou: sogouTranslate(),
    so: soTranslate()
}

async function runTranslate(tabId, m) {
    let {action, text, srcLan, tarLan} = m
    if (srcLan === 'auto') {
        srcLan = await autoLang(text)
        if (srcLan === tarLan) tarLan = srcLan === 'zh' ? 'uk' : 'zh'
    } else if (setting.autoLanguage) {
        if (/\p{Script=Han}/u.test(text)) srcLan = 'zh'
        if (srcLan === tarLan) tarLan = srcLan === 'zh' ? 'uk' : 'zh'
    }
    debug('翻译参数:', {action, text, srcLan, tarLan})
    const Sync_setting = await storageSyncGet(['setting']);
    // debug('Sync_setting:', Sync_setting);
    translateLoadList = Sync_setting.setting.translateList;
    translateLoadList.forEach(name => {
        if (name && handlers[name]) {
            handlers[name].trans(text, srcLan, tarLan).then(result => {
                debug(`${name} runTranslate结果:`, result)
                sandFgMessage(tabId, {action, name, result})
            }).catch(error => {
                debug(`${name} runTranslate错误:`, error)
                sandFgMessage(tabId, {action, name, text, error})
            })
            const link = handlers[name].link(text, srcLan, tarLan)
            // debug(`${name} link:`, link)
            sandFgMessage(tabId, {action: 'link', type: action, name, link})
        }
    })

    // 自动朗读
    // autoPlayTTS(tabId, text, srcLan).then(_ => null)
}

function runTranslateTTS(tabId, m) {
    let list = conf.translateList
    let tList = conf.translateTTSList
    let {name, type, text, lang} = m
    let message = {action: 'playSound', nav: 'translate', name, type, status: 'end'}
    playTTS(name === setting.localSoundReplace ? 'local' : name, text, lang).then(() => {
        sandFgMessage(tabId, message)
    }).catch(err => {
        debug(`${name} sound error:`, err)
        let errMsg = `${tList[name] ? tList[name] : list[name] + '朗读'}出错`
        sandFgMessage(tabId, Object.assign({}, message, {error: errMsg}))
    })
}

// 检测返回结果是否正确，如果不正确，则重试
async function checkRetry(callback, times) {
    times = times || 3 // 默认 3 次
    let isOk = false
    let p
    for (let i = 0; i < times; i++) {
        p = callback(i)
        await p.then(r => {
            if (r.data && r.data.length > 0) isOk = true
        }).catch(_ => null)
        if (isOk) return p
        await sleep(300)
    }
    return p
}


initBackground()

// 监听消息
B.onMessage.addListener(function (m, sender, sendResponse) {
    debug('后台收到消息:', m)
    // debug('发送者:', sender)
    // return true;
    let tabId = sender.tab ? sender.tab.id : null
    if (!tabId) tabId = 'popup'

    if (m.action === 'translate') {
        // createHistory(m) // 保存历史记录
        runTranslate(tabId, m)
    } else if (m.action === 'translateTTS') {
        runTranslateTTS(tabId, m)
    } else if (m.action === 'dictionary') {
        runDictionary(tabId, m)
    } else if (m.action === 'playSound') {
        runPlaySound(tabId, m)
    } else if (m.action === 'menu') {
        changeMenu(m.name, m.isAdd)
    } else if (m.action === 'saveSetting') {
        saveSettingAll(m.setting, m.updateIcon, m.resetDialog)
    } else if (m.action === 'copy') {
        execCopy(m.text) // 后台复制，页面才不会失去焦点
    } else if (m.action === 'transWindow') {
        openTransWindow()
    } else if (m.action === 'onRecord') {
        openRecord()
    } else if (m.action === 'openUrl') {
        openTab(m.url)
    } else if (m.action === 'onAllowSelect') {
        sendAllowSelect()
    } else if (m.action === 'onCropImg') {
        cropImageSendMsg()
    } else if (m.action === 'onSaveSearchText') {
        saveSearchText(m.searchText)
    } else if (m.action === 'onCapture') {
        setTimeout(_ => capturePic(sender.tab, m), 100)
    } else if (m.action === 'img2text') {
        getOcrText(tabId, m.base64).catch()
    } else if (m.action === 'textTmp') {
        textTmp = m.text // 划词文字缓存
    }
})
