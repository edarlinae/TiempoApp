const API_KEY = ''; // Reemplaza con tu clave de API de OpenWeatherMap
const forecastCityName = document.getElementById('forecastCityName');
const fiveDayForecastContent = document.getElementById('fiveDayForecastContent');
const themeToggleForecast = document.getElementById('themeToggleForecast');
const backToWeather = document.getElementById('backToWeather');
const refreshForecast = document.getElementById('refreshForecast');
const body = document.body;

let currentForecastLocation = null; 

// Definir las traducciones para esta interfaz
const forecastTranslations = {
    'es': {
        today: 'Hoy',
        tomorrow: 'Mañana',
        loading_city: 'Cargando Ciudad...',
        error_message: 'No se pudieron cargar los datos del pronóstico. Inténtalo de nuevo.',
        feels_like: 'Sensación térmica:',
        humidity: 'Humedad',
        wind_speed: 'Viento',
        pressure: 'Presión'
    },
    'en': {
        today: 'Today',
        tomorrow: 'Tomorrow',
        loading_city: 'Loading City...',
        error_message: 'Could not load forecast data. Please try again.',
        feels_like: 'Feels like:',
        humidity: 'Humidity',
        wind_speed: 'Wind',
        pressure: 'Pressure'
    }
};

// Mapeo de códigos de icono de OpenWeatherMap a tus nombres de archivo de iconos personalizados
const customIconMap = {
    '01d': 'dclear_sky.png',
    '01n': 'nclear_sky.png',
    '02d': 'dfew_clouds.png',
    '02n': 'nfew_clouds.png',
    '03d': 'dscattered_clouds_icon.png',
    '03n': 'dscattered_clouds_icon.png',
    '04d': 'dbroken_clouds.png',
    '04n': 'dbroken_clouds.png',
    '09d': 'dshower_rain.png',
    '09n': 'dshower_rain.png',
    '10d': 'drain.png',
    '10n': 'nrain.png',
    '11d': 'dthunderstorm.png',
    '11n': 'dthunderstorm.png',
    '13d': 'dsnow.png',
    '13n': 'dsnow.png',
    '50d': 'dmist.png',
    '50n': 'dmist.png'
};

function getWeatherIconUrl(iconCode) {
    const customIconName = customIconMap[iconCode];
    if (customIconName) {
        return `Iconos_clima/${customIconName}`;
    }
    console.warn(`No custom icon found for code: ${iconCode}. Using fallback icon.`);
    return 'icon_nube.png';
}


function getCurrentLanguage() {
    return document.documentElement.lang || 'es'; 
}


// Función para obtener y mostrar el pronóstico de 5 días
async function getFiveDayForecast(latitude, longitude, cityName) {
    const lang = getCurrentLanguage();
    forecastCityName.textContent = cityName;
    fiveDayForecastContent.innerHTML = ''; 

    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=${lang}&appid=${API_KEY}`;

    try {
        const response = await fetch(FORECAST_API_URL);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText} from forecast API.`);
        }
        const data = await response.json();
        console.log('Datos de pronóstico 5 días recibidos:', data);

        displayFiveDayForecast(data, lang);

    } catch (error) {
        console.error('Error al obtener el pronóstico de 5 días:', error);
        fiveDayForecastContent.innerHTML = `<p class="error-message">${forecastTranslations[lang].error_message}</p>`;
        alert('No se pudieron cargar los datos del pronóstico. Por favor, inténtalo de nuevo más tarde.');
    }
}

function displayFiveDayForecast(forecastData, lang) {
    fiveDayForecastContent.innerHTML = ''; 

    const dailyData = {};

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toISOString().split('T')[0]; 

        if (!dailyData[dateString]) {
            dailyData[dateString] = [];
        }
        dailyData[dateString].push(item);
    });

    const sortedDates = Object.keys(dailyData).sort();

    sortedDates.slice(0, 5).forEach((dateString, index) => { 
        const dailyItems = dailyData[dateString];
        const date = new Date(dateString);

        let dayTitle = '';
        if (index === 0) {
            dayTitle = forecastTranslations[lang].today;
        } else if (index === 1) {
            dayTitle = forecastTranslations[lang].tomorrow;
        } else {
            // Formatear la fecha para los días siguientes
            dayTitle = date.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
            dayTitle = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1); 
        }

        const daySection = document.createElement('div');
        daySection.classList.add('day-forecast-section');
        daySection.innerHTML = `
            <h3 class="section-title day-title">${dayTitle}:</h3>
            <div class="hourly-forecast-container daily-hourly-cards">
                </div>
        `;
        fiveDayForecastContent.appendChild(daySection);

        const hourlyContainer = daySection.querySelector('.daily-hourly-cards');

        // Filtrar y mostrar las franjas horarias relevantes (ej. cada 3 horas)
        dailyItems.forEach(hourData => {
            const time = new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedTime = time;

            const hourlyCard = document.createElement('div');
            hourlyCard.classList.add('hourly-card'); 
            hourlyCard.innerHTML = `
                <span class="hourly-time">${formattedTime}</span>
                <img src="${getWeatherIconUrl(hourData.weather[0].icon)}" alt="${hourData.weather[0].description}" class="hourly-icon">
                <span class="hourly-temp">${Math.round(hourData.main.temp)}°C</span>
            `;
            hourlyContainer.appendChild(hourlyCard);
        });
    });
}


// Funcionalidad de Modo Oscuro (Duplicada para esta página, o se podría centralizar)
function applyThemeForecast(isDarkMode) {
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeToggleForecast.textContent = 'dark_mode';
    } else {
        body.classList.remove('dark-mode');
        themeToggleForecast.textContent = 'light_mode';
    }
    localStorage.setItem('darkMode', isDarkMode); 
}

function loadThemePreferenceForecast() {
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme === 'true'; 
    applyThemeForecast(isDarkMode);
}

// Event Listeners para esta página
if (themeToggleForecast) {
    themeToggleForecast.addEventListener('click', () => {
        const isDarkMode = body.classList.contains('dark-mode');
        applyThemeForecast(!isDarkMode);
    });
}

if (backToWeather) {
    backToWeather.addEventListener('click', () => {
        window.location.href = 'weather.html'; 
    });
}

if (refreshForecast) {
    refreshForecast.addEventListener('click', () => {
        if (currentForecastLocation) {
            getFiveDayForecast(currentForecastLocation.lat, currentForecastLocation.lon, currentForecastLocation.name);
        } else {
            alert('No hay información de ubicación para refrescar.');
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    loadThemePreferenceForecast(); 

    // Recuperar la ubicación actual del localStorage
    const storedLocation = localStorage.getItem('currentLocation');
    if (storedLocation) {
        currentForecastLocation = JSON.parse(storedLocation);
        document.documentElement.lang = getCurrentLanguage(); 
        getFiveDayForecast(currentForecastLocation.lat, currentForecastLocation.lon, currentForecastLocation.name);
    } else {
        forecastCityName.textContent = "No se encontró ubicación.";
        fiveDayForecastContent.innerHTML = `<p class="error-message">${forecastTranslations[getCurrentLanguage()].error_message}</p>`;
    }
});