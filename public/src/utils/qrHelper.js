// src/utils/qrHelper.js
export function generateVietQRUrl(bankCode, accountNumber, amount, paymentContent, accountName) {
    const encodedContent = encodeURIComponent(paymentContent);
    const encodedAccountName = encodeURIComponent(accountName);
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact1.jpg` +
                  `?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;
    return qrUrl;
  }
  