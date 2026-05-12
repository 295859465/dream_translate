/*!
 * 有道词典划词扩展2025 - v4.0.0
 * @desc 可自动发音，添加单词本，记录、导出查询历史！
 * @author g8up <g8up@qq.com>
 * @date 2025/7/19 10:36:25
 */

// ==================== 存储模块 ====================
class ChromeStorage {
    constructor(useSync = false) {
        this.store = useSync ? chrome.storage.sync : chrome.storage.local;
    }

    getItem(key) {
        return new Promise((resolve, reject) => {
            this.store.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }

    setItem(key, value) {
        return new Promise((resolve, reject) => {
            this.store.set({ [key]: value }, () => {
                resolve(value);
            });
        });
    }
}

// ==================== 常量定义 ====================
const TriggerKey = {
    ctrl: "ctrl",
    shift: "shift",
    alt: "alt"
};

const SpeechType = {
    eng: "1",  // 英式英语
    us: "2"     // 美式英语
};

const STORAGE_KEY = "Settings";
const WORD_LIST_URL = "https://dict.youdao.com/wordbook/wordlist";
const ADD_WORD_API = "https://dict.youdao.com/wordbook/ajax";

const ICON = {
    DEFAULT: chrome.runtime.getURL("image/icon-128.png"),
    SPEAKER: chrome.runtime.getURL("image/icon-128-speaker.png")
};

const CONSTANTS = {
    OPTION_STORAGE_ITEM: STORAGE_KEY,
    WORD_LIST: WORD_LIST_URL,
    ICON: ICON
};

// 默认设置
const DEFAULT_SETTINGS = {
    dict_enable: false,
    ctrl_only: true,
    triggerKey: TriggerKey.ctrl,
    english_only: true,
    auto_speech: true,
    defaultSpeech: SpeechType.us,
    history_count: 5,
    blackList: ""
};

// ==================== 设置管理类 ====================
class Settings extends ChromeStorage {
    constructor(key, defaultValue) {
        super(true); // 使用 sync 存储
        this.KEY = key;
        this.defaultValue = defaultValue;
    }

    async init() {
        const settings = await super.getItem(this.KEY);
        if (!settings) {
            await super.setItem(this.KEY, this.defaultValue);
        }
    }

    async get(key) {
        const all = await this.getAll();
        if (all) {
            return all[key];
        }
        console.warn(`未找到 setting: ${String(this.KEY)}`);
        return "";
    }

    async set(key, value) {
        let settings = await super.getItem(this.KEY);
        if (!settings) {
            settings = {};
        }
        settings[key] = value;
        return await super.setItem(this.KEY, settings);
    }

    async getAll() {
        const saved = await super.getItem(this.KEY);
        return Object.assign({}, this.defaultValue, saved);
    }

    async setAll(settings) {
        return await super.setItem(this.KEY, settings);
    }
}

const settings = new Settings(STORAGE_KEY, Object.assign({}, DEFAULT_SETTINGS));
settings.init();

// ==================== 工具函数 ====================

// 检查是否为纯英文
const isPureEnglish = (text) => {
    for (let i = 0; i < text.length; i += 1) {
        if (text.charCodeAt(i) > 126) {
            return false;
        }
    }
    return true;
};

// 检查是否为中文
const isChinese = (text) => {
    return !/[^\u4e00-\u9fa5]/.test(text);
};

// 检查是否为韩语
const isKorean = (text) => {
    for (let i = 0; i < text.length; i += 1) {
        const code = text.charCodeAt(i);
        if ((code > 12592 && code < 12687) || (code >= 44032 && code <= 55203)) {
            return true;
        }
    }
    return false;
};

// 检查是否包含中文字符
const containsChinese = (text) => {
    for (let i = 0; i < text.length; i += 1) {
        if (isChinese(text.charAt(i))) {
            return true;
        }
    }
    return false;
};

// 检查是否为英文单词
const isEnglishWord = (text) => {
    return /[a-zA-Z']+/.test(text);
};

// 查询字符串转对象
const parseQueryString = (str) => {
    const result = {};
    if (str && str.length) {
        const pairs = str.split("&");
        if (pairs.length) {
            pairs.forEach(pair => {
                const [key, value] = pair.split("=");
                result[key] = decodeURIComponent(value);
            });
        }
    }
    return result;
};

// 对象转查询字符串
const toQueryString = (params) => {
    if (!params) return "";
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
};

// 复制文本到剪贴板
const copyText = (text) => {
    if (text !== undefined && text !== "") {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
    }
};

// 版本比较
const getVersionParts = (version) => version.split(".").slice(0, 2);
const isNewerVersion = (oldVersion, newVersion) => {
    return getVersionParts(oldVersion) < getVersionParts(newVersion);
};

// ==================== 网络请求模块 ====================

const ContentType = {
    JSON: "application/json",
    FORM: "application/x-www-form-urlencoded"
};

const fetchAPI = {
    get: (url, params) => {
        return fetch(url + "?" + toQueryString(params), {
            headers: { "Content-Type": ContentType.JSON },
            credentials: "include"
        }).then(response => response.json());
    },
    post: (url, data) => {
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": ContentType.JSON },
            credentials: "include",
            body: JSON.stringify(data)
        }).then(response => response.json());
    },
    fetchXML: (url, params) => {
        return fetch(url + "?" + toQueryString(params), {
            headers: { "Content-Type": ContentType.FORM }
        })
            .then(response => response.text())
            .then(text => new DOMParser().parseFromString(text, "text/xml"));
    }
};

// ==================== 词典API ====================

const AddWordResult = {
    ADD_DONE: "adddone",
    NO_USER: "nouser"
};

const DEFAULT_PARAMS = {
    client: "deskdict",
    keyfrom: "chrome.extension",
    xmlVersion: "3.2",
    dogVersion: "1.0",
    ue: "utf8",
    doctype: "xml",
    pos: "-1",
    vendor: "getcrx.cn",
    appVer: "3.1.17.4208"
};

// 添加单词到单词本
const addWordToBook = (word) => {
    return fetchAPI.get(ADD_WORD_API, { q: word, action: "addword", le: "eng" })
        .then(result => {
            const { message } = result;
            if (message === AddWordResult.ADD_DONE) {
                return Promise.resolve();
            }
            if (message === AddWordResult.NO_USER) {
                return Promise.reject();
            }
            return null;
        });
};

// 查询单词
const fetchWordOnline = (word) => {
    if (word === "") return Promise.reject();
    return fetchAPI.fetchXML("https://dict.youdao.com/fsearch", Object.assign({
        q: word,
        le: isKorean(word) ? "ko" : "eng"
    }, DEFAULT_PARAMS));
};

// 翻译句子
const TRANSLATE_API = "http://fanyi.youdao.com/translate";
const fetchTranslate = (text) => {
    return fetchAPI.fetchXML(TRANSLATE_API, Object.assign({}, DEFAULT_PARAMS, {
        i: text,
        xmlVersion: "1.1"
    }));
};

// 有道翻译API
const YoudaoAPI = {
    addWord: addWordToBook,
    fetchWordOnline: fetchWordOnline,
    fetchTranslate: fetchTranslate
};

// ==================== Chrome API 封装 ====================

const promisify = (fn, context = null) => {
    return (...args) => new Promise((resolve, reject) => {
        fn.apply(context, args.concat((result) => {
            const { lastError } = chrome.runtime;
            if (lastError) {
                reject(lastError);
            } else {
                resolve(result);
            }
        }));
    }).catch(error => {
        console.warn(error);
    });
};

const promisifyAll = (methods, obj) => {
    const result = {};
    methods.forEach(method => {
        result[method] = promisify(obj[method], obj);
    });
    return result;
};

const API_GROUPS = {
    tabs: ["query", "update", "reload", "sendMessage", "create", "executeScript", "insertCSS"],
    runtime: ["sendMessage"],
    downloads: ["download"]
};

const ChromeAPI = Object.keys(API_GROUPS).reduce((acc, group) => {
    const methods = API_GROUPS[group];
    acc[group] = promisifyAll(methods, chrome[group] || {});
    return acc;
}, {});

// ==================== 消息类型 ====================
const MessageAction = {
    SELECT_TO_SEARCH: "select-to-search",
    ADD_WORD: "add-word",
    SPEECH: "speech",
    LOGIN: "login-youdao",
    GET_SETTING: "get-setting",
    TRANSLATE: "translate",
    TRANSLATE_CONTEXT: "context-menu",
    SETTING_CHANGED: "SETTING_CHAGNED"
};

// ==================== 消息发布 ====================

const MessagePublisher = {
    // 向所有标签页发布设置更新
    publishSettingToTabs: async (settings) => {
        const tabs = await ChromeAPI.tabs.query({ status: "complete" });
        if (tabs.length) {
            return Promise.all(tabs.map(tab => 
                ChromeAPI.tabs.sendMessage(tab.id, {
                    action: MessageAction.SETTING_CHANGED,
                    data: settings
                })
            ));
        }
    },
    
    // 打开单词本页面
    openWordList: () => {
        chrome.tabs.create({ url: WORD_LIST_URL });
    }
};

// ==================== 本地存储（句子摘录） ====================

const STORAGE_SENTENCE_KEY = "sentence";
const saveSentences = (sentences) => {
    return localForage.setItem(STORAGE_SENTENCE_KEY, sentences);
};

const addSentence = async (sentence) => {
    if (!sentence || sentence.sentence === "" || sentence.sentence.trim() === "") {
        return;
    }
    let sentences = await localForage.getItem(STORAGE_SENTENCE_KEY);
    if (!sentences) {
        sentences = [];
    }
    sentences.unshift(sentence);
    await saveSentences(sentences);
};

const getAllSentences = async () => {
    let sentences = await localForage.getItem(STORAGE_SENTENCE_KEY);
    return sentences && sentences.length ? sentences : [];
};

const getLatestSentences = async (limit) => {
    if (!(limit > 0)) return;
    const all = await getAllSentences();
    return all && all.length ? all.slice(0, limit) : [];
};

const getSentencesByPage = async (page, size) => {
    const all = await getAllSentences();
    const total = all.length;
    return {
        page: page,
        size: size,
        total: total,
        list: all.slice((page - 1) * size, page * size)
    };
};

const getSentencesByPageSafe = async (page, size) => {
    const { total, list } = await getSentencesByPage(page, size);
    if (total > 0 && list.length === 0) {
        return await getSentencesByPage(page - 1, size);
    }
    return await getSentencesByPage(page, size);
};

const SentenceStorage = {
    cover: saveSentences,
    add: addSentence,
    get: getLatestSentences,
    getAll: getAllSentences,
    deleteOne: async (sentence) => {
        const all = await getAllSentences();
        const index = all.findIndex(item => item.sentence === sentence.sentence);
        if (index > -1) {
            all.splice(index, 1);
            await saveSentences(all);
        }
    }
};

// ==================== 语音播放 ====================

const playSpeech = ({ word, type }) => {
    chrome.runtime.sendMessage({
        target: "offscreen",
        action: MessageAction.SPEECH,
        word: word,
        type: type
    });
};

const speakWord = (word) => {
    playSpeech(parseQueryString(`word=${word}`));
};

// ==================== UI 通知 ====================

const addWordToBookAndNotify = (word, callback) => {
    chrome.runtime.sendMessage({ 
        action: MessageAction.ADD_WORD, 
        word: word 
    }, (response) => {
        callback && callback(response);
    });
};

const showNotification = ({ title, message }) => {
    chrome.notifications.create(null, {
        type: "basic",
        iconUrl: "image/icon-128.png",
        title: title,
        message: message
    });
};

const shareExtension = () => {
    const manifest = chrome.runtime.getManifest();
    const content = `${manifest.name}\r\n${manifest.description}\r\nhttp://getcrx.cn/#/crxid/chgkpfgnhlojjpjchjcbpbgmdnmfmmil`;
    copyText(content);
    showNotification({
        title: "分享内容已复制到剪贴板",
        message: `${content}`
    });
};

// ==================== 图标管理 ====================

const setIcon = (iconPath) => {
    chrome.action.setIcon({ path: iconPath });
};

const setSpeakerIcon = () => {
    setIcon(ICON.SPEAKER);
};

const setDefaultIcon = () => {
    setIcon(ICON.DEFAULT);
};

const updateIconByAutoSpeech = (autoSpeechEnabled) => {
    if (autoSpeechEnabled) {
        setSpeakerIcon();
    } else {
        setDefaultIcon();
    }
};

// ==================== 离屏文档管理 ====================

let pendingOffscreenPromise = null;

async function setupOffscreenDocument(path) {
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: [offscreenUrl]
    });
    
    if (existingContexts.length > 0) {
        return;
    }
    
    if (pendingOffscreenPromise) {
        await pendingOffscreenPromise;
    } else {
        pendingOffscreenPromise = chrome.offscreen.createDocument({
            url: path,
            reasons: ["DOM_PARSER", "AUDIO_PLAYBACK", "LOCAL_STORAGE"],
            justification: "reason for needing the document"
        });
        await pendingOffscreenPromise;
        pendingOffscreenPromise = null;
    }
}

setupOffscreenDocument("offscreen.html");

// ==================== 应用状态 ====================

let currentSettings = {};

settings.getAll().then(savedSettings => {
    Object.assign(currentSettings, savedSettings);
    updateIconByAutoSpeech(currentSettings.auto_speech);
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, areaName) => {
    Object.keys(changes).some(key => {
        if (key === STORAGE_KEY) {
            const change = changes[key];
            Object.assign(currentSettings, change.newValue);
            MessagePublisher.publishSettingToTabs(currentSettings);
            return true;
        }
        return false;
    });
});

// ==================== 徽章管理 ====================

const setBadge = (text, color) => {
    chrome.action.setBadgeText({ text: text });
    if (color) {
        chrome.action.setBadgeBackgroundColor({ color: color });
    }
};

const clearBadge = () => {
    setBadge("", "");
};

const showTemporaryBadge = (text, color) => {
    setBadge(`${text}`, color);
    setTimeout(clearBadge, 3000);
};

// ==================== 消息监听 ====================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { action, word = "", type } = message;
    
    // 离屏文档的消息
    if (message.target === "offscreen") {
        return false;
    }
    
    switch (action) {
        case MessageAction.GET_SETTING:
            settings.getAll().then(result => {
                sendResponse({ option: result });
            });
            return true;
            
        case MessageAction.LOGIN:
            MessagePublisher.openWordList();
            break;
            
        case MessageAction.ADD_WORD:
            new YoudaoWordService(YoudaoAPI).add(word)
                .then(() => {
                    showTemporaryBadge("OK", "green");
                    sendResponse();
                })
                .catch(() => {
                    MessagePublisher.openWordList();
                });
            return true;
            
        default:
            break;
    }
    return false;
});

// ==================== 安装/更新处理 ====================

chrome.runtime.onInstalled.addListener(details => {
    console.log("onInstall", details);
    let shouldOpenOptions = false;
    const { reason, previousVersion } = details;
    
    if (reason === "install") {
        shouldOpenOptions = true;
    } else if (reason === "update") {
        const { version } = chrome.runtime.getManifest();
        shouldOpenOptions = isNewerVersion(previousVersion, version);
    }
    
    if (shouldOpenOptions) {
        chrome.tabs.create({ url: "option.html" });
    }
});

// ==================== 右键菜单 ====================

const addSentenceFromContextMenu = (info, tab) => {
    const { selectionText } = info;
    SentenceStorage.add({
        sentence: selectionText,
        url: tab.url,
        title: tab.title,
        createdAt: new Date().toLocaleString()
    }).then(() => {
        showTemporaryBadge("OK", "green");
    });
};

chrome.contextMenus.removeAll().then(() => {
    chrome.contextMenus.create({
        id: "translate_sentence",
        title: "翻译句子",
        contexts: ["selection"],
        documentUrlPatterns: ["<all_urls>"]
    });
    
    chrome.contextMenus.create({
        id: "add_sentence",
        title: "句摘",
        contexts: ["selection"],
        documentUrlPatterns: ["<all_urls>"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId } = info;
    
    switch (menuItemId) {
        case "translate_sentence":
            chrome.tabs.sendMessage(tab.id, { action: MessageAction.TRANSLATE_CONTEXT });
            break;
        case "add_sentence":
            addSentenceFromContextMenu(info, tab);
            break;
        default:
            break;
    }
});

// ==================== 辅助类 ====================

class YoudaoWordService {
    constructor(api) {
        this.api = api;
    }
    
    add(word) {
        return this.api.addWord(word);
    }
}