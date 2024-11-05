const urlParams = new URLSearchParams(window.location.search);
const monthText = urlParams.get("month");
const yearText = urlParams.get("year");
console.log("URL Parameters - Month:", monthText, "Year:", yearText);
let versionNo = 1;

function downloadImage() {
  const element = document.getElementById("container-capture");

  html2canvas(element, {
    scale: 1,
    width: 846,
  })
    .then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Training_Calendar_${monthText}_${yearText}_v${versionNo}.png`;
      versionNo++;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("Error generating the image:", error);
    });
}
