<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, nextTick, watch } from 'vue';
import MsgContentView from "@/components/MsgContent.vue";
import CropView from "@/components/Crop.vue";
import CryptoJS from 'crypto-js';
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css"; // Import CSS của CropperJS


import { chatMathSnap } from '../api/server.min.js'
import { languagePack } from '@/languages/index.js';

// Lấy dữ liệu từ state
// Lấy thông tin route
const route = useRoute();

console.log(JSON.stringify(route.path))
// Truy cập dữ liệu `state`
const fullInfo = ref({})

function generateToken() {
    var timestamp = Math.floor(Date.now() / 1000).toString();
    var random_number = Math.floor(Math.random() * 1000000).toString(); // Chuỗi 6 chữ số ngẫu nhiên
    var data = timestamp + random_number;
    return `web_${sha256(data)}`;
}
function sha256(data) {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}
// Reactive LaTeX state
const txtMessgae = ref('');
let newToken = ''
const sendEnter = (event) => {
    if (!event.shiftKey) { // Kiểm tra xem phím Shift có được nhấn không
        senMessage(); // Chỉ thực thi khi không có phím Shift được nhấn
    }
}
function resizeImageBase64(base64, newWidth, quality = 1.0) {
    return new Promise((resolve, reject) => {
        // Tạo một đối tượng Image mới
        let img = new Image();
        img.src = base64;

        img.onload = function () {
            // Lấy kích thước ảnh ban đầu
            let width = img.width;
            let height = img.height;

            // Tính tỷ lệ mới để giữ nguyên tỷ lệ của ảnh
            let ratio = newWidth / width;

            // Tính chiều cao mới dựa trên tỷ lệ
            let newHeight = height * ratio;

            // Tạo canvas để vẽ ảnh đã thay đổi kích thước
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Vẽ ảnh lên canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Lấy dữ liệu base64 từ canvas đã vẽ với chất lượng tối đa
            let resizedBase64 = canvas.toDataURL('image/jpeg', quality); // Bạn có thể thay đổi 'image/jpeg' sang 'image/png' tùy theo loại ảnh

            resolve(resizedBase64);
        };

        img.onerror = function () {
            reject('Failed to load image');
        };
    });
}


const senMessage = async () => {
    try {
        if (txtMessgae.value == '') {
            return
        }
        listMessages.value.push({
            role: 'user',
            pasts: [
                { text: txtMessgae.value.trim() }
            ],
            base64: imageBase64.value.split(',')[1]
        })
        autoScroll()
        console.log(listMessages.value)
        // Hỗ trợ xây dưng
        let dataBody = {
            "id_object": newToken,
            "message": txtMessgae.value,
            "image": imageBase64.value.split(',')[1]
        }
        txtMessgae.value = ''
        imageBase64.value = ''
        listMessages.value.push({
            role: 'model',
            pasts: [
                { text: "loading" }
            ]
        })
        let snap = await chatMathSnap(dataBody)
        console.log(snap)
        if (snap.status) {
            listMessages.value[listMessages.value.length - 1] = {
                role: 'model',
                pasts: [
                    { text: snap.messgaes.trim() }
                ]
            }
        }

        autoScroll()
    } catch (error) {
        if(confirm('Send message to Admin!')){
            window.open("https:m.me/582910404908735", "_blank");
        }
    }
}
const autoScroll = () => {
    setTimeout(() => {
        var container = document.querySelector('.message-content-ows');
        container.scrollTop = container.scrollHeight;
    }, 500)
}
const listMessages = ref([])



// Khai báo hình ảnh
const imageBase64 = ref('')
const isChooseImg = ref(false)
const isSnapLoading = ref(false)
const msgSnap = ref(null)

const close = async (data) => {
    isChooseImg.value = false
    imageBase64.value = ''
}
const finish = async (data) => {
    console.log(data)
    isChooseImg.value = false
    imageBase64.value = data.base64
}
// Hiển thị nhièu thông tin 
const isSolveDisplay = ref(1)
const solveFlast = async () => {
    await getCroppedImage()
    if (isSnapLoading.value) {
        alert(languagePack["THINKING_WAIT"])
        return
    }
    msgSnap.value = {
        role: 'model',
        pasts: [
            { text: languagePack["THINKING_WAIT"] }
        ],
        image: croppedImage.value
    }
    isSnapLoading.value = true
    if (txtMessgae.value == '') {
        newToken = generateToken()
        txtMessgae.value = `${languagePack["GIVE_SOLVE"]} ${fullInfo.value.solve} ${languagePack["PROGRAM_AFFTER"]}.${languagePack["LANGUAGE_AFFTER"]} ${`VN`}. `
    }
    let dataBody = {
        "id_object": newToken,
        "message": txtMessgae.value,
        "image": croppedImage.value ? croppedImage.value.split(',')[1] : ''
    }
    txtMessgae.value = ''
    autoScroll()
    let snap = await chatMathSnap(dataBody)
    msgSnap.value = {
        role: 'model',
        pasts: [
            { text: snap.messgaes.trim() }
        ]
    }
    isSnapLoading.value = false
}
// leftmenu 

const isShowLeft = ref(false)

onMounted(async () => {
    newToken = generateToken()
    const data = await JSON.parse(localStorage.getItem('extraData'));
    console.log(data)
    console.log(route.path)
    fullInfo.value = data.filter(item => item.slug === route.path)[0];

    console.log(fullInfo.value)

});
// Cắt hình ảnh 
// Khai báo biến ảnh 

const croppedImage = ref(null); // Lưu trữ Base64 của ảnh đã cắt
const imageRef = ref(null); // Tham chiếu đến thẻ <img> để gắn CropperJS
let cropper = null; // Biến lưu instance của CropperJS
// Chọn lại hình ảnh
const chooseSolve = async (libiry) => {
    // isChooseImg.value = true
    if (libiry) {
        document.querySelector('#file').removeAttribute('capture');
    } else {
        document.querySelector('#file').setAttribute('capture', 'camera');
    }
    txtMessgae.value = ''
    document.querySelector('#file').click()
}
// Xử lý tải ảnh và khởi tạo CropperJS
const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {

        imageBase64.value = e.target.result;
        // Đợi DOM render xong rồi khởi tạo CropperJS
        await nextTick();
        if (cropper) cropper.destroy(); // Hủy instance cũ nếu có
        cropper = new Cropper(imageRef.value, {
            aspectRatio: NaN, // Không cố định tỉ lệ, cho phép tự do cắt
            viewMode: 1, // Hiển thị toàn bộ ảnh trong vùng hiển thị
            // dragMode: "move", // Chế độ di chuyển hình
            scalable: true, // Cho phép phóng to/thu nhỏ
            zoomable: true, // Cho phép zoom
            // rotatable: true, // Cho phép xoay hình
            cropBoxMovable: true, // Cho phép di chuyển khung cắt
            cropBoxResizable: true, // Cho phép thay đổi kích thước khung cắt
        });
    };
    reader.readAsDataURL(file);
};
// hàm cắt ảnh
const getCroppedImage = async () => {
    if (!cropper) {
        return
    };
    // Lấy canvas từ vùng đã cắt
    const canvas = cropper.getCroppedCanvas();
    if (canvas) {
        //await resizeImageBase64(canvas.toDataURL("image/png"),1200,1200);
        // croppedImage.value = canvas.toDataURL("image/png")
        croppedImage.value = await resizeImageBase64(canvas.toDataURL("image/png"), 1000);
    }
};
const btn_trash = async () => {
    msgSnap.value = null
    imageBase64.value = ""
    croppedImage.value = ""
}
// bắt sự thay đổi của giao diện 
watch(isSolveDisplay, async (oldValue, newValue) => {
    imageBase64.value = ""
    croppedImage.value = ""
    txtMessgae.value = ''
    newToken = await generateToken()
    console.log(newToken)
})




</script>

<template>
    <div class="chat flex">
        <div class="button-group">
            <button @click="isShowLeft = !isShowLeft" class="hover_line"><i class='bx bx-menu-alt-left'></i></button>
            <div :class="isShowLeft ? `sub-left showleft` : `sub-left`">
                <ul class="">
                    <li class="line" @click="() => { isSolveDisplay = 1; isShowLeft = !isShowLeft }">
                        <a><i class='bx bxs-flame'></i> {{ languagePack["SOLVE_QUICK_FLAST"] }}</a>
                    </li>
                    <li class="line" @click="() => { isSolveDisplay = 2; isShowLeft = !isShowLeft }">
                        <a><i class='bx bx-bot'></i> {{ languagePack["TALK_AI"] }}</a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-nav">
            <ul class="tabs">
                <li class="tab" @click="() => { isSolveDisplay = 1; isShowLeft = !isShowLeft }"><a><i
                            class='bx bx-math'></i> {{ languagePack["SOLVE_FLAST"] }}</a></li>
                <li class="tab" @click="() => { isSolveDisplay = 2; isShowLeft = !isShowLeft }"><a><i
                            class='bx bx-group'></i> {{ languagePack["TALK_AI"] }}</a></li>
            </ul>
        </div>
        <div class="chat-messages">
            <div class="form" v-if="isSolveDisplay == 2">
                <div class="title">
                    <h1>{{ fullInfo.name }}</h1>
                </div>
                <div class="messages message-content-ows">
                    <div class="message" v-for="(item, index) in listMessages" :key="index">
                        <div :class="item.role == 'user' ? `message_content you` : `message_content`">
                            <div class="user flex">
                                <img v-if="item.role != 'user'" width="30" height="30"
                                    src="../assets/images/logo_icon.png" alt="">
                                <div class="name">
                                    <h2 v-if="item.role != 'user'">AI 1.5</h2>
                                    <h2 v-else>You</h2>
                                </div>
                            </div>
                            <div class="msg">
                                <MsgContentView :msg="item" :load="false" />
                            </div>
                        </div>
                    </div>
                    <div class="emptyMessages" v-if="listMessages.length == 0">
                        <h2><span style="color: orange;">M</span>athS<span style="color:#01998b;">na</span>p <span
                                style="color: orange;">AI</span></h2>
                        <p>{{ languagePack["SOLVE_AI_FLAST"] }}</p>
                    </div>
                </div>
                <div class="chat-input">
                    <div class="chat-input__content">
                        <div class="base64" v-if="imageBase64">
                            <div class="close"><label @click="imageBase64 = ''">X</label></div>
                            <img :src="imageBase64" alt="">
                        </div>
                        <textarea @keyup.enter="sendEnter($event)" v-model="txtMessgae"
                            :placeholder="languagePack['YOUR_PROGRAM']"></textarea>
                        <div class="button-atritte">
                            <button @click="isChooseImg = true" class="calmera"><i class='bx bx-camera'></i></button>
                            <button @click="senMessage()" class="send"><i class='bx bxs-send'></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form" v-if="isSolveDisplay == 1">
                <div class="solve" style="margin-top: 50px;">
                    <div class="solve_view message-content-ows">
                        <div class="title flex" style="align-items: center;">
                            <img width="70" src="../assets/images/395200-200.png" alt="">
                            <div class="tis">
                                <h1 style="margin: 0;text-align: start;">{{ fullInfo.name }}</h1>
                                <p style="margin: 0;text-align: start;">{{ fullInfo.slogan }}</p>
                            </div>
                        </div>
                        <div class="demo">
                            <input hidden id="file" capture="camera" type="file" @change="onFileChange"
                                accept="image/*" />
                            <div class="imageBase64" v-if="imageBase64" style="margin-top: 20px;">
                                <img class="localImage" ref="imageRef" :src="imageBase64" style="max-width: 100%;" />
                            </div>
                            <!-- <CropNhung @update:finish="finish" @update:close="close" /> -->
                            <div v-else class="empty"
                                style="border: 1px dashed #00365d;border-radius: 10px;text-align: center;padding: 50px;">
                                <i style="font-size: 5em;opacity: 0.7;" class='bx bx-cloud-upload'></i>
                                <div class="text">
                                    <span @click="chooseSolve(false)" style="color: blue;">{{ languagePack["CAPTURE"]
                                        }}</span> {{ languagePack["SOLVE_LIB"] }} <span style="color: blue;"
                                        @click="chooseSolve(true)">{{ languagePack["SOLVE_LIBARY"] }}</span>
                                </div>
                            </div>
                            <img :src="croppedImage" style="width: 100%;" alt="">
                            <!-- <h2 class="text_demo" v-else>Chưa chọn hình ảnh</h2> -->
                        </div>
                        <div class="step">
                            <label class="flex">
                                <h1>{{ fullInfo.short }} <sup style="font-size: 0.55em;font-weight: 300;">{{
                                        languagePack["SOLVE_QUICK_FLAST"] }}</sup></h1>
                            </label>
                            <MsgContentView v-if="msgSnap" :msg="msgSnap" :load="false" />
                        </div>
                        <div class="pending">
                            <span v-if="isSnapLoading" class="loader"></span>
                        </div>
                        <div class="input-additional">
                            <textarea rows="5" v-model="txtMessgae" type="text"
                                :placeholder="languagePack['YOUR_PROGRAM_PLUS_DETAIL']"></textarea>
                        </div>
                    </div>
                    <div class="action">
                        <button class="btn_trash" v-if="imageBase64" @click="btn_trash"><i
                                class='bx bx-trash'></i></button>
                        <button class="btn_camera" @click="chooseSolve(false)">
                            <i class='bx bx-camera'></i> {{ languagePack["RE_CAPTURE"] }}
                        </button>
                        <button class="btn_camera" @click="solveFlast">
                            <i v-if="isSnapLoading" class='bx bx-loader-circle bx-spin'></i> {{ languagePack["SOLVE"] }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="crop" v-if="isChooseImg">
        <div class="crop_content">
            <CropView @update:finish="finish" @update:close="close" />
        </div>
    </div>
</template>

<style scoped>
.pending {
    box-sizing: border-box;
}

.emptyMessages {
    text-align: center;
    padding-top: 30%;
}

ul {
    margin: 0;
    padding: 0;
    margin: 5px;
}

li {
    list-style: none;
    padding: 15px;
    border: 1px solid #00365d34;
    background: #0763a5;
    border-radius: 7px;
    margin-top: 5px;
}

li i {
    color: white;
}

li a {
    color: white;
}

.sub-left {
    visibility: hidden;
    opacity: 0;
    transition: all 0.5s;
}

.showleft {
    visibility: visible;
    opacity: 1;
}

.loader {
    width: 100%;
    height: 4.8px;
    display: inline-block;
    position: relative;
    background: rgba(255, 255, 255, 0.15);
    overflow: hidden;
}

.loader::after {
    content: '';
    width: 96px;
    height: 4.8px;
    background: #00365d;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    animation: hitZak 1s linear infinite alternate;
}

@keyframes hitZak {
    0% {
        left: 0;
        transform: translateX(-1%);
    }

    100% {
        left: 100%;
        transform: translateX(-99%);
    }
}

/* math-field {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    font-size: 1rem;
} */
.input-additional textarea {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px dashed #00365d;
    border-radius: 5px;
}

.input-additional textarea:focus {
    outline: 1px dashed greenyellow;
}

.input-additional button {
    width: 40px;
    height: 40px;
    padding: 0px;
    border: none;
    background: none;
    font-size: 1.6em;
    position: absolute;
    top: 10px;
    right: 20px;
    cursor: pointer;
}

.demo {
    padding: 10px;
}

.text_demo {
    text-align: center;
}

.demo img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    box-shadow: 1px 2px 6px 1px #00365d54;
    border-radius: 15px;
    margin-top: 10px;
    border: 2px solid #00365db6;
}

.input-additional {
    padding: 10px;
    position: relative;
}

.step {
    padding: 10px;
}

.solve {
    padding: 10px;
}

.solve_view {
    max-height: 70dvh;
    box-shadow: 1px 2px 6px 1px #00365d54;
    width: calc(100%);
    max-width: 1000px;
    margin: auto;
    overflow-y: auto;
    border-radius: 10px;
}

.action {
    width: 100%;
    text-align: end;
    /* margin-top: -40px; */
}

.btn_trash {
    box-shadow: 1px 2px 6px 1px #00365d54;
    background: none;
    border: 1px solid #ff0000fb;
    border-radius: 7px;
    font-size: 1em;
    margin-right: 5px;
    margin-top: 5px;
    padding: 12px 10px;
}

.btn_trash i {
    color: #ff0000fb;
}

.btn_trash:hover i {
    color: white;
}

.btn_trash:hover {
    background: #ff1515;
}

.btn_camera {
    box-shadow: 1px 2px 6px 1px #00365d54;
    background: none;
    border: 1px solid #00365d59;
    border-radius: 7px;
    font-size: 1em;
    margin-right: 5px;
    min-width: 150px;
    margin-top: 5px;
    padding: 12px 10px;
}

.btn_camera:hover {
    background: #00365d;
    color: white;
}

.base64 {
    position: relative;
    width: 160px;

}

.base64 .close {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
}

.base64 img {
    width: 100%;
}

.crop {
    position: fixed;
    top: 5%;
    left: 0;
    z-index: 10;
    width: 100%;
}

.crop_content {
    width: calc(100% - 40px);
    max-width: 800px;
    background: #ffffff;
    border: 1px solid #00365d88;
    border-radius: 10px;
    box-shadow: 1px 2px 6px 1px #00365d54;
    padding: 10px;
    margin: auto;
    max-height: 80dvb;
    overflow-y: auto;
}

.button-group {
    display: none;
    padding: 10px 0;
    position: absolute;
    z-index: 9;
}

.button-group button {
    font-size: 2.5em;
    background: none;
    border: none;
    padding: 0;
}

.chat {
    max-width: 1000px;
    margin: auto;
    height: calc(100vb - 120px);
    position: relative;
    padding: 0 10px;
}

.chat-nav {
    width: 200px;
}

.tabs {
    width: 200px;
    margin: 0;
    padding: 0;
    padding: 20px 0;
}

.tab {
    list-style: none;
    padding: 20px 15px;
    margin-top: 5px;
    cursor: pointer;
    background: #00365d;
    border-radius: 10px;
    box-shadow: 1px 2px 6px 1px #00365d54;
    transition: all 0.5s;
}

.tab:hover {
    background: white;
}

.tab a,
.tab i {
    color: white;
}

.tab:hover a,
.tab:hover i {
    color: #00365d;
}

.chat-messages {
    width: calc(100% - 200px);
    /* padding: 10px; */
}

.form {
    width: 100%;
    height: calc(100vb - 150px);
    position: relative;
}

.form h1 {
    font-size: 1.5em;
}

.title {
    text-align: center;
    width: 100%;
}

/* chat input */
.chat-input {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    cursor: pointer;
}

.chat-input__content {
    width: calc(100% - 10px);
    max-width: 650px;
    margin: auto;
    padding: 5px;
    border-radius: 5px;
    box-shadow: 1px 2px 6px 1px #a2a5a728;
}

.chat-input__content textarea {
    width: calc(100% - 20px);
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 35px;
    border: none;
}

.chat-input__content textarea:focus {
    outline: 1px dotted green;
}

.button-atritte {
    position: relative;
}

button {
    cursor: pointer;
}

.chat-input__content .send {
    position: absolute;
    top: -30px;
    right: 2px;
    background: none;
    border: none;
    font-size: 1.5em;
}

.chat-input__content .calmera {
    position: absolute;
    top: -30px;
    left: 12px;
    background: none;
    border: none;
    font-size: 1.5em;
}

.messages {
    max-height: calc(100vb - 270px);
    /* background: rgba(128, 128, 128, 0.062); */
    border-radius: 10px;
    overflow-y: auto;
}

.messages::-webkit-scrollbar {
    width: 6px;
    background-color: #F5F5F5;
}

.messages::-webkit-scrollbar-thumb {
    background-color: #4d4d4d;
}

.message {
    margin-top: 12px;
    cursor: pointer;
}

.message .message_content {
    max-width: 85%;
    /* border: 1px solid rgba(128, 128, 128, 0.082); */
    /* box-shadow: 1px 2px 6px 1px #00365d17; */
    padding: 10px;
    border-radius: 7px;
}

.you .user {
    justify-content: end;
}

.user img {
    border-radius: 50%;
    box-shadow: 1px 2px 4px 1px #daf0ffee;
    padding: 2px;
    background: #00365d;
}

.you {
    text-align: end;
    margin-left: auto;
}

.msg p {
    margin: 0;
}

/*  */
.user {
    align-items: center;
}

.user .name {
    margin-left: 10px;
    margin-right: 10px;
}

.user h2 {
    margin: 0;
    font-size: 1.2em;
    font-weight: 550;
    padding-top: 2px;
}

.message_content .msg {
    padding: 10px;
}

@media (max-width:624px) {
    .button-group {
        display: block;
    }

    .chat-nav {
        visibility: hidden;
        opacity: 0;
        width: 0;
    }

    .chat-messages {
        width: calc(100% - 200px);
        width: 100%;
    }

    .btn_camera {
        min-width: 100px;
    }
}
</style>