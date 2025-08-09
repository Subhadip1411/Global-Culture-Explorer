
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '' 
}).addTo(map);



const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const themeBtn = document.getElementById('themeBtn');
const panel = document.getElementById('infoPanel');
const closePanel = document.getElementById('closePanel');
const countrySection = document.getElementById('countrySection');
const recipesSection = document.getElementById('recipesSection');
const wikiSection = document.getElementById('wikiSection');

function openPanel() {
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
}
function closePanelFn() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
}
closePanel.addEventListener('click', closePanelFn);


themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});



searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) loadCountry(query);
});
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchBtn.click();
});


async function loadCountry(name) {
  try {
    const country = await fetchCountry(name);
    if (!country) return alert('Country not found');

    if (country.latlng) map.setView(country.latlng, 3);

    renderCountryInfo(country);
    await renderRecipes(country.name.common);
    await renderWiki(country.name.common);

    openPanel();
  } catch (err) {
    alert(err.message);
  }
}


async function fetchCountry(name) {
  const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Country not found');
  const data = await res.json();
  const lower = name.toLowerCase();
  return data.find(c =>
    c.name.common.toLowerCase() === lower ||
    c.name.official.toLowerCase() === lower
  ) || data[0];
}



function renderCountryInfo(c) {
  countrySection.innerHTML = `
    <img src="${c.flags.png}" alt="Flag of ${c.name.common}" class="flag"/>
    <h2>${c.name.common}</h2>
    <p class="small">Population: ${c.population.toLocaleString()}</p>
    <p class="small">Region: ${c.region}</p>
    <p class="small">Languages: ${Object.values(c.languages || {}).join(', ')}</p>
    <p class="small">Currency: ${Object.keys(c.currencies || {}).join(', ')}</p>
  `;
}



async function renderRecipes(countryName) {
  recipesSection.innerHTML = `<h3>Recipes</h3><p class="small">Loading...</p>`;
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(countryName)}`);
  const data = await res.json();
  if (!data.meals) {
    recipesSection.innerHTML = `<h3>Recipes</h3><p class="small">No recipes found</p>`;
    return;
  }
  recipesSection.innerHTML = `<h3>Recipes</h3>` +
    data.meals.slice(0, 5).map(m => `
      <div class="recipe-item">
        <img src="${m.strMealThumb}" alt="${m.strMeal}" width="80"/>
        <span>${m.strMeal}</span>
      </div>
    `).join('');
}


async function renderWiki(countryName) {
  wikiSection.innerHTML = `<h3>About</h3><p class="small">Loading...</p>`;
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`);
  if (!res.ok) {
    wikiSection.innerHTML = `<h3>About</h3><p class="small">No info available</p>`;
    return;
  }
  const data = await res.json();
  wikiSection.innerHTML = `<h3>About</h3><p>${data.extract}</p>`;
}

