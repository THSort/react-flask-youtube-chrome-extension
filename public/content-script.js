// Inform the background page that 
// this tab should have a page-action
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
});

const handleUrlChange = () => {
    const url = window.location.href;

    let divElement = document.querySelector('.js-temp');
    if (!divElement) {
        divElement = document.createElement('div');
        divElement.className = 'js-temp';
        document.body.appendChild(divElement);
    }

    divElement.textContent = url;

    // Notify background or popup about the URL change
    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'URLChanged',
        url: url,
    });
};

// Initial call to handle the current URL
handleUrlChange();

const observer = new MutationObserver(() => {
    handleUrlChange();
});

// Configure the observer to watch for changes in the document
const config = { childList: true, subtree: true };
observer.observe(document, config);

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    // validate the message's structure.
    if ((msg.from === 'popup') && (msg.subject === 'URLInfo')) {
        var urlInfo = window.location.href;

        // respond to the sender (popup in index.js), 
        // through the specified callback
        response(urlInfo);
    }
});

// Disconnect the observer when the extension is unloaded
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.from === 'background' && msg.subject === 'unload') {
        observer.disconnect();
    }
});
