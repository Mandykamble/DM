// Function to calculate probabilities for each class and attribute value
function train(dataset) {
    const classCounts = {};
    const attributeCounts = {};
    let totalSamples = 0;

    for (const row of dataset) {
        const classVal = row[row.length - 1];
        if (!classCounts[classVal]) {
            classCounts[classVal] = 0;
        }
        classCounts[classVal]++;
        totalSamples++;

        for (let i = 0; i < row.length - 1; i++) {
            if (!attributeCounts[i]) {
                attributeCounts[i] = {};
            }
            if (!attributeCounts[i][`${row[i]},${classVal}`]) {
                attributeCounts[i][`${row[i]},${classVal}`] = 0;
            }
            attributeCounts[i][`${row[i]},${classVal}`]++;
        }
    }

    return { classCounts, attributeCounts, totalSamples };
}

// Function to predict class for a given instance
function predict(classCounts, attributeCounts, totalSamples, instance) {
    const classProbs = {};

    for (const classVal in classCounts) {
        let prob = 1.0;
        for (let i = 0; i < instance.length; i++) {
            const count = attributeCounts[i][`${instance[i]},${classVal}`] || 0;
            prob *= (count + 1) / (classCounts[classVal] + Object.keys(attributeCounts[i]).length);
        }

        classProbs[classVal] = prob * classCounts[classVal] / totalSamples;
    }

    const probYes = classProbs['Yes'] / (classProbs['Yes'] + classProbs['No']);
    const probNo = classProbs['No'] / (classProbs['Yes'] + classProbs['No']);

    return [Object.keys(classProbs).reduce((a, b) => classProbs[a] > classProbs[b] ? a : b), probYes, probNo];
}

function readCSV(filename) {
    const fs = require('fs');
    const file = fs.readFileSync(filename, 'utf-8');
    const rows = file.trim().split('\n');
    const dataset = rows.map(row => row.trim().split(','));

    return dataset;
}

const filename = 'input_data.csv';
const dataset = readCSV(filename);

const { classCounts, attributeCounts, totalSamples } = train(dataset);

// Take test_instance as input from the user
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("Enter the test instance (comma-separated values): ", input => {
    const testInstance = input.split(',').map(value => value.trim());
    const [predictedClass, probYes, probNo] = predict(classCounts, attributeCounts, totalSamples, testInstance);

    console.log(`Predicted class: ${predictedClass}`);
    console.log(`Probability (Yes): ${probYes.toFixed(4)}`);
    console.log(`Probability (No): ${probNo.toFixed(4)}`);

    readline.close();
});
