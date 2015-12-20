chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === 'setLink') {
        localStorage.setItem('user-link', request.link);
        sendResponse(request.link);
    } else if (request.command === 'getLink') {
        link = localStorage.getItem('user-link');
        sendResponse(link);
    } else {
        sendResponse(false);
    }
});