let config = {
    duoEndpoint: 'https://duo.nl/particulier/payment-dates.jsp',
    timeElement: document.getElementById('isItTime'),
    infoElement: document.getElementById('moreInfo'),
    localStorageKey: 'ihatvs_v3'
}

// Retrieves the payment dates from duo.nl and caches the result. Repeat if the dates from the cache are in the past.
var app = function(passedConfig) {
    let config = passedConfig,
    dateToday = moment().startOf('day'),
    paymentDates = [];

    function Start() {
        if(!UpdateLocalStorage()){
            return;
        }
        
        // Check if it's already the payment date.
        if(dateToday.isSame(paymentDates[0])) {
            config.timeElement.innerHTML = 'Ja!';
            config.timeElement.style.color = '#2ecc71';
            config.infoElement.innerHTML = 'Dank u ome Duo!'
        }
        else {
            let daysTillStufi = paymentDates[0].diff(dateToday, 'days');
    
            config.timeElement.innerHTML = 'Nee!';
            config.timeElement.style.color = '#e74c3c';
    
            switch (daysTillStufi) {
                case 1:
                    config.infoElement.innerHTML = 'Nog één dag te gaan tot de ' + paymentDates[0].date() + 'e, hou vol!';
                    break;
                default:
                    config.infoElement.innerHTML = 'Nog ' + daysTillStufi + ' dagen te gaan tot de ' + paymentDates[0].date() + 'e, hou vol!';
                    break;
            }
        }
    }
    
    function UpdateLocalStorage() {
        if (localStorage.getItem(config.localStorageKey) === null) {
            PopulateDates();
            return false;
        }
        
        let cachedDates = ParseLocalStorageToDates();
    
        // Check if all the cached dates are in the past.
        if(moment(cachedDates[cachedDates.length - 1]).isBefore(dateToday)){
            PopulateDates();
            cachedDates = ParseLocalStorageToDates();
        }
    
        // Remove all dates in the past since duo doesn't do this after a date has passed.
        for(let i = 0; i < cachedDates.length; i++) {
            if(moment(cachedDates[i]).isBefore(dateToday)){
                cachedDates.shift();
                i--;
                continue;
            }
    
            break;
        }
    
        paymentDates = cachedDates;
        localStorage.setItem(config.localStorageKey, JSON.stringify(cachedDates));
    
        return true;
    }
    
    // Gets json dates from the local storage and parses them back to objects.
    function ParseLocalStorageToDates() {
        let datesJson = JSON.parse(localStorage.getItem(config.localStorageKey)),
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
            url: config.duoEndpoint,
            success: function(data) {
                let $duoHtml = $(data);
                
    
                // Get the payment dates
                let dateObjects = CreatePaymentDates($duoHtml);
                localStorage.setItem(config.localStorageKey, JSON.stringify(dateObjects));
    
                Start();
            }
        });
    }
    
    // Duo provides a list with string dates, this method converts those to date objects.
    function CreatePaymentDates($duoHtml){
        let convertedDates = [],
            currentYear = dateToday.year(),
            payYearSelector = '#payment-dates-' + dateToday.year(),
            $paymentDateStrings = $duoHtml.find(payYearSelector).parent().next('div').find('ul').find('li')
        
    
        $paymentDateStrings.each(function (index, date) {
            let paymentDate = moment(date.innerText + " " + currentYear, "DD MMMM YYYY");
            convertedDates.push(paymentDate);

            if(paymentDate.month() === 11) {
                currentYear++;
            }
        });
    
        return convertedDates;
    }

    return {
        Start: Start
    }
}

app(config).Start();