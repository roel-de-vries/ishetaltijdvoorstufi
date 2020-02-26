// Retrieves the payment dates from duo.nl and caches the result. Repeat if the dates from the cache are in the past.

const duoPage = 'https://duo.nl/particulier/footer-engels/service/payment-dates.jsp';

$.ajax({
    crossOrigin: true,
    url: duoPage,
    success: function(data) {
        console.log(data);
    }
});

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
    if(dateToday.getDate() === stufiDate.getDate()) {
        isItTimeElement.innerHTML = 'Ja!';
        isItTimeElement.style.color = '#2ecc71';
        moreInfoElement.innerHTML = 'Dank u ome Duo!'
    }
    else {
        daysTillStufi = CalculateDaysDifference(dateToday, stufiDate);

        isItTimeElement.innerHTML = 'Nee!';
        isItTimeElement.style.color = '#e74c3c';

        switch (daysTillStufi) {
            case 0:
                moreInfoElement.innerHTML = 'Nog een paar uur te gaan tot de ' + stufiDate.getDate() + 'e , hou vol!';
                break;
            case 1:
                moreInfoElement.innerHTML = 'Nog één dag te gaan tot de ' + stufiDate.getDate() + 'e, hou vol!';
                break;
            default:
                moreInfoElement.innerHTML = 'Nog ' + daysTillStufi + ' dagen te gaan tot de ' + stufiDate.getDate() + 'e, hou vol!';
                break;
        }
    }
}

function GetStufiDate() {
    var countDownDay = 24,
        dateHelper = new Date(dateToday.getFullYear(), dateToday.getMonth(), countDownDay);

    // Check if a date with a month offset needs to be calculated
    if(monthOffset) {
        dateHelper.setMonth(dateHelper.getMonth() + 1);
    }

    var dayOfWeek = dateHelper.getDay(),
    month = dateHelper.getMonth();

    // Check if 24th falls:
    // on a Sunday
    if(dayOfWeek === 0) {
        countDownDay = 22;
    }
    // on a Saturday
    else if(dayOfWeek === 6) {
        countDownDay = 23
    }
    // in December
    else if(month === 11) {
        // on a Monday
        if(dayOfWeek === 1) {
            countDownDay = 21;
        }
        else {
            countDownDay = 23;
        }
    }

    return new Date(dateHelper.getFullYear(), dateHelper.getMonth(), countDownDay);
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

    datesJson.each(function(index, date) {
        dateObjects.push(moment(date, 'DD-MM-YYYY'));
    })

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
    currentYear = dateToday.getFullYear;

    $paymentDateStrings.each(function (index, date) {
        let paymentDate = moment(date + " " + currentYear, "DD MMMM YYYY");
        convertedDates.push(paymentDate);
    });

    return convertedDates;
}

function CalculateDaysDifference(dateOne, dateTwo) {
    var oneDay = 24*60*60*1000;
    return Math.round(Math.abs(dateOne.getTime() - dateTwo.getTime()) / (oneDay));
}

