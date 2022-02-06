(() => {
  const audio = document.getElementById('player');
  const trackAudioPlayer = document.getElementById('track-player');
  const canvas = document.querySelector('.visualizer');
  const sidebar = document.querySelector('.js-sidebar');
  const sidebarPanel = sidebar.querySelector('.js-sidebar__panel');
  const viewTracksBtn = document.querySelector('.js-tracks-btn');
  const tracksContainer = document.querySelector('.js-tracks');

  let hasVisualiserStarted = false;

  const visualizer = createVisualiser({
    type: VisualizerType.MediaEl,
    canvasEl: canvas,
    styles: {
      width: 800,
      lineColor: 'rgb(190 46 46 / 62%)'
    }
  });

  const loadLiveStreamMore = throttle(() => {
    const lastCurrentTime = audio.currentTime;
    audio.src = `/stream?t=${Date.now()}`;

    audio.addEventListener(
      'loadeddata',
      () => {
        audio.play();
        audio.currentTime = lastCurrentTime;
      },
      { once: true }
    );
  }, 2000);

  const renderTracks = (tracks) => {
    if (tracks.length === 0) {
      tracksContainer.innerHTML = '<h3>Sorry :( No tracks found</h3>';
      return;
    }

    tracksContainer.innerHTML = '';

    const trackTemplate = document.getElementById('track-template');
    const tempContainer = document.createElement('div');

    tracks.forEach((track) => {
      const trackCreationDateFormatted = new Date(track.createdAt)
        .toString()
        .split(' ')
        .slice(0, 5)
        .join(' ');

      const renderedTemplate = trackTemplate.innerHTML
        .replace('{{name}}', track.name.replace(/-/g, ' ').replace('.ogg', ''))
        .replace('{{creation}}', trackCreationDateFormatted);
      tempContainer.innerHTML = renderedTemplate;

      const trackEl = tempContainer.querySelector('.js-track');
      tracksContainer.appendChild(trackEl);

      trackEl
        .querySelector('.js-track__play')
        .addEventListener('click', (event) => {
          // Changing the track
          const shouldTrackChange = !trackAudioPlayer.src.includes(
            `/tracks/${track.name}`
          );

          if (shouldTrackChange) {
            trackAudioPlayer.onpause();

            // change the track player to play the new track
            trackAudioPlayer.src = `/tracks/${track.name}`;
          }

          if (trackAudioPlayer.paused) {
            trackAudioPlayer.play();

            event.currentTarget.querySelector('img').src =
              'http://simpleicon.com/wp-content/uploads/pause.svg';
          } else {
            trackAudioPlayer.pause();
          }
        });
    });
  };

  const loadTracks = async () => {
    const res = await fetch('/tracks');

    if (res.ok) {
      const { tracks } = await res.json();

      renderTracks(tracks);
    }
  };

  audio.onpause = () => {
    if (
      isFinite(audio.duration) &&
      Math.abs(audio.duration - audio.currentTime) < 0.1
    ) {
      loadLiveStreamMore();
    }
  };

  trackAudioPlayer.onpause = () => {
    // Get all tracks and change the icon to default play
    tracksContainer.querySelectorAll('.js-track').forEach((t) => {
      t.querySelector('img').src =
        'http://simpleicon.com/wp-content/uploads/play1.svg';
    });
  };

  document.getElementById('play').onclick = (e) => {
    const audio = document.getElementById('player');

    if (audio.paused) {
      if (!audio.src) {
        audio.src = `/stream?t=${Date.now()}`;
      }

      audio.play();
      canvas.classList.remove('is-hidden');

      if (!hasVisualiserStarted) {
        visualizer.visualize(audio);
        hasVisualiserStarted = true;
      }

      e.currentTarget.querySelector('img').src =
        'http://simpleicon.com/wp-content/uploads/pause.svg';
    } else {
      audio.pause();
      e.currentTarget.querySelector('img').src =
        'http://simpleicon.com/wp-content/uploads/play1.svg';
    }
  };

  viewTracksBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--shown');
    sidebarPanel.classList.remove('sidebar__panel--out-animation');
    sidebarPanel.classList.add('sidebar__panel--in-animation');

    loadTracks();
  });

  // Close sidebar event
  sidebar.addEventListener('click', (event) => {
    if (event.target !== sidebarPanel && event.target.contains(sidebarPanel)) {
      sidebarPanel.classList.remove('sidebar__panel--in-animation');
      sidebarPanel.classList.add('sidebar__panel--out-animation');
      sidebarPanel.addEventListener(
        'animationend',
        () => {
          sidebar.classList.toggle('sidebar--shown');
        },
        {
          once: true
        }
      );
    }
  });
})(window.throttle);
