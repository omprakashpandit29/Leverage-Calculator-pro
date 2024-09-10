// Function to take screenshot using html2canvas and add sharing functionality
document.getElementById('screenshotButton').addEventListener('click', function() {
    html2canvas(document.body).then(function(canvas) {
        // Convert the canvas to an image
        let screenshot = canvas.toDataURL('image/png');

        // Check if Web Share API is supported
        if (navigator.share) {
            canvas.toBlob(function(blob) {
                const file = new File([blob], "screenshot.png", { type: "image/png" });
                navigator.share({
                    title: 'Trade Calculator Screenshot',
                    text: 'Check out this screenshot from the trade calculator!',
                    files: [file],
                }).then(() => {
                    console.log('Share successful!');
                }).catch((error) => {
                    console.error('Error sharing', error);
                });
            });
        } else {
            // Fallback for browsers/devices that don't support Web Share API
            // Create a link element to download the screenshot
            let downloadLink = document.createElement('a');
            downloadLink.href = screenshot;
            downloadLink.download = 'screenshot.png';

            // Simulate a click to trigger the download
            downloadLink.click();
        }
    });
});