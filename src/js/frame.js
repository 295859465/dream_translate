'use strict'

/**
 * Dream Translate
 * https://github.com/295859465/dream_translate

 * @license MIT License
 */

;(function () {
    let frame = window.frameElement
    if (frame) {
        let top = null
        try {
            top = window.top || window.parent
        } catch (e) {
            return
        }
        if (!top) return
        document.addEventListener('mouseup', function (e) {
            let bcr = frame.getBoundingClientRect()
            let clientX = e.clientX + bcr.left
            let clientY = e.clientY + bcr.top
            let text = window.getSelection().toString().trim()
            if (text) top.postMessage({text: text, clientX: clientX, clientY: clientY}, '*')
        })
        document.addEventListener('mouseup', function () {
            top._MxDialog && top._MxDialog.hide()
        })
    }
})()
