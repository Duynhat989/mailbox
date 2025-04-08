<script setup>
import { languagePack } from '@/languages';
import store from '@/store';
import { computed, ref } from 'vue'


document.title = "Trang cá nhân"
const tab = ref(1)

const user = computed(() => store.getters.getUser);

</script>

<template>
    <div class="profile">
        <div class="profile_content">
            <div class="cover">
                <div class="img">
                    <img src="../assets/images/cover.png" alt="">
                </div>
            </div>
            <div class="information">
                <div class="information_content flex">
                    <div class="avata">
                        <div class="avata_content">
                            <img src="../assets/images/avatar.png" alt="">
                        </div>
                    </div>
                    <div class="info">
                        <div class="name">
                            <h1>{{ user.name }}</h1>
                            <p><span>0</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content">
                <!-- <hr style="color: #00365d;"> -->
                <div class="tabs flex">
                    <div class="tab"><button @click="tab = 1" :class="tab == 1 ? 'choose' : ''" type="button">{{ languagePack['ABOUT'] }}</button></div>
                    <!-- <div class="tab"><button @click="tab = 2" :class="tab == 2 ? 'choose' : ''" type="button">Thảo
                            luận</button></div>
                    <div class="tab"><button @click="tab = 3" :class="tab == 3 ? 'choose' : ''" type="button">Hướng
                            dẫn</button></div>
                    <div class="tab"><button @click="tab = 4" :class="tab == 4 ? 'choose' : ''"
                            type="button">Videos</button></div>
                    <div class="tab"><button @click="tab = 5" :class="tab == 5 ? 'choose' : ''" type="button">Lịch sử hoạt
                            động</button></div> -->
                </div>
                <div class="views flex">
                    <div class="about">
                        <div class="about_content">
                            <h4>{{ languagePack['ABOUT'] }}</h4>
                            <div class="bio">
                                <h3 style="margin: 10px;">WhatApp AD: +84 984 929 813</h3>
                                <!-- <div>https://adviseplugin.com/</div> -->
                                <button>{{ languagePack['EDIT'] }}</button>
                            </div>
                            <div class="pack">
                                <label>{{ languagePack['INFORMATION_DETAIL'] }}</label>
                                <div class="row">{{ languagePack['LICENSE'] }}: <span class="hightline">{{ languagePack['FREE'] }}</span></div>
                                <div class="row">{{ languagePack['LICENSE_LIMIT'] }}: <span class="hightline">{{ languagePack['NO_LIMIT'] }}</span></div>
                                <div class="row">{{ languagePack['LIMIT'] }}: <span class="hightline">{{ languagePack['QUESTION'] }}</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="posts">
                        <div class="posts_content">
                            .
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.profile {
    padding: 15px;
    max-width: 1200px;
    margin: auto;
}

.cover {
    width: 100%;
}

.img img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
}

.information {
    position: relative;
}

.information_content {
    position: absolute;
    top: -130px;
    left: 15px;
    align-items: center;
}

.avata {
    border-radius: 50%;
    width: 150px;
    height: 150px;
}

.avata_content {
    width: 100%;
}

.avata img {
    background: white;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid #00365d49;
    box-shadow: 2px 2px 6px 1px #00365d49;
}

.info {
    margin-left: 30px;
}

.info p,
.info h1,
.info span {
    margin: 0;
    color: white;
    margin-bottom: 10px;
}

.content {
    padding-top: 18px;
}

.content .tabs {
    margin-top: 20px;
}

.content .tabs button {
    padding: 10px;
    min-width: 100px;
    border: none;
    background: none;
    cursor: pointer;
}

.choose {
    border-bottom: 2px solid #00365d !important;
}

.views{
    flex-wrap: wrap;
}
.about {
    width: 35%;
    min-width: 300px;
}

.about .about_content {
    padding: 10px;
    box-shadow: 2px 2px 6px 1px #00365d28;
    max-width: 350px;
    margin: auto;
    margin-top: 20px;
    border-radius: 10px;
    min-height: 200px;
}
.about_content .bio{
    text-align: center;
}
.bio button{
    border: 1px solid rgba(128, 128, 128, 0.342);
    background: white;
    padding: 10px;
    width: calc(100% - 20px);
    border-radius: 7px;
    margin: 15px 0;
}
.posts {
    width: 65%;
    min-width: 300px;
}
.posts_content{
    margin-top: 20px;
    padding: 10px;
}
.posts .posts_content {
    padding: 10px;
    /* box-shadow: 2px 2px 6px 1px #00365d28; */
    margin: auto;
    margin-top: 20px;
    border-radius: 10px;
    min-height: 200px;
}
.pack label{
    display: block;
    margin-bottom: 10px;
    font-size: 1.2em;
    font-weight: 550;
}
.pack .row{
    margin-bottom: 8px;
}
.pack .row .hightline{
    font-weight: 550;
}


@media (max-width: 900px) {
    .about,.posts{
        width: 100%;
    }
    .about_content{
        max-width: 1000px !important;
    }
}
</style>