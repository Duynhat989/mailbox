<script setup>
import { ref, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { languagePack, localtionsLang, setLanguage } from '@/languages';
import store from '@/store';

const isLogin = computed(() => store.getters.isLogin);

const programs = [
  {
    image: "https://cdn-icons-png.flaticon.com/512/2106/2106584.png",
    name: "Math Snap AI",
    short: "MathSnap",
    future: [
      languagePack["FUTURE_MATH_1"],
      languagePack["FUTURE_MATH_2"],
      languagePack["FUTURE_MATH_3"],
      languagePack["FUTURE_MATH_4"],
      languagePack["FUTURE_MATH_5"],
      languagePack["FUTURE_MATH_6"]
    ],
    slogan: languagePack["MATH_SLOGAN"],
    slug: "/chat/mathsnap",
    solve: "math"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/256/8716/8716846.png",
    name: "Chemistry Snap AI",
    short: "ChemistrySnap",
    future: [
      languagePack["FUTURE_CHEMISTY_1"],
      languagePack["FUTURE_CHEMISTY_2"],
      languagePack["FUTURE_CHEMISTY_3"],
      languagePack["FUTURE_CHEMISTY_4"],
      languagePack["FUTURE_CHEMISTY_5"],
      languagePack["FUTURE_CHEMISTY_6"]
    ],
    slogan: languagePack["CHEMISTY_SLOGAN"],
    slug: "/chat/chemistrysnap",
    solve: "chemistry"
  }
]

localStorage.setItem('extraData', JSON.stringify(programs));
const router = useRouter();
const noLogin = async () => {
  window.postMessage({
    name: "openAuth"
  })
}
const isShowDialogShare = ref(false)

const changeLocaltion = async (lang)=>{
  setLanguage(lang)
  location.reload()
}
</script>

<template>
  <section>
    <div class="banner">
      <img src="../assets/images/banner.png" alt="">
    </div>
  </section>
  <section>
    <div class="slogan">
      <h1>MathSnap - {{ languagePack["SOLVE_SMART"] }}</h1>
      <p>{{ languagePack["SOLVE_DETAIL"] }}</p>
      <h3>{{ languagePack["SOLVE_FREE"] }}</h3>
    </div>
  </section>
  <section>
    <div class="tabs">
      <div class="tab" v-for="(item, index) in programs" :key="index">
        <div class="tab_content">
          <div class="title">
            <img width="60" :src="item.image" alt="">
            <h2>{{ item.name }}</h2>
          </div>
          <div class="future">
            <ul>
              <li class="line" v-for="(item1, index1) in item.future" :key="index1">
                <a>{{ item1 }}</a>
              </li>
            </ul>
          </div>
          <div class="used">
            <a v-if="!isLogin" @click="noLogin()" class="button">{{ languagePack["USED_TO"] }} <i
                class='bx bx-right-arrow-alt'></i></a>
            <RouterLink v-else :to="{ path: item.slug, state: { key: item } }" class="button">{{ languagePack["USED_TO"]
              }} <i class='bx bx-right-arrow-alt'></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="footer_content">
      <!-- Ngôn ngữ -->
      <div class="languages">
        <div class="languages_content flex">
          <label style="width: 100px;">{{ languagePack["LANGUAGE"] }}: </label>
          <ul class="flex">
            <li><a :class="localtionsLang == `EN` ? 'hover':''" @click="changeLocaltion('EN')">English</a></li>
            <li><a :class="localtionsLang == `VN` ? 'hover':''" @click="changeLocaltion('VN')">Vietnamese</a></li>
            <li><a :class="localtionsLang == `CN` ? 'hover':''" @click="changeLocaltion('CN')">Chinese</a></li>
            <li><a :class="localtionsLang == `HI` ? 'hover':''" @click="changeLocaltion('HI')">Hindi</a></li>
            <li><a :class="localtionsLang == `ES` ? 'hover':''" @click="changeLocaltion('ES')">Spanish</a></li>
            <li><a :class="localtionsLang == `AR` ? 'hover':''" @click="changeLocaltion('AR')">Arabic</a></li>
          </ul>
        </div>
      </div>
      <div class="footer_title">
        <h2>MathSnap</h2>
      </div>
      <div class="footer_description">
        <p>{{ languagePack["SOLVE_FREE_IS"] }}</p>
      </div>
    </div>
  </footer>
  <!-- pôpuip share -->
  <div class="share" v-if="isShowDialogShare">
    <div class="share_content">
      <div class="share_form">
        <div class="title">
          <h1>Chương trình khuyến mãi</h1>
        </div>
        <div class="content">
          <h4>Nhận ngay ngay</h4>
          <h1>30</h1>
          <h4>lượt hỏi</h4>
          <h4>Khi chia sẻ ứng dụng lên mạng xã hội</h4>
        </div>
        <div class="action">
          <a class="btn flex" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http://192.168.1.7:9999/&quote=xin chào
"><img width="20" height="20" src="../assets/images/facebook-129.png" alt="">
            <h3>Chia sẻ ngay <i class='bx bx-right-arrow-alt'></i></h3>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.languages_content{
  padding: 10px;
}
.languages_content ul{
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}
.languages_content li{
  list-style: none;
  cursor: pointer;
  margin-bottom: 15px;
}
.languages_content li:hover a{
  color: blue;
  text-decoration: underline;
}
.languages_content li .hover{
  color: blue;
  text-decoration: underline;
}
.share {
  position: fixed;
  width: 100%;
  top: 16%;
  left: 0;
}

.share_content {
  padding: 10px;
}

.share_form {
  box-sizing: border-box;
  width: 100%;
  max-width: 600px;
  margin: auto;
  background: white;
  box-shadow: 1px 2px 6px 1px #00365d54;
  border-radius: 7px;
  min-height: 300px;
  padding: 10px;
}

.title h1 {
  text-align: center;
  font-size: 1.5em;
}

.share .content {
  text-align: center;
  padding: 30px;
}

.share .content h4 {
  text-align: center;
  margin: 0;
  margin-bottom: 10px;
}

.share .content h1 {
  font-size: 5em;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  margin: 0;
}


.share .action a {
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.share .action .btn {
  /* border: 1px solid rgba(68, 68, 68, 0.24); */
  max-width: 180px;
  border-radius: 8px;
  margin: auto;
  cursor: pointer;
}

.share .action .btn h3 {
  margin: 0;
  font-size: 1em;
  padding: 10px;
}

.slogan {
  padding: 10px;
  max-width: 600px;
  margin: auto;
  text-align: center;
}

section {
  padding: 10px;
  margin-top: 10px;
}

section .banner img {
  width: 100%;
}

.tabs {
  margin: auto;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-wrap: wrap;
}

.tab {
  width: calc((100% - 40px) / 2);
  padding: 10px;
}

.tab_content {
  border: 1px solid rgba(128, 128, 128, 0.226);
  border-radius: 7px;
  min-height: 50px;
  padding: 25px 40px;
  padding-bottom: 40px;
}

.tab_content h2 {
  font-size: 1.9em;
}

.future .line {
  padding: 12px 0;
}

.used {
  text-align: center;
}

.used .button {
  padding: 12px 60px;
  margin-top: 15px;
  border: none;
  background: none;
  box-shadow: 1px 2px 6px 1px #00365d54;
  transition: all 0.5s;
  border-radius: 5px;
  cursor: pointer;
}

.used .button:hover {
  background: #00365d;
  color: white;
}

.used .button:hover i {
  color: white;
}

@media (max-width:700px) {
  .tab {
    width: 100%;
  }

  .banner {
    padding: 10px 0;
    padding-top: 50px;
  }
}

.footer_content {
  padding: 40px 0;
  width: 100%;
  max-width: 1080px;
  margin: auto;
  text-align: center;
}

@media (max-width: 654px) {
  .footer_description {
    padding: 0 20px;
    line-height: 1.5em;
  }
}
</style>