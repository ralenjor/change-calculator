import { Validator, sanitize } from './src/utils/validator.js';

let dollars = 0;
let quarters = 0;
let dimes = 0;
let nickels = 0;
let pennies = 0;



function calculateChange(amountDue, amountReceived){
    let change = amountReceived - amountDue;
    let originalChange = change;
    change *= 100;
    dollars = Math.floor(change / 100);
    change = change - (dollars * 100);
    quarters = Math.floor(change / 25);
    change = change - (quarters * 25);
    dimes = Math.floor(change / 10);
    change = change - (dimes * 10);
    nickels = Math.floor(change / 5);
    change = change - (nickels * 5);
    pennies = Math.round(change);
    const changeArray = [dollars, quarters, dimes, nickels, pennies];
    return changeArray;

}

function validateInputs(amountDue, amountReceived){
    const dueResult = new Validator(amountDue, "Total Cost")
        .required()
        .isNumber()
        .min(0.01)
        .validate();

    const receivedResult = new Validator(amountReceived, "Amount Received")
        .required()
        .isNumber()
        .min(0.01)
        .validate();

    const errors = [...dueResult.errors, ...receivedResult.errors];

    // Extra business check logic, can't give less than cost
    if (dueResult.valid && receivedResult.valid) {
        if (Number(amountReceived) < Number(amountDue)) {
            errors.push("Amount received cannot be less than the total cost.");

        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function handleClickEvent(e) {

    // get raw values as strings
    const rawDue = document.getElementById('amount-due').value;
    const rawReceived = document.getElementById('amount-received').value;

    // sanitize values
    const cleanDue = sanitize(rawDue);
    const cleanReceived = sanitize(rawReceived);

    // validate
    const validation = validateInputs(cleanDue, cleanReceived);

    if (!validation.valid) {
        // show errors and stop
        document.getElementById('output').textContent = '';
        document.getElementById('change-due').textContent = validation.errors.join(' | ');
        return;
    }

    // clear previous errors
    document.getElementById('change-due').textContent = '';

    // numbers cleared safe
    const amountDue = Number(cleanDue);
    const amountReceived = Number(cleanReceived);
    const totalChange = Number(amountReceived - amountDue).toFixed(2);
    const changeArray = calculateChange(amountDue, amountReceived);

    document.getElementById('output').innerHTML = 
    `<h2 style="margin-bottom: 10px;">Change Due: $${totalChange} </h2> 
    <p>Dollars:     ${changeArray[0]}</p>
    <p>Quarters:    ${changeArray[1]}</p>
    <p>Dimes:       ${changeArray[2]}</p>
    <p>Nickels:     ${changeArray[3]}</p>
    <p>Pennies:     ${changeArray[4]}`
}

    document.getElementById('calculate-change').onclick = handleClickEvent;

