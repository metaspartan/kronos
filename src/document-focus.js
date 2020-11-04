  
exports.releaseDocumentFocus = function () {
    const element = document.createElement("span")
    document.body.appendChild(element)
  
    const range = document.createRange()
    range.setStart(element, 0)
  
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    selection.removeAllRanges()
  
    document.body.removeChild(element)
  }
  
  exports.claimDocumentFocus = function () {
    const {activeElement} = document
    const selection = window.getSelection()
  
    let selectionStart, selectionEnd, range
  
    if (activeElement) ({selectionStart, selectionEnd} = activeElement)
    if (selection.rangeCount) range = selection.getRangeAt(0)
  
    const restoreOriginalSelection = function () {
      if (selectionStart >= 0 && selectionEnd >= 0) {
        activeElement.selectionStart = selectionStart
        activeElement.selectionEnd = selectionEnd
      } else if (range) {
        selection.addRange(range)
      }
    }
  
    exports.releaseDocumentFocus()
    requestAnimationFrame(restoreOriginalSelection)
  }