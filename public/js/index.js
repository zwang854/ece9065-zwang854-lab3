window.onload = function () {
  let el = document.getElementById('result');

  function render (type, results) {
    el.querySelectorAll('.card').forEach(e => e.remove());
    for (let r of results) {
      let d = document.createElement('div');
      d.className = 'card';

      if (type === 'artist') {
        d.innerHTML = `
          <h3>${r.name}</h3>
          <div><b>id</b>: ${r.id}</div>
          <div><b>Members</b>: ${r.members}</div>
          <div><b>Location</b>: ${r.location}</div>
          <div><b>Url</b>: <a href="${r.url}" target="_blank">${r.url}</a></div>
          <div>${r.bio}</div>
          `;
      } else {
        d.innerHTML = `
          <h3>${r.track_title}</h3>
          <div><b>track id</b>: ${r.id}</div>
          <div><b>track number</b>: ${r.track_number}</div>
          <div><b>track duration</b>: ${r.track_duration}</div>
          <div><b>created at</b>: ${new Date(r.track_date_created).toLocaleString()}</div>
          <div><b>recorded at</b>: ${new Date(r.track_date_recorded).toLocaleString()}</div>
          <div><b>artist id</b>: ${r.artist_id}</div>
          <div><b>artist name</b>: ${r.artist_name}</div>
          <div><b>album id</b>: ${r.album_id}</div>
          <div><b>album title</b>: ${r.album_title}</div>
          <div><b>genres</b>: ${r.track_genres.map(v => `<div class="tag">${v.genre_title}</div>`).join('')}</div>
          <div><b>tags</b>: ${r.tags.map(v => `<div class="tag">${v}</div>`).join('')}</div>
          `;
      }

      el.appendChild(d);
    }
  }

  document.getElementById('f').addEventListener('submit', e => {
    e.preventDefault();
    let search = document.getElementById('search').value;
    let n = document.getElementById('n').value;
    let type = document.getElementById('type').value;

    fetch(`/${type}s?n=${n}&search=${search}`)
      .then(res => res.json())
      .then(ids => {
        if (ids.error) {
          return Promise.resolve(ids);
        }
        return Promise.all(ids.map(id => fetch(`/${type}/${id}`).then(res => res.json())));
      })
      .then(results => {
        el.innerHTML = '';
        if (results.error) {
          el.innerHTML = `<div class="tip">${results.error}</div>`;
          return;
        }
        if (type === 'artist') {
          el.innerHTML = `
<div class="sort">
<div>Sort:</div>
<button type="button" id="s1">By artist</button>
</div>`;
          el.querySelector('#s1').addEventListener('click', function () {
            render(type, results.sort((a, b) => a.name.localeCompare(b.name)));
          });
        } else {
          el.innerHTML = `<div class="sort">
<div>Sort:</div>
<button type="button" id="s1">By artist</button>
<button type="button" id="s2">By track</button>
<button type="button" id="s3">By album</button>
<button type="button" id="s4">By length</button>
</div>`;
          el.querySelector('#s1').addEventListener('click', function () {
            render(type, results.sort((a, b) => a.artist_name.localeCompare(b.artist_name)));
          });
          el.querySelector('#s2').addEventListener('click', function () {
            render(type, results.sort((a, b) => a.track_title.localeCompare(b.track_title)));
          });
          el.querySelector('#s3').addEventListener('click', function () {
            render(type, results.sort((a, b) => a.album_title.localeCompare(b.album_title)));
          });
          el.querySelector('#s4').addEventListener('click', function () {
            render(type, results.sort((a, b) => a.track_duration.localeCompare(b.track_duration)));
          });
        }
        render(type, results);

      });
  });
};