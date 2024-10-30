document.addEventListener("DOMContentLoaded", function () {
    // Get references to the buttons and table
    const addRowBtn = document.getElementById("addRowBtn");
    const submitBtn = document.getElementById("submitBtn");
    const coursesTable = document.getElementById("coursesTable").getElementsByTagName("tbody")[0];

    // Validation functions
    function validateCourseName(name) {
        return /^[a-zA-Z0-9\s]*$/.test(name);
    }

    function validateDates(startDate, endDate) {
        if (!endDate) return true; // End date is optional
        return new Date(endDate) >= new Date(startDate);
    }

    function validateTimes(startTime, endTime) {
        if (!startTime || !endTime) return false;
        return startTime < endTime;
    }

    function validateMaxParticipants(value) {
        return Number.isInteger(Number(value)) && Number(value) > 0;
    }

    function validateRequired(value) {
        return value.trim() !== '';
    }

    // Function to show error message
    function showError(input, message) {
        // Remove existing error message if any
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error class to input
        input.classList.add('error');

        // Create and append error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '12px';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    // Function to remove error message
    function removeError(input) {
        input.classList.remove('error');
        const errorMessage = input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Function to validate a single row
    function validateRow(row) {
        let isValid = true;
        const inputs = row.getElementsByTagName('input');
        const selects = row.getElementsByTagName('select');

        // Get all required inputs
        const courseName = inputs[0].value;
        const startDate = inputs[1].value;
        const endDate = inputs[2].value;
        const startTime = inputs[3].value;
        const endTime = inputs[4].value;
        const keyPoints = inputs[5].value;
        const trainer = inputs[6].value;
        const audience = inputs[7].value;
        const maxParticipants = inputs[8].value;

        // Validate course name (alphanumeric)
        if (!validateRequired(courseName)) {
            showError(inputs[0], 'Course name is required');
            isValid = false;
        } else if (!validateCourseName(courseName)) {
            showError(inputs[0], 'Only letters and numbers are allowed');
            isValid = false;
        } else {
            removeError(inputs[0]);
        }

        // Validate required fields
        const requiredFields = [
            { input: inputs[1], name: 'Start date' },
            { input: inputs[3], name: 'Start time' },
            { input: inputs[4], name: 'End time' },
            { input: inputs[5], name: 'Key points' },
            { input: inputs[6], name: 'Trainer' },
            { input: inputs[7], name: 'Audience' },
            { input: inputs[8], name: 'Max participants' }
        ];

        requiredFields.forEach(field => {
            if (!validateRequired(field.input.value)) {
                showError(field.input, `${field.name} is required`);
                isValid = false;
            } else {
                removeError(field.input);
            }
        });

        // Validate dates
        if (startDate && endDate && !validateDates(startDate, endDate)) {
            showError(inputs[2], 'End date must be after or same as start date');
            isValid = false;
        } else {
            removeError(inputs[2]);
        }

        // Validate times
        if (startTime && endTime && !validateTimes(startTime, endTime)) {
            showError(inputs[4], 'End time must be after start time');
            isValid = false;
        } else if (startTime && endTime) {
            removeError(inputs[4]);
        }

        // Validate max participants
        if (maxParticipants && !validateMaxParticipants(maxParticipants)) {
            showError(inputs[8], 'Must be a positive whole number');
            isValid = false;
        } else if (maxParticipants) {
            removeError(inputs[8]);
        }

        return isValid;
    }

    // Function to add a new row to the table
    function addRow() {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="text" class="course-name" placeholder="Course Name"></td>
            <td><input type="date" class="date-input"></td>
            <td><input type="date" class="date-input"></td>
            <td><input type="time" class="time-input"></td>
            <td><input type="time" class="time-input"></td>
            <td><input type="text" class="key-points" placeholder="Key Points"></td>
            <td><input type="text" class="trainer-name" placeholder="Trainer Name"></td>
            <td><input type="text" class="audience" placeholder="Audience"></td>
            <td><input type="number" class="max-participants" placeholder="Max Participants"></td>
            <td>
                <select>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>
            </td>
            <td>
                <button class="delete-btn">-</button>
            </td>
        `;

        // Add validation listeners to all inputs in the new row
        const inputs = newRow.getElementsByTagName('input');
        Array.from(inputs).forEach(input => {
            input.addEventListener('input', function() {
                validateRow(newRow);
            });
        });

        // Append the new row to the table body
        coursesTable.appendChild(newRow);

        // Add event listener to the delete button in the new row
        newRow.querySelector(".delete-btn").addEventListener("click", function () {
            if (coursesTable.children.length > 1) {
                deleteRow(newRow);
            } else {
                alert("Cannot delete the last row!");
            }
        });
    }

    // Function to delete a row
    function deleteRow(row) {
        coursesTable.removeChild(row);
    }

    // Function to collect and validate all data on submit
    function handleSubmit() {
        let isValid = true;
        const rows = coursesTable.getElementsByTagName('tr');

        // Validate all rows
        Array.from(rows).forEach(row => {
            if (!validateRow(row)) {
                isValid = false;
            }
        });

        if (!isValid) {
            alert('Please fill all details correctly before submitting.');
            return;
        }

        // If valid, collect all data
        const coursesData = Array.from(rows).map(row => {
            const inputs = row.getElementsByTagName('input');
            const select = row.querySelector('select');
            
            return {
                courseName: inputs[0].value,
                startDate: inputs[1].value,
                endDate: inputs[2].value,
                startTime: inputs[3].value,
                endTime: inputs[4].value,
                keyPoints: inputs[5].value,
                trainer: inputs[6].value,
                audience: inputs[7].value,
                maxParticipants: inputs[8].value,
                mode: select.value
            };
        });

        console.log('Submitted data:', coursesData);
        alert('Data submitted successfully!');
    }

    // Add event listeners
    addRowBtn.addEventListener("click", addRow);
    submitBtn.addEventListener("click", handleSubmit);

    // Add event listeners to existing delete buttons
    document.querySelectorAll(".delete-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const row = button.closest("tr");
            if (coursesTable.children.length > 1) {
                deleteRow(row);
            } else {
                alert("Cannot delete the last row!");
            }
        });
    });

    // Add validation listeners to existing inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            validateRow(this.closest('tr'));
        });
    });

    // Add some basic CSS for validation
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border: 1px solid red !important;
        }
        .error-message {
            color: red;
            font-size: 12px;
            margin-top: 4px;
        }
    `;
    document.head.appendChild(style);
});

