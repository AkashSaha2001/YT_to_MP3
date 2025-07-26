async function handleConvert() {
  const url = document.getElementById('videoUrl').value.trim();
  if (!url) {
      alert("Please enter a YouTube link.");
      return;
  }

  document.getElementById('loading').style.display = 'block';
  document.getElementById('result').style.display = 'none';

  try {
      const res = await fetch('http://localhost:5000/api/convert', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      document.getElementById('title').innerText = data.title || "Download Ready";
      document.getElementById('thumbnail').src = data.thumbnail;
      document.getElementById('downloadLink').href = data.downloadUrl;

      document.getElementById('loading').style.display = 'none';
      document.getElementById('result').style.display = 'block';

  } catch (err) {
      console.error(err);
      alert("Something went wrong while converting.");
      document.getElementById('loading').style.display = 'none';
  }
}
