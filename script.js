const translations = {
    'es': {
        greeting: 'Hola de nuevo!',
        langButton: 'Idioma',
        tagline: 'Inicia sesión para acceder a tu panel personalizado',
        email: 'Correo electrónico',
        password: 'Contraseña',
        login: 'Iniciar Sesión',
        
        location_placeholder: 'Ubicación',
        temp_placeholder: 'Temperatura',
        description_placeholder: 'Descripción',
        feels_like_placeholder: 'Sensación térmica',
        hourly_forecast_title: 'Pronóstico por Horas',
        additional_info_title: 'Información Adicional',
        humidity_label: 'Humedad',
        wind_speed_label: 'Velocidad Viento',
        pressure_label: 'Presión'
    },
    'en': {
        greeting: 'Welcome back!',
        langButton: 'Language',
        tagline: 'Log in to access your personalized dashboard',
        email: 'Email address',
        password: 'Password',
        login: 'Log In',
        
        location_placeholder: 'Location',
        temp_placeholder: 'Temperature',
        description_placeholder: 'Description',
        feels_like_placeholder: 'Feels like',
        hourly_forecast_title: 'Hourly Forecast',
        additional_info_title: 'Additional Information',
        humidity_label: 'Humidity',
        wind_speed_label: 'Wind Speed',
        pressure_label: 'Pressure'
    }
};

const greetingText = document.getElementById('greetingText');
const langText = document.getElementById('langText');
const taglineText = document.getElementById('taglineText');
const emailPlaceholder = document.getElementById('emailPlaceholder');
const passwordPlaceholder = document.getElementById('passwordPlaceholder');
const loginButton = document.getElementById('loginButton');

const languageSelector = document.getElementById('languageSelector');
const languageDropdown = document.getElementById('languageDropdown');
const langOptions = document.querySelectorAll('.lang-option');

let currentLang = 'es';

function updateContent() {
    greetingText.textContent = translations[currentLang].greeting;
    langText.textContent = translations[currentLang].langButton;
    taglineText.textContent = translations[currentLang].tagline;
    emailPlaceholder.placeholder = translations[currentLang].email;
    passwordPlaceholder.placeholder = translations[currentLang].password;
    loginButton.textContent = translations[currentLang].login;
    document.documentElement.lang = currentLang;
}

languageSelector.addEventListener('click', (event) => {
    event.stopPropagation();
    languageDropdown.classList.toggle('show');
});

document.addEventListener('click', (event) => {
    if (!languageSelector.contains(event.target) && !languageDropdown.contains(event.target)) {
        languageDropdown.classList.remove('show');
    }
});

langOptions.forEach(option => {
    option.addEventListener('click', () => {
        currentLang = option.dataset.lang;
        updateContent();
        languageDropdown.classList.remove('show');
    });
});

// Funcionalidad de redirección al hacer clic en Iniciar Sesión
loginButton.addEventListener('click', () => {
    // Aquí podrías añadir validación de correo/contraseña antes de redirigir (solo redirigimos directamente)
    window.location.href = 'weather.html'; 
});

document.addEventListener('DOMContentLoaded', updateContent);