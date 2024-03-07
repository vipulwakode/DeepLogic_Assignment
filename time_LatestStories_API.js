const http = require("http");
const https = require("https");

// Function to retrieve HTML content from Time.com
function fetchHTML(url, callback) {
  https.get(url, (response) => {
      let data = "";

      // A chunk of data has been received
      response.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received
      response.on("end", () => {
        callback(null, data);
      });
    })
    .on("error", (error) => {
      callback(error, null);
    });
}

// Function to parse HTML and extract latest stories
function parseHTML(html) {
  const stories = [];
  const regex =
    /<li class="latest-stories__item">\s*<a href="(.*?)">\s*<h3 class="latest-stories__item-headline">(.*?)<\/h3>\s*<\/a>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    stories.push({ title, url });
    if (stories.length >= 6) break; // Limit to 6 stories
  }

  return stories;
}

// Create HTTP server
const server = http.createServer((req, res) => {
   //console.log(req.url);
  // Retrieve HTML content from Time.com
  fetchHTML("https://time.com", (error, html) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to retrieve HTML content" }));
      return;
    }

    // Parse HTML and extract latest stories
    const stories = parseHTML(html);

    // Respond with JSON array of latest stories
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(stories));
  });
});

// Start server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running 🚀 at http://localhost:${PORT}`);
});
