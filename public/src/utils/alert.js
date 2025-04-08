export function sendMessage(option = {
    type: 'info',
    title: 'Thông báo',
    message: '',
    primaryButtonText: 'OK',
    secondaryButtonText: 'Hủy',
    showSecondaryButton: false,
    isPersistent: false,
    callback: null
}) {
    function notifyDataChange(data) {
        const event = new CustomEvent('dataChanged', {
            detail: data,
            bubbles: true  // Let the event bubble up the DOM
        });
        document.dispatchEvent(event);
    }
    notifyDataChange(option)
}