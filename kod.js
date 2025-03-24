const genislik = window.innerWidth * 0.75;
const yukseklik = window.innerHeight;

const svg = d3.select("#zihinharitasi")
  .append("svg")
  .attr("width", genislik)
  .attr("height", yukseklik)
  .call(d3.zoom().on("zoom", (olay) => {
    svgGrubu.attr("transform", olay.transform);
  }))
  .append("g");

const svgGrubu = svg.append("g");

// Veriyi JSON dosyasindan yukle
d3.json("sirketler.json").then(veri => {
  // Force-directed layout
  const simulasyon = d3.forceSimulation(veri.dugumler)
    .force("baglanti", d3.forceLink(veri.baglantilar).id(d => d.kimlik).distance(100))
    .force("yuk", d3.forceManyBody().strength(-200))
    .force("merkez", d3.forceCenter(genislik / 2, yukseklik / 2));

  // Baglantilar
  const baglanti = svgGrubu.append("g")
    .selectAll("line")
    .data(veri.baglantilar)
    .enter()
    .append("line")
    .attr("class", "baglanti");

  // Dugumler
  const dugum = svgGrubu.append("g")
    .selectAll("circle")
    .data(veri.dugumler)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr("class", d => d.tur === "holding" ? "holding" : "sirket")
    .call(d3.drag()
      .on("start", suruklemeBasladi)
      .on("drag", surukleniyor)
      .on("end", suruklemeBitti))
    .on("click", (olay, d) => {
      // Ayrinti panelini guncelle
      d3.select("#ayrintilar").html(`
        <h2>${d.ad}</h2>
        <p><strong>Tur:</strong> ${d.tur === "holding" ? "Holding" : "Sirket"}</p>
        <p><strong>Ayrintilar:</strong> ${d.ayrintilar}</p>
        <p><strong>Kaynak:</strong> ${d.kaynak}</p>
      `);
    });

  // Dugum etiketleri
  const etiket = svgGrubu.append("g")
    .selectAll("text")
    .data(veri.dugumler)
    .enter()
    .append("text")
    .text(d => d.ad)
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .style("font-size", "12px");

  // Simulasyon guncellemeleri
  simulasyon.on("tick", () => {
    baglanti
      .attr("x1", d => d.kaynak.x)
      .attr("y1", d => d.kaynak.y)
      .attr("x2", d => d.hedef.x)
      .attr("y2", d => d.hedef.y);

    dugum
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    etiket
      .attr("x", d => d.x)
      .attr("y", d => d.y + 30);
  });

  // Surukleme fonksiyonlari
  function suruklemeBasladi(olay, d) {
    if (!olay.active) simulasyon.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function surukleniyor(olay, d) {
    d.fx = olay.x;
    d.fy = olay.y;
  }

  function suruklemeBitti(olay, d) {
    if (!olay.active) simulasyon.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});