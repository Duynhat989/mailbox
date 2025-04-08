<script setup>
import { onMounted, ref, watch } from 'vue';

const active = ref('month')

const packagePrice = ref(null)

const pack = {
    month: {
        plus: 10,
        max: 30,
        unitText: 'month',
        notify: "Thanh toán hàng tháng đến khi hủy"
    },
    year: {
        plus: 79,
        max: 249,
        unitText: 'year',
        notify: "Thanh toán hàng năm đến khi hủy"
    }
}
watch(active, (old, bew) => {
    packagePrice.value = pack[active.value]
})
onMounted(() => {
    packagePrice.value = pack[active.value]
})

</script>

<template>
    <div class="upgrade">
        <div class="upgrade_content">
            <div class="switch">
                <div class="groups">
                    <button @click="active = 'month'" :class="active == 'month' ? 'active' : ''"
                        style="margin-right: 2px;">Month</button>
                    <button @click="active = 'year'" :class="active == 'year' ? 'active' : ''">Year</button>
                </div>
            </div>
            <div class="packages flex" v-if="packagePrice">
                <div class="package">
                    <div class="package_content">
                        <div class="package_title">
                            <h1>Free</h1>
                        </div>
                        <div class="price flex">
                            <h1>$0</h1><span>/{{ packagePrice.unitText }}</span>
                        </div>
                        <div class="action">
                            <button disabled>Try it</button>
                        </div>
                        <div class="notify">
                            <span>Not pay</span>
                        </div>
                        <div class="detail">
                            <div class="detail_content">
                                <ul>
                                    <li class="line"><i class='bx bx-check'></i> 10 requests per day</li>
                                    <li class="line"><i class='bx bx-check'></i> 1 GB storage</li>
                                    <li class="line"><i class='bx bx-check'></i> Limit 3 requests per minute</li>
                                    <li class="line opacity"><i class='bx bx-x'></i> API Connect</li>
                                    <li class="line"><i class='bx bx-check'></i> Use model snap-1.2</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="package">
                    <div class="package_content">
                        <div class="package_title">
                            <h1>Plus</h1>
                        </div>
                        <div class="price flex">
                            <h1>${{ packagePrice.plus }}</h1><span>/{{ packagePrice.unitText }}</span>
                        </div>
                        <div class="action">
                            <button>Get Plus</button>
                        </div>
                        <div class="notify">
                            <span>{{ packagePrice.notify }}</span>
                        </div>
                        <div class="detail">
                            <div class="detail_content">
                                <ul>
                                    <li class="line"><i class='bx bx-check'></i> 100 requests per day</li>
                                    <li class="line"><i class='bx bx-check'></i> 100 GB storage</li>
                                    <li class="line"><i class='bx bx-check'></i> Limit 100 requests per minute</li>
                                    <li class="line"><i class='bx bx-check'></i> API connect snap-2.5</li>
                                    <li class="line"><i class='bx bx-check'></i> Use model snap-2.5</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="package">
                    <div class="package_content">
                        <div class="package_title">
                            <h1>Max</h1>
                        </div>
                        <div class="price flex">
                            <h1>${{ packagePrice.max }}</h1><span>/{{ packagePrice.unitText }}</span>
                        </div>
                        <div class="action">
                            <button>Get Max</button>
                        </div>
                        <div class="notify">
                            <span>{{ packagePrice.notify }}</span>
                        </div>
                        <div class="detail">
                            <div class="detail_content">
                                <ul>
                                    <li class="line"><i class='bx bx-check'></i> 1000 requests per day</li>
                                    <li class="line"><i class='bx bx-check'></i> 500 GB storage</li>
                                    <li class="line"><i class='bx bx-check'></i> Unlimit requests</li>
                                    <li class="line"><i class='bx bx-check'></i> API connect snap-3.5</li>
                                    <li class="line"><i class='bx bx-check'></i> Use model snap-3.5</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.upgrade {
    padding: 15px;
}

.packages {
    justify-content: center;
    flex-wrap: wrap;
}

.package {
    width: calc(100% / 3);
    max-width: 300px;
    min-width: 250px;
    padding: 10px;
}

.package_content {
    /* padding: 20px; */
    box-shadow: 2px 2px 6px 1px #00365d49;
    border-radius: 7px;
    /* min-height: 300px; */
}

.package_title {
    padding: 15px;
}

.package_title h1 {
    margin: 10px;
}

h1 {
    font-size: 2.5em;
    margin: 0;
}

.action {
    text-align: center;
}

.action button {
    padding: 10px;
    min-width: 180px;
    border-radius: 7px;
    border: 1px solid rgba(128, 128, 128, 0.164);
    background: #00365d;
    color: white;
    cursor: pointer;
}

.price {
    padding: 15px;
    padding-top: 0;
}

.price h1 {
    font-size: 4em;
}

.detail {
    background: rgba(165, 165, 165, 0.24);
    margin-top: 20px;
}

ul {
    padding: 0 15px;
}

.detail_content {
    padding: 5px;
}

.detail_content li {
    padding: 8px;
    font-size: 1.1em;
    list-style: none;
    display: flex;
    align-items: center;
}

.detail_content li i {
    font-size: 1.5em;
    margin-right: 5px;
}

.groups {
    text-align: center;
    border-radius: 30px;
    background: #00365d42;
    width: 242px;
    margin: 15px auto;
    padding: 2px;
}

.groups button {
    padding: 8px;
    width: 120px;
    border-radius: 30px;
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.5s;
}

.groups .active {
    border: 1px solid rgba(85, 85, 85, 0.349);
    background: #00365d;
    color: white;
    cursor: pointer;
}

.opacity {
    color: rgba(128, 128, 128, 0.534);
}

.opacity i {
    color: rgba(128, 128, 128, 0.534);
}

.notify {
    margin: 10px;
    font-size: 0.85em;
    text-align: center;
}

@media (max-width: 654px) {
    .package {
        width: 100%;
        max-width: 400px;
    }
}
</style>