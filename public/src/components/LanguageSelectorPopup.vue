<template>
    <div class="language-selector-overlay" v-if="isVisible" @click.self="closeIfNotPersistent">
        <div class="language-selector-container" :class="{ 'shake-animation': showAnimation }">
            <div class="popup-header">
                <div class="popup-icon">
                    <span>🌍</span>
                </div>
                <button class="popup-close" @click="close" v-if="!isPersistent">×</button>
            </div>

            <div class="popup-content">
                <h2 class="popup-title">{{ $t('LANGUAGE_SELECTOR_TITLE') }}</h2>
                <p class="popup-message">{{ $t('LANGUAGE_SELECTOR_MESSAGE') }}</p>

                <div class="language-options">
                    <div v-for="(language, code) in availableLanguages" :key="code" class="language-option"
                        @click="selectAndSaveLanguage(code)">
                        <div class="flag-container">
                            <img :src="getFlagUrl(code)" :alt="language.name" class="flag-image">
                        </div>
                        <div class="language-name">{{ $t(language.langKey) }}</div>
                        <div class="language-native">{{ language.nativeName }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: true
    },
    isPersistent: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['close', 'language-changed']);
const { locale } = useI18n();
const showAnimation = ref(false);

const availableLanguages = {
    'vi': {
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        flagCode: 'vn',
        langKey: 'LANGUAGE_VIETNAMESE'
    },
    'en': {
        name: 'English',
        nativeName: 'English',
        flagCode: 'gb',
        langKey: 'LANGUAGE_ENGLISH'
    },
    'fr': {
        name: 'French',
        nativeName: 'Français',
        flagCode: 'fr',
        langKey: 'LANGUAGE_FRENCH'
    },
    'de': {
        name: 'German',
        nativeName: 'Deutsch',
        flagCode: 'de',
        langKey: 'LANGUAGE_GERMAN'
    },
    'es': {
        name: 'Spanish',
        nativeName: 'Español',
        flagCode: 'es',
        langKey: 'LANGUAGE_SPANISH'
    },
    'zh': {
        name: 'Chinese',
        nativeName: '中文',
        flagCode: 'cn',
        langKey: 'LANGUAGE_CHINESE'
    },
    'ja': {
        name: 'Japanese',
        nativeName: '日本語',
        flagCode: 'jp',
        langKey: 'LANGUAGE_JAPANESE'
    },
    'ko': {
        name: 'Korean',
        nativeName: '한국어',
        flagCode: 'kr',
        langKey: 'LANGUAGE_KOREAN'
    }
};

// Show animation when popup first appears
watch(() => props.isVisible, (newValue) => {
    if (newValue) {
        showAnimation.value = true;
        setTimeout(() => {
            showAnimation.value = false;
        }, 600);
    }
});

// Methods
const close = () => {
    emit('close');
};

const closeIfNotPersistent = () => {
    if (!props.isPersistent) {
        close();
    }
};

const getFlagUrl = (languageCode) => {
    const countryCode = availableLanguages[languageCode]?.flagCode || languageCode;
    return `https://flagcdn.com/48x36/${countryCode}.png`;
};

const selectAndSaveLanguage = (code) => {
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', code);

    // Change the application language
    locale.value = code;

    // Emit event for parent component
    emit('language-changed', code);

    // Close the popup
    close();
};

// Check if this is first visit
onMounted(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        locale.value = savedLanguage;
    }
});
</script>

<style scoped>
.language-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(15, 23, 42, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    backdrop-filter: blur(6px);
    animation: fadeIn 0.3s ease-out;
}

.language-selector-container {
    background-color: white;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 90%;
    max-width: 800px;
    overflow: hidden;
    animation: slideUp 0.4s ease-out;
    transform-origin: center;
}

.popup-header {
    position: relative;
    padding: 30px;
    display: flex;
    justify-content: center;
    background-image: linear-gradient(90deg, var(--primary-color), var(--primary-color));
}

.popup-icon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    background-color: white;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: 1;
    margin-bottom: -35px;
}

.popup-close {
    position: absolute;
    right: 20px;
    top: 15px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 24px;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.popup-close:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
}

.popup-content {
    padding: 40px 30px 30px;
    text-align: center;
}

.popup-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 15px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.popup-message {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 25px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
}

.language-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    max-width: 750px;
    margin: 0 auto;
}

.language-option {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.language-option:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: #bfdbfe;
    background-color: #f0f9ff;
}

.language-option:active {
    transform: translateY(0);
    background-color: #e0f2fe;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.1s;
}

.flag-container {
    width: 48px;
    height: 36px;
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.flag-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.language-name {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
}

.language-native {
    font-size: 0.85rem;
    color: #64748b;
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.shake-animation {
    animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {

    10%,
    90% {
        transform: translateX(-1px);
    }

    20%,
    80% {
        transform: translateX(2px);
    }

    30%,
    50%,
    70% {
        transform: translateX(-2px);
    }

    40%,
    60% {
        transform: translateX(2px);
    }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .language-selector-container {
        width: 95%;
    }

    .popup-header {
        padding: 20px;
    }

    .popup-icon {
        width: 60px;
        height: 60px;
        font-size: 28px;
        margin-bottom: -30px;
    }

    .popup-content {
        padding: 35px 20px 25px;
    }

    .popup-title {
        font-size: 1.5rem;
    }

    .popup-message {
        font-size: 1rem;
    }

    .language-options {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
}

@media (max-width: 480px) {
    .language-options {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>