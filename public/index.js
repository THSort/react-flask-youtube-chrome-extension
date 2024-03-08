const setURLInfo = (info) => {
  document.querySelector('.js-videoUrlText').textContent = info.split('=')[1]
}

window.addEventListener('DOMContentLoaded', () => {
  // query for the active tab
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    // and send a request for the DOM info
    chrome.tabs.sendMessage(
      tabs[0].id,
      { from: 'popup', subject: 'URLInfo' },
      // also specifying a callback to be called 
      // from the receiving end (content-script)
      setURLInfo);
  });
});