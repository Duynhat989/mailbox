export const sendMessageRequest = async (messageValue, threadId, END_POINT) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = localStorage.getItem('token');
    if (token) {
        myHeaders.append("Authorization", `Bearer ${token}`);
    }

    const raw = JSON.stringify({
        message: messageValue,
        thread_id: threadId
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    const response = await fetch(`${import.meta.env.VITE_API_URL}${END_POINT.CONVERSATION_STREAM}`, requestOptions);
    return response;
};
// export const handleResponseStream = async (response, conversationList) => {
//     const reader = response.body.getReader();
//     const decoder = new TextDecoder("utf-8");

//     const readStream = async () => {
//         let done, value;
//         let fullMessage = '';
//         let buffer = ''; // Buffer để lưu các phần dữ liệu

//         while ({ done, value } = await reader.read(), !done) {
//             let textValue = decoder.decode(value);
//             buffer += textValue.trim();
//             let dataNew = buffer
//             // Xử lý nhiều chuỗi JSON trong buffer
//             console.log("dataNew: ",dataNew)
//             let dataParts = dataNew.split('\r\n\r\n');
//             // console.log("dataParts: ",dataParts)
//             var dataNewDone = dataParts[dataParts.length - 1] // Giữ lại phần chưa hoàn chỉnh trong buffer
//             var dataNewDone1 = dataParts[dataParts.length - 2] // Giữ lại phần chưa hoàn chỉnh trong buffer
//             console.log("dataNewDone",dataNewDone)
//             // console.log("dataNewDone1: ",dataNewDone1)
//             // for (const part of dataParts) {
//             //     try {
//             //         const data = JSON.parse(part);

//             //         if (data.success) {
//             //             fullMessage = data.data.full;
//             //             if (conversationList.value[conversationList.value.length - 1]?.role !== 'model') {
//             //                 conversationList.value.push({
//             //                     role: "model",
//             //                     content: fullMessage
//             //                 });
//             //             } else {
//             //                 conversationList.value[conversationList.value.length - 1].content = fullMessage;
//             //             }
//             //         } else {
//             //             return conversationList.value;
//             //         }

//             //         if (data.data.completed) {
//             //             return conversationList.value;
//             //         }
//             //     } catch (error) {
//             //         console.error("Failed to parse JSON:", error, part); // Log lỗi khi parse JSON
//             //     }
//             // }
//         }

//         return conversationList.value;
//     };

//     return await readStream();
// };
export const handleResponseStream = async (response, conversationList) => {
    if (!response.ok) {
        throw new Error(await response.text());
    }
    const decoder = new TextDecoder('utf-8');
    for await (const chunk of response.body) {
        try {
            let dat = decoder.decode(chunk, { stream: true });
            let arayDat = dat.trim().split('\r\n\r\n')

            if (arayDat.length > 1) {
                dat = arayDat[arayDat.length - 1]
            }
            let newData = {}
            try {
                newData = JSON.parse(arayDat[arayDat.length - 1])
            } catch (error) {
                newData = JSON.parse(arayDat[arayDat.length - 2])
            } // Chuyển đổi dòng dữ liệu thành đối tượng JSON
            let isDuplicate = conversationList[conversationList.length - 1].role == 'model'
            if (isDuplicate) {
                conversationList[conversationList.length - 1].content = newData.data.full
            }
        } catch (error) {

        }
    }
    return conversationList;
};


