window.onload = function () {
  fetch('/genres')
    .then(res => res.json())
    .then(json => {
      let el = document.getElementById('genres');
      for (let t of json) {
        let d = document.createElement('div');
        d.textContent = t.name;
        d.className = 'tag';
        el.appendChild(d);
      }
    });
};
