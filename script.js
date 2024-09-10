document.addEventListener('DOMContentLoaded', () => {
    const tpCountSelect = document.getElementById('tpCount');
    const leverageInput = document.getElementById('leverage');
    const entryPriceInput = document.getElementById('entryPrice');
    const totalSizeInput = document.getElementById('totalSize');
    const tradeInfo = document.getElementById('trade-info');
    const stopLossInput = document.getElementById('stopLoss');
    const totalLossDiv = document.getElementById('totalLoss');
    const tradeTypeSelect = document.getElementById('tradeType');
    const errorMessage = document.getElementById('error-message');
    const tpPricesRow = document.getElementById('tpPrices');
    const sellPercentRow = document.getElementById('sellPercent');
    const positionClosedRow = document.getElementById('positionClosed');
    const plRow = document.getElementById('pl');
    const rrRow = document.getElementById('rr');

    const defaultSellPercentages = {
        2: [50, 100],
        3: [35, 50, 100],
        4: [30, 35, 50, 100],
        5: [25, 30, 35, 50, 100],
        6: [20, 25, 30, 35, 50, 100]
    };

    function updateRows() {
        const tpCount = parseInt(tpCountSelect.value);

        // Clear existing rows
        tpPricesRow.innerHTML = '';
        sellPercentRow.innerHTML = '';
        positionClosedRow.innerHTML = '';
        plRow.innerHTML = '';
        rrRow.innerHTML = '';

        for (let i = 0; i < tpCount; i++) {
            // Create and append TP Price input
            const tpPriceCol = document.createElement('div');
            tpPriceCol.className = 'col';
            const tpPriceInput = document.createElement('input');
            tpPriceInput.type = 'number';
            tpPriceInput.step = '0.000001';
            tpPriceInput.required = true;
            tpPriceInput.min = "0";
            tpPriceInput.placeholder = `TP ${i + 1} Price`;
            tpPriceInput.addEventListener('blur', validateTPPrices); // Trigger validation on blur
            tpPriceInput.addEventListener('blur', formatToSixDecimals);
            tpPriceCol.appendChild(tpPriceInput);
            tpPricesRow.appendChild(tpPriceCol);

            // Create and append Sell Percentage input
            const sellPercentCol = document.createElement('div');
            sellPercentCol.className = 'col';
            const sellPercentInput = document.createElement('input');
            sellPercentInput.type = 'number';
            sellPercentInput.step = '1';
            sellPercentInput.required = true;
            sellPercentInput.value = defaultSellPercentages[tpCount][i];
            sellPercentInput.min = "0";
            sellPercentInput.addEventListener('input', handleTPAdjustments);
            sellPercentInput.addEventListener('blur', formatToSixDecimals);
            sellPercentCol.appendChild(sellPercentInput);
            sellPercentRow.appendChild(sellPercentCol);

            // Create and append Position Closed input
            const positionClosedCol = document.createElement('div');
            positionClosedCol.className = 'col';
            const positionClosedInput = document.createElement('input');
            positionClosedInput.type = 'text';
            positionClosedInput.readOnly = true;
            positionClosedCol.appendChild(positionClosedInput);
            positionClosedRow.appendChild(positionClosedCol);

            // Create and append P/L input
            const plCol = document.createElement('div');
            plCol.className = 'col';
            const plInput = document.createElement('input');
            plInput.type = 'text';
            plInput.readOnly = true;
            plCol.appendChild(plInput);
            plRow.appendChild(plCol);

            // Create and append R:R input
            const rrCol = document.createElement('div');
            rrCol.className = 'col';
            const rrInput = document.createElement('input');
            rrInput.type = 'text';
            rrInput.readOnly = true;
            rrCol.appendChild(rrInput);
            rrRow.appendChild(rrCol);
        }

        // Initial calculations
        calculatePositionClosed();
        calculateResults();
    }


    function handleTPAdjustments() {
        calculateResults();
    }

    function validateTPPrices(event) {
        const entryPrice = parseFloat(entryPriceInput.value) || 0;
        const tpInput = event.target;  // The specific TP input that triggered the event
        const tpPrice = parseFloat(tpInput.value) || 0;
        const tradeType = tradeTypeSelect.value; // Get the trade type (LONG or SHORT)
    
        if (tradeType === 'LONG') {
            if (tpPrice <= entryPrice) {
                tpInput.style.borderColor = 'red';
                showErrorMessage('All TP Prices must be greater than Entry Price.');
            } else {
                tpInput.style.borderColor = ''; // Reset border color
                hideErrorMessage();
            }
        } else if (tradeType === 'SHORT') {
            if (tpPrice >= entryPrice) {
                tpInput.style.borderColor = 'red';
                showErrorMessage('All TP Prices must be less than Entry Price.');
            } else {
                tpInput.style.borderColor = ''; // Reset border color
                hideErrorMessage();
            }
        }
    
        calculateResults(); // Trigger result calculation
    }    

    function formatToSixDecimals(event) {
        const input = event.target;
        let value = parseFloat(input.value);
        if (!isNaN(value)) {
            input.value = value.toFixed(6);
        }
    }

    function validateFields() {
        const entryPrice = parseFloat(entryPriceInput.value) || 0;
        const stopLoss = parseFloat(stopLossInput.value) || 0;
        const tradeType = tradeTypeSelect.value; // Get the trade type (LONG or SHORT)
    
        let isValid = true;
        
        if (entryPrice > 0 && stopLoss > 0) {
            if (tradeType === 'LONG') {
                if (entryPrice <= stopLoss) {
                    showErrorMessage('Entry Price must be greater than Stop Loss for LONG trades.');
                    isValid = false;
                } else {
                    hideErrorMessage();
                }
            } else if (tradeType === 'SHORT') {
                if (entryPrice >= stopLoss) {
                    showErrorMessage('Entry Price must be less than Stop Loss for SHORT trades.');
                    isValid = false;
                } else {
                    hideErrorMessage();
                }
            }
        }
    
        if (!isValid) {
            showErrorMessage('Please enter a valid Stop Loss.');
        } else {
            hideErrorMessage();
        }
    }    

    function calculatePositionClosed() {
        const leverage = parseFloat(leverageInput.value) || 0;
        const totalSize = parseFloat(totalSizeInput.value) || 0;
    
        if (leverage === 0 || totalSize === 0) {
            return;
        }
    
        const tpInputs = document.querySelectorAll('#tpPrices input');
        const sellPercentInputs = document.querySelectorAll('#sellPercent input');
        let cumulativePositionClosed = totalSize;
    
        tpInputs.forEach((tpInput, index) => {
            const sellPercent = parseFloat(sellPercentInputs[index].value) || 0;
            const positionClosed = (cumulativePositionClosed * (sellPercent / 100)).toFixed(2);
            cumulativePositionClosed -= parseFloat(positionClosed); // Update cumulative position closed
            positionClosedRow.children[index].querySelector('input').value = positionClosed;
        });
        
        function updateTradeInfo() {
            const leverage = parseFloat(leverageInput.value) || 0;
            const totalSize = parseFloat(totalSizeInput.value) || 0;
        
            // Calculate the value to display
            const result = totalSize / leverage;
        
            // Update the text dynamically
            if (leverage === 0 || totalSize === 0) {
                tradeInfo.innerText = 'You have used ? in this Trade.';
            } else {
                tradeInfo.innerText = `You have used ${result.toFixed(2)} in this Trade.`;
            }
        }
        
        // Add event listeners to the input fields
        leverageInput.addEventListener('input', updateTradeInfo);
        totalSizeInput.addEventListener('input', updateTradeInfo);
    }


    function updateTotalLoss() {
        const totalSize = parseFloat(totalSizeInput.value) || 0;
        const entryPrice = parseFloat(entryPriceInput.value) || 0;
        const stopLoss = parseFloat(stopLossInput.value) || 0;
        const tradeType = tradeTypeSelect.value; // Get the trade type (LONG or SHORT)
    
        // Only calculate if all values are greater than 0
        if (totalSize > 0 && entryPrice > 0 && stopLoss > 0) {
            let totalLoss;
    
            if (tradeType === 'LONG') {
                // For LONG trade
                totalLoss = (totalSize / entryPrice) * (entryPrice - stopLoss);
            } else if (tradeType === 'SHORT') {
                // For SHORT trade
                totalLoss = (totalSize / stopLoss) * (stopLoss - entryPrice);
            }
    
            totalLossDiv.innerText = `Total Loss (If SL hit): ${totalLoss.toFixed(2)}`;
        } else {
            totalLossDiv.innerText = 'Total Loss (If SL hit): NaN';
        }
    }    
    
    // Add event listeners to the input fields to trigger the calculation
    totalSizeInput.addEventListener('input', updateTotalLoss);
    entryPriceInput.addEventListener('input', updateTotalLoss);
    stopLossInput.addEventListener('input', updateTotalLoss);
    
    function removeTrailingZeros(numberStr) {
        return numberStr.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); // Remove unnecessary decimal points
    }

    function calculateResults() {
        const tradeType = tradeTypeSelect.value;
        const leverage = parseFloat(leverageInput.value) || 0;
        const totalSize = parseFloat(totalSizeInput.value) || 0;
        const entryPrice = parseFloat(entryPriceInput.value) || 0;
        const stopLoss = parseFloat(stopLossInput.value) || 0;

        const tpInputs = document.querySelectorAll('#tpPrices input');
        const sellPercentInputs = document.querySelectorAll('#sellPercent input');
        const plInputs = document.querySelectorAll('#pl input');
        const rrInputs = document.querySelectorAll('#rr input');

        if (leverage === 0 || totalSize === 0 || entryPrice === 0 || stopLoss === 0) {
            return; // Exit if any of the required fields are not filled
        }

        let allTpFieldsFilled = true;
        tpInputs.forEach((tpInput) => {
            if (!tpInput.value) allTpFieldsFilled = false;
        });
        sellPercentInputs.forEach((sellPercentInput) => {
            if (!sellPercentInput.value) allTpFieldsFilled = false;
        });

        if (!allTpFieldsFilled) {
            return; // Exit if TP prices or sell percentages are not filled
        }

        const risk = Math.abs(entryPrice - stopLoss);
        let totalPL = 0;
        let totalRR = 0;

        tpInputs.forEach((tpInput, index) => {
            const tpPrice = parseFloat(tpInput.value) || 0;
            const sellPercent = parseFloat(sellPercentInputs[index].value) || 0;
            const positionClosed = parseFloat(positionClosedRow.children[index].querySelector('input').value) || 0;

            let priceDiff;
            if (tradeType === 'LONG') {
                priceDiff = tpPrice - entryPrice;
            } else {
                priceDiff = entryPrice - tpPrice;
            }

            const plAtTp = ((positionClosed / entryPrice) * priceDiff).toFixed(2);
            const rrAtTp = (priceDiff / risk).toFixed(2);

            plInputs[index].value = plAtTp;
            rrInputs[index].value = `1 : ${removeTrailingZeros(rrAtTp)}`;

            totalPL += parseFloat(plAtTp);
            totalRR += parseFloat(rrAtTp);
        });

        const averageRR = (totalRR / tpInputs.length).toFixed(2);

        // Update the total P/L and Average R:R ratio in the UI
        document.getElementById('totalPL').innerText = `Total Profit: ${totalPL.toFixed(2)}`;
        document.getElementById('averageRR').innerText = `Average R:R ratio is 1 : ${removeTrailingZeros(averageRR)}`;
    }

    function showErrorMessage(message) {
        errorMessage.innerText = message;
        errorMessage.style.display = 'block';
    }

    function hideErrorMessage() {
        errorMessage.innerText = '';
        errorMessage.style.display = 'none';
    }

    // Add event listeners for validation and calculation
    leverageInput.addEventListener('input', () => {
        calculatePositionClosed();
        calculateResults();
    });
    entryPriceInput.addEventListener('input', () => {
        validateFields();
        calculatePositionClosed();
        calculateResults();
    });
    stopLossInput.addEventListener('input', validateFields);
    totalSizeInput.addEventListener('input', () => {
        calculatePositionClosed();
        calculateResults();
    });

    tpCountSelect.addEventListener('change', updateRows);

    // Initialize the rows based on the current TP count
    updateRows();
});


