const playlistContainer = document.getElementById('playlist');
const searchBar = document.getElementById('searchBar');
const discoverBtn = document.getElementById('discoverBtn');
const mainContent = document.getElementById('mainContent');
const trackModal = new bootstrap.Modal(document.getElementById('trackModal'));
const filterSelect = document.getElementById('filterSelect');

let originalData = [];

fetch('data/data.json')
  .then(res => res.json())
  .then(data => {
    originalData = data;
    renderPlaylist(data);
    renderChart(data);         // Top 10 artistes
    renderGenreChart(data);    // Genres simulés
  });

function renderPlaylist(data) {
  playlistContainer.innerHTML = '';
  data.forEach((track, index) => {
    const item = document.createElement('div');
    item.classList.add('list-group-item');
    item.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="text-success fw-bold me-3">#${index + 1}</span>
        <img src="${track.album.images[2].url}" alt="cover">
        <div class="info">
          <h5>${track.name}</h5>
          <p>${track.artists[0].name} — ${track.album.name}</p>
        </div>
      </div>
      <div>
        <small class="text-white">${track.album.release_date}</small>
      </div>
    `;
    item.addEventListener('click', () => openModal(track));
    playlistContainer.appendChild(item);
  });
}

function openModal(track) {
  document.getElementById('modalTitle').textContent = track.name;
  document.getElementById('modalImage').src = track.album.images[1].url;
  const isSingle = track.album.album_type === 'single';
  document.getElementById('modalDetails').innerHTML = `
    <strong>Artiste :</strong> ${track.artists[0].name}<br>
    <strong>Durée :</strong> ${(track.duration_ms / 60000).toFixed(2)} min<br>
    <strong>Album :</strong> ${track.album.name}<br>
    <strong>Type :</strong> ${isSingle ? 'Single' : 'Album'}<br>
    ${track.album.label ? `<strong>Label :</strong> ${track.album.label}<br>` : ''}
  `;
  document.getElementById('spotifyLink').href = track.external_urls.spotify;
  document.getElementById('youtubeLink').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.name + ' ' + track.artists[0].name)}`;
  trackModal.show();
}

searchBar.addEventListener('input', () => {
  const query = searchBar.value.toLowerCase();
  const filtered = originalData.filter(track =>
    track.name.toLowerCase().includes(query) ||
    track.artists[0].name.toLowerCase().includes(query)
  );
  renderPlaylist(filtered);
});

discoverBtn.addEventListener('click', () => {
  mainContent.scrollIntoView({ behavior: 'smooth' });
});

filterSelect.addEventListener('change', () => {
  const value = filterSelect.value;
  let sorted = [...originalData];
  if (value === 'artist') {
    sorted.sort((a, b) => a.artists[0].name.localeCompare(b.artists[0].name));
  } else if (value === 'release') {
    sorted.sort((a, b) => new Date(a.album.release_date) - new Date(b.album.release_date));
  } else if (value === 'alpha') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  renderPlaylist(sorted);
});

function renderChart(data) {
  const artistCount = {};
  data.forEach(track => {
    const name = track.artists[0].name;
    artistCount[name] = (artistCount[name] || 0) + 1;
  });
  const sorted = Object.entries(artistCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const ctx = document.getElementById('artistChart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(e => e[0]),
      datasets: [{
        data: sorted.map(e => e[1]),
        backgroundColor: sorted.map((_, i) => `hsl(${120 + i * 10}, 60%, 40%)`),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Top 10 Artistes les plus écoutés',
          color: '#fff'
        }
      },
      scales: {
        x: {
          ticks: { color: '#fff' }
        },
        y: {
          ticks: { color: '#fff' }
        }
      }
    }
  });
}

const genreData = {
  "Trap": 14,
  "Drill": 4,
  "Rap FR": 7,
  "Cloud Rap": 10,
  "Afro Trap": 4,
  "Old School": 3,
  "New Wave": 4,
  "R&B": 2,
  "Zouk Urbain": 2
};

function renderGenreChart(genreData) {
  const sorted = Object.entries(genreData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7); // Top 7 genres

  const labels = sorted.map(e => e[0]);
  const values = sorted.map(e => e[1]);
  const colors = labels.map((_, i) => `hsl(${140 + i * 30}, 70%, 45%)`);

  const ctx = document.getElementById("genreChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        },
        title: {
          display: false
        }
      },
      responsive: true,
      cutout: "50%"
    }
  });
}

renderGenreChart({
  "Trap": 14,
  "Drill": 4,
  "Rap FR": 7,
  "Cloud Rap": 10,
  "Afro Trap": 4,
  "Old School": 3,
  "New Wave": 4,
  "R&B": 2,
  "Zouk Urbain": 2
});
