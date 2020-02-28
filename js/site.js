// Retrieves the payment dates from duo.nl and caches the result. Repeat if the dates from the cache are in the past.
const duoPage = 'https://duo.nl/particulier/footer-engels/service/payment-dates.jsp';

var dateToday = moment().startOf('day'),
daysTillStufi = 0,
isItTimeElement = document.getElementById('isItTime'),
moreInfoElement = document.getElementById('moreInfo'),
paymentDates;

StartApp();

function StartApp() {
    if(!UpdateLocalStorage()){
        return;
    }
    
    // Check if it's already stufi time
    if(dateToday.isSame(paymentDates[0])) {
        isItTimeElement.innerHTML = 'Ja!';
        isItTimeElement.style.color = '#2ecc71';
        moreInfoElement.innerHTML = 'Dank u ome Duo!'
    }
    else {
        daysTillStufi = paymentDates[0].diff(dateToday, 'days');

        isItTimeElement.innerHTML = 'Nee!';
        isItTimeElement.style.color = '#e74c3c';

        switch (daysTillStufi) {
            case 1:
                moreInfoElement.innerHTML = 'Nog één dag te gaan tot de ' + paymentDates[0].date() + 'e, hou vol!';
                break;
            default:
                moreInfoElement.innerHTML = 'Nog ' + daysTillStufi + ' dagen te gaan tot de ' + paymentDates[0].date() + 'e, hou vol!';
                break;
        }
    }
}

function UpdateLocalStorage() {
    if (localStorage.getItem('ihatvs') === null) {
        PopulateDates();
        return false;
    }
    
    let cachedDates = ParseLocalStorageToDates();

    // Chech if the cached dates are in the past.
    if(moment(cachedDates[cachedDates.length - 1]).isBefore(dateToday)){
        PopulateDates();
        cachedDates = ParseLocalStorageToDates();
    }

    // Remove all dates in the past since duo doesn't do this after each date has passed.
    for(let i = 0; i < cachedDates.length; i++) {
        if(moment(cachedDates[i]).isBefore(dateToday)){
            cachedDates.shift();
            i--;
            continue;
        }

        break;
    }

    paymentDates = cachedDates;

    return true;
}

// Gets json dates from the local storage and parses them back to objects.
function ParseLocalStorageToDates() {
    let datesJson = JSON.parse(localStorage.getItem('ihatvs')),
    dateObjects = [];

    datesJson.forEach(function(date) {
        dateObjects.push(moment(date));
    });

    return dateObjects;
}

// Fills the local storage with the dates retrieved from duo.
function PopulateDates() {
    // Uses google apps script as proxy to retrieve the html from DUO.
    $.ajax({
        crossOrigin: true,
        url: duoPage,
        success: function(data) {
            let $duoHtml = $(data),
            payYearSelector = '#payment-dates-' + dateToday.year(),
            $paymentDateList = $duoHtml.find(payYearSelector).siblings('ul').find('li');

            // Get the payment dates
            let dateObjects = CreatePaymentDates($paymentDateList);

            localStorage.setItem('ihatvs', JSON.stringify(dateObjects));

            StartApp();
        }
    });
}

// Duo provides a list with string dates, this method converts those to date objects.
function CreatePaymentDates($paymentDateStrings){
    let convertedDates = [],
    currentYear = dateToday.year();

    $paymentDateStrings.each(function (index, date) {
        let paymentDate = moment(date.innerText + " " + currentYear, "DD MMMM YYYY");
        convertedDates.push(paymentDate);
    });

    return convertedDates;
}