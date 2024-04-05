export function scrollToHash() {
    if (window.location.hash) {
        document.getElementById(window.location.hash.replace("#", ""))?.scrollIntoView(true);
    }
}
