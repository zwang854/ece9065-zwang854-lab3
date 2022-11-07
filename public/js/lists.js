window.onload = function () {
  function validateTracks (tracks) {
    let ts = tracks.split(',').map(v => v.trim()).filter(v => v !== '');
    for (let t of ts) {
      if (!/^\d+$/.test(t)) {
        alert('Please enter comma seperated numbers in tracks!');
        return false;
      }
    }
    return ts.map(v => Number(v));
  }

  async function fetchTracks () {
    fetch('/lists')
      .then(res => res.json())
      .then(results => {
        let el = document.getElementById('result');
        el.querySelectorAll('.card').forEach(e => e.remove());
        for (let r of results) {
          let d = document.createElement('div');
          d.className = 'card';
          let name = document.createElement('h3');
          name.appendChild(document.createTextNode(r.name));
          d.appendChild(name);

          d.innerHTML += `
<div class="sort">
<div>Sort:</div>
<button type="button" id="s1">By artist</button>
<button type="button" id="s2">By track</button>
<button type="button" id="s3">By album</button>
<button type="button" id="s4">By length</button>
</div>
           <div><button type="button" class="edit">Edit</button>&nbsp;<button type="button" class="delete">Delete</button></div>
          
          <div><b>Tracks</b>: </div>
          `;

          Promise.all(r.tracks.map(v => fetch('/track/' + v).then(res => res.json())))
            .then(tracks => {
              function render (data) {
                let l = d.querySelector('ol');
                l && l.remove();
                let ul = document.createElement('ol');
                for (let t of data) {
                  if (t.error) {
                    ul.innerHTML += `<li>${t.error}</li>`;
                  } else {
                    ul.innerHTML += `<li>${t.artist_name}-<b>${t.track_title}</b>, &lt;${t.album_title}&gt;, ${t.track_duration}</li>`;
                  }
                }
                d.appendChild(ul);
              }

              render(tracks);

              function s (a, b, field) {
                if (a.error && b.error) {
                  return 0;
                }
                if (a.error) {
                  return 1;
                }
                if (b.error) {
                  return -1;
                }
                return a[field].localeCompare(b[field]);
              }

              d.querySelector('#s1').addEventListener('click', function () {
                render(tracks.sort((a, b) => s(a, b, 'artist_name')));
              });
              d.querySelector('#s2').addEventListener('click', function () {
                render(tracks.sort((a, b) => s(a, b, 'track_title')));
              });
              d.querySelector('#s3').addEventListener('click', function () {
                render(tracks.sort((a, b) => s(a, b, 'album_title')));
              });
              d.querySelector('#s4').addEventListener('click', function () {
                render(tracks.sort((a, b) => s(a, b, 'track_duration')));
              });
            });

          d.querySelector('.delete').addEventListener('click', e => {
            if (confirm('Are you sure?')) {
              fetch(`/list?name=${encodeURIComponent(r.name)}`, { method: 'DELETE' })
                .then(res => res.json())
                .then((json) => {
                  if (json.error) {
                    alert(json.error);
                  } else {
                    alert('List deleted!');
                    fetchTracks();
                  }
                });
            }
          });
          d.querySelector('.edit').addEventListener('click', e => {
            let tracks = validateTracks(prompt('Enter new tracks'));
            if (tracks === false) {
              return;
            }
            fetch(`/list`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name: r.name, tracks })
            })
              .then(res => res.json())
              .then((json) => {
                if (json.error) {
                  alert(json.error);
                } else {
                  alert('List updated!');
                  fetchTracks();
                }
              });
          });
          el.appendChild(d);
        }
      });
  }

  fetchTracks();

  document.getElementById('f').addEventListener('submit', e => {
    e.preventDefault();
    let name = document.getElementById('name').value;
    let tracks = validateTracks(document.getElementById('tracks').value);
    if (tracks === false) {
      return;
    }
    fetch('/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, tracks: tracks })
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          alert(json.error);
        } else {
          alert('List added!');
          fetchTracks();
        }
      });
  });
};