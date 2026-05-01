    const arrayOfObjects = [
        {name: "mortgage", amount: '1726.8', date: 'Feb 4, 2025'}, // add the object directly as is
        {name: "electricityBill", amount: '445.21', date: 'Jan 7, 2025'},
        {name: "DustinPayment", amount: '400', date: 'Dec 3, 2024'},
        {name: "DustinPayment", amount: '1000', date: 'Oct 7, 2024'},
        {name: "AndrewPayment", amount: '200', date: 'Nov 5, 2024'},
    ];    
    let arrayOfObjects2 = [];

    // let arrayOfObjects3 = [];

    // let arrayOfObjects2 = [
    //     {name: "mortgage", amount: '1726.8', date: 'Feb 4, 2025'}, // add the object directly as is
    //     {name: "electricityBill", amount: '445.21', date: 'Jan 7, 2025'},
    //     {name: "DustinPayment", amount: '400', date: 'Dec 3, 2024'},
    //     // {name: "DustinPayment", amount: '=400+1000', date: 'Dec 3, 2024'},
    //     // {name: "AndrewPayment", amount: '200', date: 'Nov 5, 2024'},
    // ];

export async function combineExpenses(arrayOfObjects, arrayOfObjects2) { // takes an array with repeating payment types like multiple Dustin payments, and an empty array?
    for (var i = 0; i < arrayOfObjects.length; i++) { // go through each object in repeating array
        let exists = false; // starting state for switch
        let length = arrayOfObjects2.length + 1; // if array2 length = 0, then no loop iterations. At least 1

        // **EITHER THIS BLOCK WILL EXECUTE, COMBINING TERMS THEN PUSHING**
        for (var j = 0; j < length; j++) { // for each element, compare to each element in second array; count is from from 0 to length of array2+1. 
            if (arrayOfObjects[i].name === arrayOfObjects2[j]?.name) { // if repeating array payment type is the same as array2...
                exists = true; // then it already exists
                if (arrayOfObjects2[j].amount.startsWith('=')) { // if the array2 amount is already a combined amount (starting with "=")...
                    const combinedAmounts = `${arrayOfObjects2[j].amount}+${arrayOfObjects[i].amount}` // then create a combined value of the two amounts
                    const combinedObject = {name: arrayOfObjects2[j]?.name, amount: combinedAmounts, date: `${arrayOfObjects2[j]?.date}, ${arrayOfObjects[i].date}`}; // and create a new object with the combined amount
                    arrayOfObjects2[j] = combinedObject; // replace that object element with the new combined object
                    break; // break out of the outer loop
                } else { // otherwise, the array 2 amount is not already of a combined type
                    const combinedAmounts = `=${arrayOfObjects2[j].amount}+${arrayOfObjects[i].amount}` // create new combo with the equal sign
                    const combinedObject = {name: arrayOfObjects2[j]?.name, amount: combinedAmounts, date: `${arrayOfObjects2[j]?.date}, ${arrayOfObjects[i].date}`}; // create new object
                    arrayOfObjects2[j] = combinedObject; // replace that object element with the combined object
                    break; // break out of the outer loop
                };

            };
        };

        // **OR THIS BLOCK WILL EXECUTE, JUST PUSHING TO NEW ARRAY**
        if (!exists) { // if name is not already present, push to the new array. If jumped here from line 25, then exists is still false, and !exists evaluates to true, allowing the push to happen
            arrayOfObjects2.push(arrayOfObjects[i]);
        };
    };
};
combineExpenses(arrayOfObjects, arrayOfObjects2)


