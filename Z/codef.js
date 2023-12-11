const fs = require('fs');
const csv = require('csv-parser');
const readline = require('readline');

// Function to calculate probabilities for each class and attribute value
function train(dataset) {
   const classCounts = {};
   const attributeCounts = {};
   let totalSamples = 0;

   for (const row of dataset) {
       const classVal = row[0];
       if (!classCounts[classVal]) {
           classCounts[classVal] = 0;
       }
       classCounts[classVal] += row[row.length - 1]; // add total count of each class
       totalSamples += row[row.length - 1]; // add total count of samples

       for (let i = 1; i < row.length - 1; i++) {
           if (!attributeCounts[i]) {
               attributeCounts[i] = {};
           }
           if (!attributeCounts[i][`${i},${classVal}`]) {
               attributeCounts[i][`${i},${classVal}`] = 0;
           }
           attributeCounts[i][`${i},${classVal}`] += row[i]; // add count of each attribute for each class
       }
   }

   return { classCounts, attributeCounts, totalSamples };
}

// Function to predict class for a given instance
function predict(classCounts, attributeCounts, totalSamples, instance) {
   const classProbs = {};
   for (const classVal in classCounts) {
       let prob = classCounts[classVal] / totalSamples; // prior probability
       for (let i = 0; i < instance.length; i++) {
           const count = attributeCounts[i + 1][`${i + 1},${classVal}`] || 0;
           prob *= (count / classCounts[classVal]); // likelihood
       }
       classProbs[classVal] = prob;
   }
   return classProbs;
}

// Read the dataset from a CSV file
const dataset = [];
fs.createReadStream('fruits.csv')
   .pipe(csv())
   .on('data', (row) => {
       const values = Object.values(row);
       const fruit = values.shift();
       dataset.push([fruit, ...values.map(v => parseInt(v))]);
   })
   .on('end', () => {
       const { classCounts, attributeCounts, totalSamples } = train(dataset);

       // Take the fruit attributes as input from the user
       const readlineInterface = readline.createInterface({
           input: process.stdin,
           output: process.stdout
       });

       readlineInterface.question("Enter the fruit attributes (comma-separated values): ", input => {
           const testInstance = input.split(',').map(value => parseInt(value.trim()));
           const classProbs = predict(classCounts, attributeCounts, totalSamples, testInstance);
           const predictedClass = Object.keys(classProbs).reduce((a, b) => classProbs[a] > classProbs[b] ? a : b);

           console.log(`Predicted class: ${predictedClass}`);
           console.log(`Probabilities:`);
           for (const classVal in classProbs) {
               console.log(`Probability (${classVal}): ${classProbs[classVal].toFixed(4)}`);
           }

           readlineInterface.close();
       });
   });
