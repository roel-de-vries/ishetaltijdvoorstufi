let config = {
    apiEndpoint: `/.netlify/functions/scrape-duo`,
    timeElement: document.getElementById('isItTime'),
    infoElement: document.getElementById('moreInfo'),
    localStorageKey: 'ihatvs_v5'
}

var app = function(passedConfig) {
    const dateTodayFull = new Date();

    let config = passedConfig,
    dateToday = new Date(dateTodayFull.getFullYear(), dateTodayFull.getMonth(), dateTodayFull.getDate()),
    paymentDates = [];

    function Start() {
        if(!UpdateLocalStorage()){
            return;
        }
        
        if(dateToday == paymentDates[0]) {
            config.timeElement.innerHTML = 'Ja!';
            config.timeElement.style.color = '#2ecc71';
            config.infoElement.innerHTML = 'Dank u ome Duo!'
        }
        else {
            const diffInMs = paymentDates[0] - dateToday
            const daysTillStufi = diffInMs / (1000 * 60 * 60 * 24);

            config.timeElement.innerHTML = 'Nee!';
            config.timeElement.style.color = '#e74c3c';
    
            switch (daysTillStufi) {
                case 1:
                    config.infoElement.innerHTML = 'Nog één dag te gaan tot de ' + paymentDates[0].getDate() + 'e, hou vol!';
                    break;
                default:
                    config.infoElement.innerHTML = 'Nog ' + daysTillStufi + ' dagen te gaan tot de ' + paymentDates[0].getDate() + 'e, hou vol!';
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
    
        if(cachedDates[cachedDates.length - 1] < dateToday){
            PopulateDates();
            cachedDates = ParseLocalStorageToDates();
        }
    
        // Remove all dates in the past since duo doesn't do this after a date has passed.
        for(let i = 0; i < cachedDates.length; i++) {
            if(cachedDates[i] < dateToday){
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
    
    function ParseLocalStorageToDates() {
        let datesJson = JSON.parse(localStorage.getItem(config.localStorageKey)),
        dateObjects = [];

        datesJson.forEach(function(date) {
            dateObjects.push(new Date(date));
        });
    
        return dateObjects;
    }
    
    function PopulateDates() {
        fetch(config.apiEndpoint)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem(config.localStorageKey, JSON.stringify(data));
            Start();
        })
        .catch((err) => console.warn('Something went wrong while retrieving the DUO dates.', err));
    }

    return {
        Start: Start
    }
}

app(config).Start();