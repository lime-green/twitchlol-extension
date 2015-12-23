chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === 'setLink') {
        localStorage.setItem('user-link', request.link);
        localStorage.setItem('user-code', request.code);
        sendResponse(request.code);
    } else if (request.command === 'getLink') {
        link = localStorage.getItem('user-link');
        code = localStorage.getItem('user-code');
        sendResponse({link: link, code: code});
    } else {
        sendResponse(false);
    }
});