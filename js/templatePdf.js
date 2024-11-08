import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
import html2canvas from "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

function downloadDivAsPDF() {
  console.log("downloadDivAsPDF function triggered.");

  const container = document.getElementById("container-capture");
  if (!container) {
    console.error("Element with id 'container-capture' not found.");
    return;
  }

  html2canvas(container, { scale: 2 })
    .then((canvas) => {
      console.log("Canvas captured successfully.");
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save("Training_Calendar.pdf");
      console.log("PDF created and download initiated.");
    })
    .catch((error) => {
      console.error("Error capturing canvas or creating PDF:", error);
    });
}

// Make function accessible globally
window.downloadDivAsPDF = downloadDivAsPDF;

// Add event listener if not using onclick in HTML
document.getElementById("downloadPDFBtn").addEventListener("click", downloadDivAsPDF);
