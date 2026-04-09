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

    // check logic, can't give less than cost
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

    // take raw values and strip any dollar signs that may exist
    const rawDue = document.getElementById('amount-due').value.replace('$', '');
    const rawReceived = document.getElementById('amount-received').value.replace('$', '');

    // sanitize values
    const cleanDue = sanitize(rawDue);
    const cleanReceived = sanitize(rawReceived);

    // validate
    const validation = validateInputs(cleanDue, cleanReceived);

    if (!validation.valid) {
        // show errors and stop
    document.getElementById('results-wrapper').style.display = 'block';
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

    document.getElementById('results-wrapper').style.display = 'block';

    document.getElementById('total-output').textContent   = `Change Due: $${totalChange}`;
    document.getElementById('dollars-output').textContent  = `${changeArray[0]}`;
    document.getElementById('quarters-output').textContent = `${changeArray[1]}`;
    document.getElementById('dimes-output').textContent    = `${changeArray[2]}`;
    document.getElementById('nickels-output').textContent  = `${changeArray[3]}`;
    document.getElementById('pennies-output').textContent  = `${changeArray[4]}`;
}

    document.getElementById('calculate-change').onclick = handleClickEvent;

