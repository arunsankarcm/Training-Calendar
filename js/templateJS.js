function downloadImage() {
    const element = document.getElementById('container-capture');
    
    html2canvas(element).then(canvas => {
    
      const imgData = canvas.toDataURL('image/png');
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'TrainingCalender.png';
      
      // Append the link to the document and click it to trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up: remove the link from the DOM
      document.body.removeChild(link);
    });
  }

  document.getElementById('downloadBtn').addEventListener('click', function () {
    // Create an array to store the table data
    var data = [];

    // Header row for the Excel file
    data.push(["Number", "Training Title", "Target Audience", "Date", "Trainer", "Key Points", "Type"]);

    // Collecting data from the upcoming section
    var upcomingCards = document.querySelectorAll('.upcoming-section .training-card');
    upcomingCards.forEach((card, index) => {
        var number = card.querySelector('.circle-number span').textContent;
        var title = card.querySelector('.training-details h3').textContent;
        var audience = card.querySelector('.training-details p:nth-child(2)').textContent.replace('Target Audience: ', '');
        var date = card.querySelector('.training-details p:nth-child(3)').textContent.replace('Date: ', '');
        var trainer = card.querySelector('.training-details p:nth-child(4)').textContent.replace('Trainer: ', '');
        var keyPoints = card.querySelector('.training-details p:nth-child(5)').textContent.replace('Key points: ', '');
        var type = card.querySelector('.tag').textContent;

        // Push the row into the data array
        data.push([number, title, audience, date, trainer, keyPoints, type]);
    });

    // Collecting data from the ongoing section
    var ongoingCards = document.querySelectorAll('.ongoing-section .training-card');
    ongoingCards.forEach((card, index) => {
        var number = card.querySelector('.circle-number span').textContent;
        var title = card.querySelector('.training-details h3').textContent;
        var audience = card.querySelector('.training-details p:nth-child(2)').textContent.replace('Target Audience: ', '');
        var date = card.querySelector('.training-details p:nth-child(3)').textContent.replace('Date: ', '');
        var trainer = card.querySelector('.training-details p:nth-child(4)').textContent.replace('Trainer: ', '');
        var keyPoints = card.querySelector('.training-details p:nth-child(5)').textContent.replace('Key points: ', '');
        var type = card.querySelector('.tag').textContent;

        // Push the row into the data array
        data.push([number, title, audience, date, trainer, keyPoints, type]);
    });

    // Create a new workbook
    var wb = XLSX.utils.book_new();

    // Convert the data array to a worksheet
    var ws = XLSX.utils.aoa_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Training Calendar");

    // Write the workbook and trigger the download
    XLSX.writeFile(wb, "Training_Calendar_October_2024.xlsx");
});


