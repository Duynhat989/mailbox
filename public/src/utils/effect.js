import request from "./request"
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export const remove_bg = async (imagePreview) => {
    const response = await request.post('/api/ainow/remove_bg', {
        "images": [
            imagePreview.replace('data:', '')
        ]
    });

    if (response.success) {
        let processId = response.sessionId;
        for (let index = 0; index < 50; index++) {
            await sleep(3 * 1000);
            try {
                const res = await request.post('/api/ainow/get_task', {
                    "processId": processId
                });

                if (res.success) {
                    let origin = res.data[0].origin;
                    let rss = await request.post('/api/ainow/url_basestr', {
                        "imageUrl": origin
                    });
                    return rss.base64
                }else{
                    return ''
                }
            } catch (error) {
                console.log(error);
                if (!error.success && error.msg == "error") {
                    return ''
                }
            }
        }
        return ''
    } else {
        return ''
    }
}
export const restore_photo = async (imagePreview) => {
    const response = await request.post('/api/ainow/restore-photo', {
        "images": [
            imagePreview.replace('data:', '')
        ]
    });

    if (response.success) {
        let processId = response.sessionId;
        for (let index = 0; index < 50; index++) {
            await sleep(3 * 1000);
            try {
                const res = await request.post('/api/ainow/get_task', {
                    "processId": processId
                });

                if (res.success) {
                    let origin = res.data[0].origin;
                    let rss = await request.post('/api/ainow/url_basestr', {
                        "imageUrl": origin
                    });
                    return rss.base64
                }else{
                    return ''
                }
            } catch (error) {
                console.log(error);
                if (!error.success && error.msg == "error") {
                    return ''
                }
            }
        }
        return ''
    } else {
        return ''
    }
}
export const retouch_skin = async (imagePreview) => {
    const response = await request.post('/api/ainow/retouch_skin', {
        "images": [
            imagePreview.replace('data:', '')
        ]
    });

    if (response.success) {
        let processId = response.sessionId;
        for (let index = 0; index < 50; index++) {
            await sleep(3 * 1000);
            try {
                const res = await request.post('/api/ainow/get_task', {
                    "processId": processId
                });

                if (res.success) {
                    let origin = res.data[0].origin;
                    let rss = await request.post('/api/ainow/url_basestr', {
                        "imageUrl": origin
                    });
                    return rss.base64
                }else{
                    return ''
                }
            } catch (error) {
                console.log(error);
                if (!error.success && error.msg == "error") {
                    return ''
                }
            }
        }
        return ''
    } else {
        return ''
    }
}

export const enhance_photo = async (imagePreview) => {
    const response = await request.post('/api/ainow/enhance-photo', {
        "images": [
            imagePreview.replace('data:', ''),
        ],
        "mode":"general"
    });

    if (response.success) {
        let processId = response.sessionId;
        for (let index = 0; index < 50; index++) {
            await sleep(3 * 1000);
            try {
                const res = await request.post('/api/ainow/get_task', {
                    "processId": processId
                });

                if (res.success) {
                    let origin = res.data[0].origin;
                    let rss = await request.post('/api/ainow/url_basestr', {
                        "imageUrl": origin
                    });
                    return rss.base64
                }else{
                    return ''
                }
            } catch (error) {
                console.log(error);
                if (!error.success && error.msg == "error") {
                    return ''
                }
            }
        }
        return ''
    } else {
        return ''
    }
}
export const remove_watermark = async (imagePreview) => {
    const response = await request.post('/api/ainow/remove_watermark', {
        "images": [
            imagePreview.replace('data:', ''),
        ]
    });

    if (response.success) {
        let processId = response.sessionId;
        for (let index = 0; index < 50; index++) {
            await sleep(3 * 1000);
            try {
                const res = await request.post('/api/ainow/get_task', {
                    "processId": processId
                });

                if (res.success) {
                    let origin = res.data[0].origin;
                    let rss = await request.post('/api/ainow/url_basestr', {
                        "imageUrl": origin
                    });
                    return rss.base64
                }else{
                    return ''
                }
            } catch (error) {
                console.log(error);
                if (!error.success && error.msg == "error") {
                    return ''
                }
            }
        }
        return ''
    } else {
        return ''
    }
}