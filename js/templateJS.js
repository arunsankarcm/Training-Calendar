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


import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
import html2canvas from "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

function downloadDivAsPDF() {
  const container = document.getElementById("container-capture");

  // Use html2canvas to capture the div
  html2canvas(container, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    // Create a new PDF
    const pdf = new jsPDF("p", "mm", "a4");
    
    // Define width and height based on A4 page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    // Check if the image needs to be split across pages
    let position = 0;
    while (position < imgHeight) {
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      position += pageHeight;
      if (position < imgHeight) {
        pdf.addPage();
      }
    }

    // Download the PDF
    pdf.save("Training_Calendar.pdf");
  });
}

// Trigger the function when needed
document.getElementById("downloadPDFBtn").addEventListener("click", downloadDivAsPDF);
