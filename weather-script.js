const API_KEY = 'API_KEY'; // Reemplaza con tu clave de API de OpenWeatherMap
let currentLatitude = 39.9868; 
let currentLongitude = -0.0456; 

// Elementos del DOM para actualizar
const locationName = document.querySelector('.location-name');
const currentTemp = document.querySelector('.current-temp');
const weatherIconLarge = document.querySelector('.weather-icon-large');
const weatherDescription = document.querySelector('.weather-description');
const feelsLike = document.querySelector('.feels-like');
const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');
const humidityValue = document.querySelector('.info-item:nth-child(1) .info-value');
const windSpeedValue = document.querySelector('.info-item:nth-child(2) .info-value');
const pressureValue = document.querySelector('.info-item:nth-child(3) .info-value');
const backArrow = document.querySelector('.back-arrow'); 
const refreshIcon = document.querySelector('.refresh-icon'); 
const themeToggle = document.getElementById('themeToggle'); 
const body = document.body; 


// Nuevos elementos para la búsqueda y ciudades recientes
const citySearchInput = document.getElementById('citySearchInput');
const searchCityButton = document.getElementById('searchCityButton');
const recentCitiesContainer = document.getElementById('recentCitiesContainer');
const fiveDayForecastButton = document.getElementById('fiveDayForecastButton'); 

const MAX_RECENT_CITIES = 3;
let recentCities = [];

const weatherTranslations = {
    'es': {
        feels_like: 'Sensación térmica:',
        humidity: 'Humedad',
        wind_speed: 'Velocidad Viento',
        pressure: 'Presión',
        hourly_forecast_title: 'Pronóstico por Horas',
        additional_info_title: 'Información Adicional',
        location_name: 'Castellón', 
        five_day_forecast: 'Pronóstico 5 Días' 
    },
    'en': {
        feels_like: 'Feels like:',
        humidity: 'Humidity',
        wind_speed: 'Wind Speed',
        pressure: 'Pressure',
        hourly_forecast_title: 'Hourly Forecast',
        additional_info_title: 'Additional Information',
        location_name: 'Castellon',
        five_day_forecast: '5 Day Forecast' 
    }
};

// Función para obtener el idioma actual del documento
function getCurrentLanguage() {
    return document.documentElement.lang || 'es';
}

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

// Función para obtener la URL del icono personalizado
function getWeatherIconUrl(iconCode) {
    const customIconName = customIconMap[iconCode];
    if (customIconName) {
        return `Iconos_clima/${customIconName}`;
    }
    console.warn(`No custom icon found for code: ${iconCode}. Using fallback icon.`);
    return 'icon_nube.png'; //
}

// Función para obtener coordenadas (lat, lon) a partir de un nombre de ciudad
async function getCoordinatesForCity(cityName) {
    const lang = getCurrentLanguage();
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&lang=${lang}&appid=${API_KEY}`;
    try {
        const response = await fetch(GEOCODING_API_URL);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText} from geocoding API.`);
        }
        const data = await response.json();
        if (data.length > 0) {
            // Devolver el nombre local de la ciudad si está disponible
            const localizedCityName = data[0].local_names?.[lang] || data[0].name;
            return {
                lat: data[0].lat,
                lon: data[0].lon,
                name: localizedCityName
            };
        } else {
            alert(`No se encontraron resultados para "${cityName}".`);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener coordenadas:', error);
        alert('No se pudo obtener la ubicación. Por favor, verifica el nombre de la ciudad.');
        return null;
    }
}

// Función para obtener y mostrar los datos del clima
async function getWeatherData(latitude, longitude, cityName = null) {
    const lang = getCurrentLanguage();

    const CURRENT_WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=${lang}&appid=${API_KEY}`;
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=${lang}&appid=${API_KEY}`;

    console.log('Intentando cargar datos del clima...');
    console.log('URL de Clima Actual:', CURRENT_WEATHER_API_URL);
    console.log('URL de Pronóstico:', FORECAST_API_URL);

    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(CURRENT_WEATHER_API_URL),
            fetch(FORECAST_API_URL)
        ]);

        if (!currentWeatherResponse.ok) {
            const errorText = await currentWeatherResponse.text();
            throw new Error(`HTTP error! Status: ${currentWeatherResponse.status}, Message: ${errorText} from current weather API.`);
        }
        const currentWeatherData = await currentWeatherResponse.json();
        console.log('Datos de clima actual recibidos:', currentWeatherData);

        if (!forecastResponse.ok) {
            const errorText = await forecastResponse.text();
            throw new Error(`HTTP error! Status: ${forecastResponse.status}, Message: ${errorText} from forecast API.`);
        }
        const forecastData = await forecastResponse.json();
        console.log('Datos de pronóstico recibidos:', forecastData);

        const displayCityName = cityName || currentWeatherData.name;
        updateWeatherUI(currentWeatherData, forecastData, displayCityName);
        addRecentCity(displayCityName, latitude, longitude); 

        // Guardar la ubicación actual para la página de pronóstico de 5 días
        localStorage.setItem('currentLocation', JSON.stringify({
            name: displayCityName,
            lat: latitude,
            lon: longitude
        }));

    } catch (error) {
        console.error('Error detallado al obtener los datos del clima:', error);
        alert('No se pudieron cargar los datos del clima. Por favor, inténtalo de nuevo más tarde.');
    }
}

function updateWeatherUI(currentData, forecastData, cityName) {
    const lang = getCurrentLanguage();

    locationName.textContent = cityName; 
    currentTemp.textContent = `${Math.round(currentData.main.temp)}°C`;
    weatherIconLarge.src = getWeatherIconUrl(currentData.weather[0].icon);
    weatherIconLarge.alt = currentData.weather[0].description;
    weatherDescription.textContent = currentData.weather[0].description;
    feelsLike.textContent = `${weatherTranslations[lang].feels_like} ${Math.round(currentData.main.feels_like)}°C`;

    hourlyForecastContainer.innerHTML = ''; 
    const hourlyForecasts = forecastData.list.slice(0, 8); 

    hourlyForecasts.forEach(hourData => {
        const date = new Date(hourData.dt * 1000);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
        const formattedTime = time;

        const hourlyCard = document.createElement('div');
        hourlyCard.classList.add('hourly-card');
        hourlyCard.innerHTML = `
            <span class="hourly-time">${formattedTime}</span>
            <img src="${getWeatherIconUrl(hourData.weather[0].icon)}" alt="${hourData.weather[0].description}" class="hourly-icon">
            <span class="hourly-temp">${Math.round(hourData.main.temp)}°C</span>
        `;
        hourlyForecastContainer.appendChild(hourlyCard);
    });

    document.querySelector('.info-item:nth-child(1) .info-label').textContent = weatherTranslations[lang].humidity;
    humidityValue.textContent = `${currentData.main.humidity}%`;

    document.querySelector('.info-item:nth-child(2) .info-label').textContent = weatherTranslations[lang].wind_speed;
    windSpeedValue.textContent = `${currentData.wind.speed} m/s`;

    document.querySelector('.info-item:nth-child(3) .info-label').textContent = weatherTranslations[lang].pressure;
    pressureValue.textContent = `${currentData.main.pressure} hPa`;
    
    const hourlyForecastTitle = document.getElementById('hourlyForecastTitle');
    if (hourlyForecastTitle) {
        hourlyForecastTitle.textContent = weatherTranslations[lang].hourly_forecast_title;
    }
    const additionalInfoTitle = document.getElementById('additionalInfoTitle');
    if (additionalInfoTitle) {
        additionalInfoTitle.textContent = weatherTranslations[lang].additional_info_title;
    }

    if (fiveDayForecastButton) {
        fiveDayForecastButton.textContent = weatherTranslations[lang].five_day_forecast;
    }
}

// Funciones para manejar ciudades recientes
function loadRecentCities() {
    const storedCities = localStorage.getItem('recentCities');
    if (storedCities) {
        recentCities = JSON.parse(storedCities);
    } else {
        // Inicializar con Castellón si no hay ciudades guardadas
        recentCities.push({ name: 'Castellón', lat: 39.9868, lon: -0.0456 });
    }
    renderRecentCities();
}

function saveRecentCities() {
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
}

function addRecentCity(cityName, lat, lon) {
    // Eliminar la ciudad si ya existe para moverla al principio
    recentCities = recentCities.filter(city => city.name !== cityName);
    
    // Añadir la nueva ciudad al principio
    recentCities.unshift({ name: cityName, lat: lat, lon: lon });

    // Limitar el número de ciudades recientes
    if (recentCities.length > MAX_RECENT_CITIES) {
        recentCities = recentCities.slice(0, MAX_RECENT_CITIES);
    }
    saveRecentCities();
    renderRecentCities();
}

function renderRecentCities() {
    recentCitiesContainer.innerHTML = '';
    recentCities.forEach(city => {
        const button = document.createElement('button');
        button.classList.add('recent-city-button');
        button.textContent = city.name;
        button.addEventListener('click', () => {
            currentLatitude = city.lat;
            currentLongitude = city.lon;
            getWeatherData(currentLatitude, currentLongitude, city.name);
            citySearchInput.value = ''; 
        });
        recentCitiesContainer.appendChild(button);
    });
}

// Funcionalidad de Modo Oscuro
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeToggle.textContent = 'dark_mode'; 
    } else {
        body.classList.remove('dark-mode');
        themeToggle.textContent = 'light_mode'; 
    }
    localStorage.setItem('darkMode', isDarkMode); 
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('darkMode'); //
    const isDarkMode = savedTheme === 'true'; //
    applyTheme(isDarkMode); //
}

// Event Listeners
searchCityButton.addEventListener('click', async () => {
    const cityName = citySearchInput.value.trim();
    if (cityName) {
        const cityInfo = await getCoordinatesForCity(cityName);
        if (cityInfo) {
            currentLatitude = cityInfo.lat;
            currentLongitude = cityInfo.lon;
            getWeatherData(currentLatitude, currentLongitude, cityInfo.name);
            citySearchInput.value = ''; 
        }
    } else {
        alert('Por favor, introduce un nombre de ciudad.');
    }
});

citySearchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchCityButton.click(); 
    }
});

if (backArrow) {
    backArrow.addEventListener('click', () => {
        window.history.back(); 
    });
}

if (refreshIcon) {
    refreshIcon.addEventListener('click', () => {
        getWeatherData(currentLatitude, currentLongitude, locationName.textContent);
    });
}

if (themeToggle) { 
    themeToggle.addEventListener('click', () => { //
        const isDarkMode = body.classList.contains('dark-mode'); //
        applyTheme(!isDarkMode); 
    });
}

// Event listener para el botón de pronóstico de 5 días
if (fiveDayForecastButton) {
    fiveDayForecastButton.addEventListener('click', () => {
        window.location.href = 'forecast.html';
    });
}


// Cargar los datos del clima para la ciudad inicial (Castellón) o la última buscada al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference(); 
    loadRecentCities(); 
    if (recentCities.length > 0) {
        currentLatitude = recentCities[0].lat;
        currentLongitude = recentCities[0].lon;
        getWeatherData(currentLatitude, currentLongitude, recentCities[0].name);
    } else {
        getWeatherData(currentLatitude, currentLongitude, weatherTranslations[getCurrentLanguage()].location_name);
    }
});