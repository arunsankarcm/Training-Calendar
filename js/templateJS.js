const urlParams = new URLSearchParams(window.location.search);
const monthText = urlParams.get("month");
const yearText = urlParams.get("year");
console.log("URL Parameters - Month:", monthText, "Year:", yearText);
let versionNo = 1;

function downloadAsPNG() {
  const element = document.getElementById("container-capture");

  html2canvas(element, {
    scale: 1,
    width: 846,
  })
    .then((canvas) => {
      // Download as PNG
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Training_Calendar_${monthText}_${yearText}_v${versionNo}.png`;
      versionNo++;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("Error generating the PNG image:", error);
    });
}

function downloadAsPDF() {
  const element = document.getElementById("container-capture");

  html2canvas(element, {
    scale: 2,
    width: 846,
  })
    .then((canvas) => {
      // Download as PDF
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;  // Ensure you access jsPDF from the jspdf object
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Training_Calendar_${monthText}_${yearText}_v${versionNo}.pdf`);
      versionNo++;
    })
    .catch((error) => {
      console.error("Error generating the PDF:", error);
    });
}
