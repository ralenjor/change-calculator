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

function handleClickEvent(e) {
    const amountDue = Number(document.getElementById('amount-due').value);
    const amountReceived = Number(document.getElementById('amount-received').value);
    const totalChange = (amountReceived - amountDue).toFixed(2);
    changeArray = calculateChange(amountDue, amountReceived);

    document.getElementById('output').innerHTML = 
    `<h2 style="margin-bottom: 10px;">Change Due: $${totalChange} </h2> 
    <p>Dollars:     ${changeArray[0]}</p>
    <p>Quarters:    ${changeArray[1]}</p>
    <p>Dimes:       ${changeArray[2]}</p>
    <p>Nickels:     ${changeArray[3]}</p>
    <p>Pennies:     ${changeArray[4]}`
}

    document.getElementById('calculate-change').onclick = handleClickEvent;

